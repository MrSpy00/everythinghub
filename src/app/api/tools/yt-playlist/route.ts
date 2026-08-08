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

function parseTextDuration(text?: string | null): number {
  if (!text) return 0;
  const cleaned = text.trim().replace(/^PT/i, "");
  
  // Handle ISO 8601 duration e.g. 1H2M3S or 12M34S
  if (/^\d+[HMS]/i.test(cleaned)) {
    const hours = (cleaned.match(/(\d+)H/i) || [])[1] || "0";
    const minutes = (cleaned.match(/(\d+)M/i) || [])[1] || "0";
    const seconds = (cleaned.match(/(\d+)S/i) || [])[1] || "0";
    return parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
  }

  const parts = cleaned.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 4) return parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
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
 * Strategy 1: Direct YouTube Playlist Page HTML Scrape (`ytInitialData`)
 * Most reliable for public playlists - bypasses InnerTube API blocks.
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

          let durationSeconds = 0;
          if (v.lengthSeconds) {
            durationSeconds = parseInt(v.lengthSeconds as string, 10) || 0;
          }
          if (durationSeconds === 0 && v.lengthText) {
            const lt =
              (v.lengthText as { simpleText?: string; runs?: { text: string }[] })?.simpleText ||
              (v.lengthText as { runs?: { text: string }[] })?.runs?.[0]?.text;
            durationSeconds = parseTextDuration(lt);
          }

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
 * Strategy 2: InnerTube Client API (WEB & ANDROID Contexts)
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

              let durationSeconds = 0;
              if (v.lengthSeconds) {
                durationSeconds = parseInt(v.lengthSeconds as string, 10) || 0;
              }
              if (durationSeconds === 0 && v.lengthText) {
                const lt =
                  (v.lengthText as { simpleText?: string; runs?: { text: string }[] })?.simpleText ||
                  (v.lengthText as { runs?: { text: string }[] })?.runs?.[0]?.text;
                durationSeconds = parseTextDuration(lt);
              }

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
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (!json || !Array.isArray(json.videos)) continue;

      const videos: VideoInfo[] = json.videos.map((v: { videoId: string; title: string; lengthSeconds: number; author?: string }) => ({
        videoId: v.videoId,
        title: v.title || "Video",
        durationSeconds: v.lengthSeconds || 0,
        thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        channelName: v.author || json.author,
      }));

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
 * Helper to fetch duration for a single video via YouTube oEmbed / page scrape
 */
async function fetchSingleVideoDuration(videoId: string): Promise<number> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 0;
    const html = await res.text();
    const durMatch = html.match(/itemprop="duration"\s+content="([^"]+)"/);
    if (durMatch) {
      return parseTextDuration(durMatch[1]);
    }
    const secMatch = html.match(/"lengthSeconds":"(\d+)"/);
    if (secMatch) {
      return parseInt(secMatch[1], 10);
    }
  } catch {
    // ignore
  }
  return 0;
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

    // Concurrently fetch durations for up to the first 25 videos if needed
    const enrichedVideos: VideoInfo[] = await Promise.all(
      baseVideos.map(async (bv) => {
        const durationSeconds = await fetchSingleVideoDuration(bv.videoId);
        return {
          videoId: bv.videoId,
          title: bv.title,
          durationSeconds,
          thumbnail: `https://i.ytimg.com/vi/${bv.videoId}/mqdefault.jpg`,
          channelName,
        };
      })
    );

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


