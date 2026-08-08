import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface VideoInfo {
  videoId: string;
  title: string;
  durationSeconds: number;
  thumbnail: string;
  channelName?: string;
}

interface PlaylistData {
  playlistId: string;
  title: string;
  videos: VideoInfo[];
  totalVideos: number;
  totalSeconds: number;
  channelName?: string;
  error?: string;
  fallback?: boolean;
}

function extractTextFromObject(obj: unknown): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    if (typeof o.content === "string") return o.content;
    if (typeof o.simpleText === "string") return o.simpleText;
    if (Array.isArray(o.runs)) {
      return (o.runs as { text?: string }[]).map((r) => r?.text || "").join("");
    }
    if (o.accessibility && typeof o.accessibility === "object") {
      const acc = o.accessibility as Record<string, unknown>;
      const accData = acc.accessibilityData as Record<string, unknown>;
      if (typeof accData?.label === "string") return accData.label;
    }
    if (typeof o.label === "string") return o.label;
  }
  return "";
}

function parseTextDuration(text?: string | null): number {
  if (!text) return 0;
  const cleaned = text.trim();

  // 1. Colon formatted e.g. "01:14:05" or "14:05" or "4:05"
  const colonMatch = cleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (colonMatch) {
    if (colonMatch[3] !== undefined) {
      const h = parseInt(colonMatch[1], 10);
      const m = parseInt(colonMatch[2], 10);
      const s = parseInt(colonMatch[3], 10);
      return h * 3600 + m * 60 + s;
    } else {
      const m = parseInt(colonMatch[1], 10);
      const s = parseInt(colonMatch[2], 10);
      return m * 60 + s;
    }
  }

  // 2. ISO 8601 duration e.g. PT1H2M3S or 12M34S
  if (/PT|\d+[HMS]/i.test(cleaned)) {
    const hours = (cleaned.match(/(\d+)\s*H/i) || [])[1] || "0";
    const minutes = (cleaned.match(/(\d+)\s*M/i) || [])[1] || "0";
    const seconds = (cleaned.match(/(\d+)\s*S/i) || [])[1] || "0";
    const total = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    if (total > 0) return total;
  }

  // 3. Turkish / English accessibility text e.g. "1 hour, 14 minutes" or "14 dakika 5 saniye"
  const hours = (cleaned.match(/(\d+)\s*(?:saat|hour|hr|h)/i) || [])[1] || "0";
  const minutes = (cleaned.match(/(\d+)\s*(?:dakika|minute|min|m)/i) || [])[1] || "0";
  const seconds = (cleaned.match(/(\d+)\s*(?:saniye|second|sec|s)/i) || [])[1] || "0";
  const total = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
  if (total > 0) return total;

  // 4. Raw seconds integer string e.g. "845"
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  return 0;
}

function extractPlaylistId(rawInput: string): string | null {
  const trimmed = decodeURIComponent(rawInput).trim();

  // Pattern 1: ?list=... or &list=...
  const matchParam = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  if (matchParam) return matchParam[1].replace(/^VL/, "");

  // Pattern 2: /playlist/...
  const matchPath = trimmed.match(/playlist\/([a-zA-Z0-9_-]+)/i);
  if (matchPath) return matchPath[1].replace(/^VL/, "");

  // Pattern 3: Raw ID string (PL..., UU..., RD..., OLAK..., etc.)
  const rawId = trimmed.replace(/^VL/, "");
  if (/^[a-zA-Z0-9_-]{10,}$/.test(rawId)) {
    return rawId;
  }

  return null;
}

/**
 * Universal video extractor for YouTube Initial Data & InnerTube JSON payloads
 */
