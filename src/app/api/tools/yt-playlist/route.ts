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
    if (typeof o.simpleText === "string") return o.simpleText;
    if (Array.isArray(o.runs)) {
      return (o.runs as { text: string }[]).map((r) => r?.text || "").join("");
    }
    if (o.accessibility && typeof o.accessibility === "object") {
      const acc = o.accessibility as Record<string, unknown>;
      const accData = acc.accessibilityData as Record<string, unknown>;
      if (typeof accData?.label === "string") return accData.label;
    }
  }
  return "";
}

function parseTextDuration(text?: string | null): number {
  if (!text) return 0;
  const cleaned = text.trim();

  // 1. ISO 8601 duration e.g. PT1H2M3S or 12M34S
  if (/PT|\d+[HMS]/i.test(cleaned)) {
    const hours = (cleaned.match(/(\d+)\s*H/i) || [])[1] || "0";
    const minutes = (cleaned.match(/(\d+)\s*M/i) || [])[1] || "0";
    const seconds = (cleaned.match(/(\d+)\s*S/i) || [])[1] || "0";
    const total = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    if (total > 0) return total;
  }

  // 2. Colon formatted e.g. "01:14:05" or "14:05" or "4:05"
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

  // 3. Turkish accessibility text e.g. "14 dakika, 5 saniye" or "1 saat, 20 dakika"
  const trHours = (cleaned.match(/(\d+)\s*saat/i) || [])[1] || "0";
  const trMinutes = (cleaned.match(/(\d+)\s*dakika/i) || [])[1] || "0";
  const trSeconds = (cleaned.match(/(\d+)\s*saniye/i) || [])[1] || "0";
  const trTotal = parseInt(trHours, 10) * 3600 + parseInt(trMinutes, 10) * 60 + parseInt(trSeconds, 10);
  if (trTotal > 0) return trTotal;

  // 4. English accessibility text e.g. "14 minutes, 5 seconds"
  const enHours = (cleaned.match(/(\d+)\s*hour/i) || [])[1] || "0";
  const enMinutes = (cleaned.match(/(\d+)\s*minute/i) || [])[1] || "0";
  const enSeconds = (cleaned.match(/(\d+)\s*second/i) || [])[1] || "0";
  const enTotal = parseInt(enHours, 10) * 3600 + parseInt(enMinutes, 10) * 60 + parseInt(enSeconds, 10);
  if (enTotal > 0) return enTotal;

  // 5. Raw seconds integer string e.g. "845"
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
 * Bulletproof duration extractor from any YouTube video JSON renderer
 */
function extractDurationFromObject(v: Record<string, unknown>): number {
  if (!v) return 0;

  // 1. Direct lengthSeconds property
  if (v.lengthSeconds) {
    const sec = parseInt(v.lengthSeconds as string, 10);
    if (!isNaN(sec) && sec > 0) return sec;
  }

  // 2. Direct lengthText property
  if (v.lengthText) {
    const txt = extractTextFromObject(v.lengthText);
    const parsed = parseTextDuration(txt);
    if (parsed > 0) return parsed;
  }

  // 3. thumbnailOverlays array
  if (Array.isArray(v.thumbnailOverlays)) {
    for (const overlay of v.thumbnailOverlays as Record<string, unknown>[]) {
      const timeRenderer = overlay?.thumbnailOverlayTimeStatusRenderer as Record<string, unknown>;
      if (timeRenderer?.text) {
        const txt = extractTextFromObject(timeRenderer.text);
        const parsed = parseTextDuration(txt);
        if (parsed > 0) return parsed;
      }
    }
  }

  // 4. lockupViewModel overlays
  if (v.contentImage && typeof v.contentImage === "object") {
    const contentImg = v.contentImage as Record<string, unknown>;
    const thumbVm = contentImg?.thumbnailViewModel as Record<string, unknown>;
    if (Array.isArray(thumbVm?.overlays)) {
      for (const overlay of thumbVm.overlays as Record<string, unknown>[]) {
        const bottomOverlay = overlay?.thumbnailBottomOverlayViewModel as Record<string, unknown>;
        if (Array.isArray(bottomOverlay?.badges)) {
          for (const badge of bottomOverlay.badges as Record<string, unknown>[]) {
            const badgeVm = badge?.thumbnailBadgeViewModel as Record<string, unknown>;
            const txt = extractTextFromObject(badgeVm?.text);
            const parsed = parseTextDuration(txt);
            if (parsed > 0) return parsed;
          }
        }
      }
    }
  }

  // 5. Deep regex search inside object string for length or duration text
  const str = JSON.stringify(v);
  const durMatch = str.match(/"simpleText":"(\d{1,2}:(?:\d{2}:)?\d{2})"/);
  if (durMatch) {
    const parsed = parseTextDuration(durMatch[1]);
    if (parsed > 0) return parsed;
  }

  const runsMatch = str.match(/"text":"(\d{1,2}:(?:\d{2}:)?\d{2})"/);
  if (runsMatch) {
    const parsed = parseTextDuration(runsMatch[1]);
    if (parsed > 0) return parsed;
  }

  return 0;
}

/**
 * Fast Single Video Duration Fallback Engine with 2.5s Timeout
 */
async function fetchSingleVideoDuration(videoId: string): Promise<number> {
  // Method 1: Fast TVHTML5 InnerTube Player API (200ms response)
  try {
    const res = await fetch(
      "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (SmartHub; SMART-TV; Tizen 6.0) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              clientName: "TVHTML5",
              clientVersion: "7.20230405.00.00",
              hl: "tr",
              gl: "TR",
            },
          },
        }),
        signal: AbortSignal.timeout(2500),
        next: { revalidate: 3600 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const secStr = data?.videoDetails?.lengthSeconds;
      if (secStr) {
        const sec = parseInt(secStr, 10);
        if (sec > 0) return sec;
      }
    }
  } catch {
    // ignore
  }

  // Method 2: YouTube Watch Page HTML
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8",
      },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const html = await res.text();
      const secMatch = html.match(/"lengthSeconds":"(\d+)"/);
      if (secMatch) return parseInt(secMatch[1], 10);

      const msMatch = html.match(/"approxDurationMs":"(\d+)"/);
      if (msMatch) return Math.round(parseInt(msMatch[1], 10) / 1000);

      const durMatch = html.match(/itemprop="duration"\s+content="([^"]+)"/);
      if (durMatch) {
        const parsed = parseTextDuration(durMatch[1]);
        if (parsed > 0) return parsed;
      }
    }
  } catch {
    // ignore
  }

  return 0;
}

/**
 * Enriches missing video durations concurrently in parallel batches
 */
async function enrichMissingDurations(videos: VideoInfo[]): Promise<VideoInfo[]> {
  const needsEnrichment = videos.filter((v) => v.durationSeconds <= 0);
  if (needsEnrichment.length === 0) return videos;

  const enrichedMap = new Map<string, number>();

  const batchSize = 15;
  for (let i = 0; i < needsEnrichment.length; i += batchSize) {
    const batch = needsEnrichment.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (v) => {
        const sec = await fetchSingleVideoDuration(v.videoId);
        return { videoId: v.videoId, durationSeconds: sec };
      })
    );
    results.forEach((r) => enrichedMap.set(r.videoId, r.durationSeconds));
  }

  return videos.map((v) => ({
    ...v,
    durationSeconds: v.durationSeconds > 0 ? v.durationSeconds : enrichedMap.get(v.videoId) || 0,
  }));
}

/**
 * Strategy 1: Direct YouTube Playlist Page HTML Scrape (`ytInitialData`)
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
      signal: AbortSignal.timeout(5000),
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

    const extractFromObj = (obj: unknown): void => {
      if (!obj || typeof obj !== "object") return;
      const o = obj as Record<string, unknown>;

      if (o.playlistVideoRenderer) {
        const v = o.playlistVideoRenderer as Record<string, unknown>;
        const videoId = v.videoId as string;
        if (videoId && !videoMap.has(videoId)) {
          const title =
            (v.title as { simpleText?: string; runs?: { text: string }[] })?.simpleText ||
            (v.title as { runs?: { text: string }[] })?.runs?.[0]?.text ||
            "Video";

          const durationSeconds = extractDurationFromObject(v);

          videoMap.set(videoId, {
            videoId,
            title,
            durationSeconds,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
            channelName:
              (v.shortBylineText as { runs?: { text: string }[] })?.runs?.[0]?.text || channelName,
          });
        }
        return;
      }

      for (const val of Object.values(o)) {
        if (Array.isArray(val)) {
          val.forEach(extractFromObj);
        } else if (val && typeof val === "object") {
          extractFromObj(val);
        }
      }
    };

    extractFromObj(data);

    let videos = Array.from(videoMap.values());
    if (videos.length === 0) return null;

    videos = await enrichMissingDurations(videos);
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
  const maxPages = 15;

  const url =
    "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

  const clients = [
    {
      clientName: "WEB",
      clientVersion: "2.20240501.00.00",
      hl: "tr",
      gl: "TR",
    },
    {
      clientName: "MWEB",
      clientVersion: "2.20240501.00.00",
      hl: "tr",
      gl: "TR",
    },
    {
      clientName: "ANDROID",
      clientVersion: "19.16.38",
      hl: "tr",
      gl: "TR",
    },
  ];

  for (const clientConfig of clients) {
    page = 0;
    continuationToken = null;

    const baseBody = {
      context: {
        client: clientConfig,
      },
    };

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
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(4000),
          next: { revalidate: 60 },
        });

        if (!res.ok) break;

        const data = await res.json();
        continuationToken = null;

        if (page === 0) {
          const header =
            data?.header?.playlistHeaderRenderer ||
            data?.sidebar?.playlistSidebarRenderer?.items?.[0]
              ?.playlistSidebarPrimaryInfoRenderer;
          playlistTitle =
            playlistTitle ||
            header?.title?.simpleText ||
            header?.title?.runs?.[0]?.text ||
            "";

          const owner =
            data?.sidebar?.playlistSidebarRenderer?.items?.[1]
              ?.playlistSidebarSecondaryInfoRenderer?.videoOwner?.videoOwnerRenderer;
          channelName =
            channelName ||
            owner?.title?.runs?.[0]?.text ||
            "";
        }

        const extractFromObj = (obj: unknown): void => {
          if (!obj || typeof obj !== "object") return;
          const o = obj as Record<string, unknown>;

          if (o.playlistVideoRenderer) {
            const v = o.playlistVideoRenderer as Record<string, unknown>;
            const videoId = v.videoId as string;
            if (videoId && !videoMap.has(videoId)) {
              const title =
                (v.title as { simpleText?: string; runs?: { text: string }[] })?.simpleText ||
                (v.title as { runs?: { text: string }[] })?.runs?.[0]?.text ||
                "Video";

              const durationSeconds = extractDurationFromObject(v);

              videoMap.set(videoId, {
                videoId,
                title,
                durationSeconds,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                channelName:
                  (v.shortBylineText as { runs?: { text: string }[] })?.runs?.[0]?.text || channelName,
              });
            }
            return;
          }

          if (o.continuationItemRenderer) {
            const c = o.continuationItemRenderer as Record<string, unknown>;
            const token =
              (c.continuationEndpoint as { continuationCommand?: { token?: string } })
                ?.continuationCommand?.token;
            if (token) continuationToken = token;
            return;
          }

          for (const val of Object.values(o)) {
            if (Array.isArray(val)) {
              val.forEach(extractFromObj);
            } else if (val && typeof val === "object") {
              extractFromObj(val);
            }
          }
        };

        extractFromObj(data);
        page++;
      } catch {
        break;
      }
    } while (continuationToken && page < maxPages);

    if (videoMap.size > 0) break;
  }

  let videos = Array.from(videoMap.values());
  if (videos.length === 0) return null;

  videos = await enrichMissingDurations(videos);
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

/**
 * Strategy 3: Public Invidious API Mirror Fallback
 */