function extractVideosFromPayload(data: unknown, videoMap: Map<string, VideoInfo>): string | null {
  let continuationToken: string | null = null;

  const scan = (obj: unknown): void => {
    if (!obj || typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;

    // Pattern 1: Classic playlistVideoRenderer
    if (o.playlistVideoRenderer) {
      const v = o.playlistVideoRenderer as Record<string, unknown>;
      const videoId = v.videoId as string;
      if (videoId && !videoMap.has(videoId)) {
        const title =
          (v.title as { simpleText?: string; runs?: { text: string }[] })?.simpleText ||
          (v.title as { runs?: { text: string }[] })?.runs?.map((r) => r.text).join("") ||
          "Video";

        let durationSeconds = 0;
        if (v.lengthSeconds) {
          durationSeconds = parseInt(v.lengthSeconds as string, 10) || 0;
        } else if (v.lengthText) {
          durationSeconds = parseTextDuration(extractTextFromObject(v.lengthText));
        }

        if (durationSeconds === 0 && Array.isArray(v.thumbnailOverlays)) {
          for (const overlay of v.thumbnailOverlays as Record<string, unknown>[]) {
            const timeRenderer = overlay?.thumbnailOverlayTimeStatusRenderer as Record<string, unknown>;
            if (timeRenderer?.text) {
              const sec = parseTextDuration(extractTextFromObject(timeRenderer.text));
              if (sec > 0) { durationSeconds = sec; break; }
            }
          }
        }

        videoMap.set(videoId, {
          videoId,
          title,
          durationSeconds,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channelName:
            (v.shortBylineText as { runs?: { text: string }[] })?.runs?.[0]?.text || "",
        });
      }
      return;
    }

    // Pattern 2: YouTube 2025/2026 lockupViewModel
    if (o.lockupViewModel) {
      const vm = o.lockupViewModel as Record<string, unknown>;
      const videoId = vm.contentId as string;
      if (videoId && (vm.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" || !vm.contentType) && !videoMap.has(videoId)) {
        const meta = vm.metadata as Record<string, unknown> | undefined;
        const lockupMeta = meta?.lockupMetadataViewModel as Record<string, unknown> | undefined;
        const titleObj = lockupMeta?.title as { content?: string } | undefined;
        const title =
          titleObj?.content ||
          extractTextFromObject((vm.rendererContext as Record<string, unknown> | undefined)?.accessibilityContext) ||
          "Video";

        let durationSeconds = 0;

        const contentImg = vm.contentImage as Record<string, unknown>;
        const thumbVm = contentImg?.thumbnailViewModel as Record<string, unknown>;
        if (Array.isArray(thumbVm?.overlays)) {
          for (const ov of thumbVm.overlays as Record<string, unknown>[]) {
            const bottomOverlay = ov?.thumbnailBottomOverlayViewModel as Record<string, unknown>;
            if (Array.isArray(bottomOverlay?.badges)) {
              for (const badge of bottomOverlay.badges as Record<string, unknown>[]) {
                const txt = extractTextFromObject(
                  (badge?.thumbnailBadgeViewModel as Record<string, unknown>)?.text
                );
                const sec = parseTextDuration(txt);
                if (sec > 0) { durationSeconds = sec; break; }
              }
            }
          }
        }

        if (durationSeconds === 0 && vm.rendererContext) {
          const accCtx = (vm.rendererContext as Record<string, unknown>).accessibilityContext as Record<string, unknown>;
          if (accCtx?.label) {
            durationSeconds = parseTextDuration(accCtx.label as string);
          }
        }

        videoMap.set(videoId, {
          videoId,
          title,
          durationSeconds,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channelName: "",
        });
      }
    }

    // Pattern 3: Continuation token
    if (o.continuationItemRenderer || o.continuationItemViewModel) {
      const c = (o.continuationItemRenderer || o.continuationItemViewModel) as Record<string, unknown>;
      const token =
        (c.continuationEndpoint as { continuationCommand?: { token?: string } })?.continuationCommand?.token ||
        (c.continuationEndpoint as { command?: { continuationCommand?: { token?: string } } })?.command?.continuationCommand?.token;
      if (token) continuationToken = token;
      return;
    }

    for (const val of Object.values(o)) {
      if (Array.isArray(val)) {
        val.forEach(scan);
      } else if (val && typeof val === "object") {
        scan(val);
      }
    }
  };

  scan(data);
  return continuationToken;
}

/**
 * Strategy 1: YouTube Playlist Page HTML Scrape (`ytInitialData`) with Continuation Paging
 */
async function fetchViaHtmlScrape(cleanId: string): Promise<PlaylistData | null> {
  try {
    const playlistUrl = `https://www.youtube.com/playlist?list=${cleanId}`;
    const res = await fetch(playlistUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const dataMatch = html.match(/(?:var\s+ytInitialData|window\["ytInitialData"\])\s*=\s*(\{[\s\S]+?\});\s*<\/script>/);
    if (!dataMatch) return null;

    const data = JSON.parse(dataMatch[1]);
    const videoMap = new Map<string, VideoInfo>();
    let playlistTitle = "";
    let channelName = "";

    // Extract title & channel from header
    const sidebar = data?.sidebar?.playlistSidebarRenderer?.items;
    if (Array.isArray(sidebar)) {
      const primary = sidebar[0]?.playlistSidebarPrimaryInfoRenderer;
      playlistTitle =
        primary?.title?.runs?.[0]?.text || primary?.title?.simpleText || "";
      const secondary = sidebar[1]?.playlistSidebarSecondaryInfoRenderer;
      channelName =
        secondary?.videoOwner?.videoOwnerRenderer?.title?.runs?.[0]?.text || "";
    }

    if (!playlistTitle) {
      const header = data?.header?.playlistHeaderRenderer;
      playlistTitle = header?.title?.runs?.[0]?.text || header?.title?.simpleText || "";
    }

    let continuationToken = extractVideosFromPayload(data, videoMap);
    let page = 1;
    const maxPages = 8; // Fetch up to 800+ videos

    // Continuation page fetching loop
    while (continuationToken && page < maxPages) {
      try {
        const browseRes = await fetch(
          "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
            body: JSON.stringify({
              continuation: continuationToken,
              context: {
                client: {
                  clientName: "WEB",
                  clientVersion: "2.20240501.00.00",
                  hl: "tr",
                  gl: "TR",
                },
              },
            }),
            signal: AbortSignal.timeout(3000),
          }
        );

        if (!browseRes.ok) break;
        const pageData = await browseRes.json();
        continuationToken = extractVideosFromPayload(pageData, videoMap);
        page++;
      } catch {
        break;
      }
    }

    const videos = Array.from(videoMap.values());
    if (videos.length === 0) return null;

    const totalSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0);

    return {
      playlistId: cleanId,
      title: playlistTitle || `Oynatma Listesi (${cleanId})`,
      videos,
      totalVideos: videos.length,
      totalSeconds,
      channelName,
    };
  } catch (err) {
    console.error("HTML Scrape error:", err);
    return null;
  }
}

/**
 * Strategy 2: InnerTube Client API (WEB, MWEB, ANDROID Contexts)
 */
async function fetchViaInnerTube(cleanId: string): Promise<PlaylistData | null> {
  const videoMap = new Map<string, VideoInfo>();
  let continuationToken: string | null = null;
  let playlistTitle = "";
  let channelName = "";
  let page = 0;
  const maxPages = 8;

  const url =
    "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

  const clients = [
    { clientName: "WEB", clientVersion: "2.20240501.00.00", hl: "tr", gl: "TR" },
    { clientName: "MWEB", clientVersion: "2.20240501.00.00", hl: "tr", gl: "TR" },
    { clientName: "ANDROID", clientVersion: "19.16.38", hl: "tr", gl: "TR" },
  ];

  for (const clientConfig of clients) {
    page = 0;
    continuationToken = null;

    const baseBody = { context: { client: clientConfig } };

    do {
      try {
        const body =
          page === 0
            ? { ...baseBody, browseId: `VL${cleanId}` }
            : { ...baseBody, continuation: continuationToken };

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3500),
        });

        if (!res.ok) break;

        const data = await res.json();
        if (page === 0) {
          const header =
            data?.header?.playlistHeaderRenderer ||
            data?.sidebar?.playlistSidebarRenderer?.items?.[0]?.playlistSidebarPrimaryInfoRenderer;
          playlistTitle =
            playlistTitle || header?.title?.simpleText || header?.title?.runs?.[0]?.text || "";
        }

        continuationToken = extractVideosFromPayload(data, videoMap);
        page++;
      } catch {
        break;
      }
    } while (continuationToken && page < maxPages);

    if (videoMap.size > 0) break;
  }

  const videos = Array.from(videoMap.values());
  if (videos.length === 0) return null;

  const totalSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0);

  return {
    playlistId: cleanId,
    title: playlistTitle || `Oynatma Listesi (${cleanId})`,
    videos,
    totalVideos: videos.length,
    totalSeconds,
    channelName,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("id");

  if (!rawId) {
    return NextResponse.json(
      { error: "Geçerli bir YouTube Playlist ID veya bağlantısı gerekli." },
      { status: 400 }
    );
  }

  const cleanId = extractPlaylistId(rawId);
  if (!cleanId) {
    return NextResponse.json(
      { error: "Geçerli bir YouTube oynatma listesi URL'si veya ID'si tespit edilemedi." },
      { status: 400 }
    );
  }

  try {
    // 1. HTML Scrape Engine with lockupViewModel & Continuation Pagination
    const htmlData = await fetchViaHtmlScrape(cleanId);
    if (htmlData && htmlData.videos.length > 0) {
      return NextResponse.json(htmlData);
    }

    // 2. InnerTube Client API
    const innerTubeData = await fetchViaInnerTube(cleanId);
    if (innerTubeData && innerTubeData.videos.length > 0) {
      return NextResponse.json(innerTubeData);
    }

    return NextResponse.json(
      {
        error:
          "YouTube oynatma listesi bulunamadı veya gizli/özel olarak ayarlanmış. Lütfen playlist'in herkese açık olduğundan emin olun.",
      },
      { status: 404 }
    );
  } catch (err) {
    console.error("YT Playlist API error:", err);
    return NextResponse.json(
      { error: "Oynatma listesi ayrıştırılırken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