async function fetchViaInvidious(cleanId: string): Promise<PlaylistData | null> {
  const instances = [
    "https://inv.tux.pizza",
    "https://invidious.nerdvpn.de",
    "https://vid.puffyan.us",
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/playlists/${cleanId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(3500),
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (!json || !Array.isArray(json.videos)) continue;

      let videos: VideoInfo[] = json.videos.map(
        (v: { videoId: string; title: string; lengthSeconds: number; author?: string }) => ({
          videoId: v.videoId,
          title: v.title || "Video",
          durationSeconds: v.lengthSeconds || 0,
          thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
          channelName: v.author || json.author,
        })
      );

      videos = await enrichMissingDurations(videos);
      const totalSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0);

      return {
        playlistId: cleanId,
        title: json.title || `Oynatma Listesi (${cleanId})`,
        videos,
        totalVideos: videos.length,
        totalSeconds,
        channelName: json.author,
      };
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Strategy 4: RSS Feed Fallback + Concurrent Duration Enrichment
 */
async function fetchViaRssFeed(cleanId: string): Promise<PlaylistData | null> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${cleanId}`;
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(3500),
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const xml = await res.text();

    const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/);
    const playlistTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";

    const authorMatch = xml.match(/<name>([\s\S]*?)<\/name>/);
    const channelName = authorMatch ? authorMatch[1].trim() : "";

    const entries = xml.split("<entry>").slice(1);
    const baseVideos: { videoId: string; title: string }[] = [];

    for (const entry of entries) {
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const videoTitleMatch = entry.match(/<title>([^<]+)<\/title>/);

      if (videoIdMatch && videoTitleMatch) {
        baseVideos.push({
          videoId: videoIdMatch[1].trim(),
          title: videoTitleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        });
      }
    }

    if (baseVideos.length === 0) return null;

    let enrichedVideos: VideoInfo[] = baseVideos.map((bv) => ({
      videoId: bv.videoId,
      title: bv.title,
      durationSeconds: 0,
      thumbnail: `https://i.ytimg.com/vi/${bv.videoId}/mqdefault.jpg`,
      channelName,
    }));

    enrichedVideos = await enrichMissingDurations(enrichedVideos);
    const totalSeconds = enrichedVideos.reduce((sum, v) => sum + v.durationSeconds, 0);

    return {
      playlistId: cleanId,
      title: playlistTitle || `Oynatma Listesi (${cleanId})`,
      videos: enrichedVideos,
      totalVideos: enrichedVideos.length,
      totalSeconds,
      channelName,
      fallback: true,
    };
  } catch {
    return null;
  }
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
    // 1. HTML Scrape Engine (Most reliable for ytInitialData)
    const htmlData = await fetchViaHtmlScrape(cleanId);
    if (htmlData && htmlData.videos.length > 0) {
      return NextResponse.json(htmlData);
    }

    // 2. InnerTube Client API
    const innerTubeData = await fetchViaInnerTube(cleanId);
    if (innerTubeData && innerTubeData.videos.length > 0) {
      return NextResponse.json(innerTubeData);
    }

    // 3. Invidious Mirror API
    const invidiousData = await fetchViaInvidious(cleanId);
    if (invidiousData && invidiousData.videos.length > 0) {
      return NextResponse.json(invidiousData);
    }

    // 4. RSS XML + Duration Enrichment Fallback
    const rssData = await fetchViaRssFeed(cleanId);
    if (rssData && rssData.videos.length > 0) {
      return NextResponse.json(rssData);
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
