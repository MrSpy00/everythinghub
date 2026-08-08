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
  const cleaned = text.trim();
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
 * Strategy 1: YouTube InnerTube Client API (WEB & ANDROID Contexts with lockupViewModel support)
 */
async function fetchViaInnerTube(cleanId: string): Promise<PlaylistData | null> {
  const videoMap = new Map<string, VideoInfo>();
  let continuationToken: string | null = null;
  let playlistTitle = "";
  let channelName = "";
  let page = 0;
  const maxPages = 20;

  const url =
    "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

  const clients = [
    {
      clientName: "WEB",
      clientVersion: "2.20240308.00.00",
      hl: "tr",
      gl: "TR",
    },
    {
      clientName: "ANDROID",
      clientVersion: "19.09.35",
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
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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

          // Modern YouTube Web lockupViewModel
          if (o.lockupViewModel) {
            const l = o.lockupViewModel as Record<string, unknown>;
            const videoId = (l.contentId as string) || "";
            if (videoId && !videoMap.has(videoId)) {
              const meta = l.metadata as Record<string, unknown> | undefined;
              const titleObj = meta?.lockupMetadataViewModel as Record<string, unknown> | undefined;
              const title =
                ((titleObj?.title as Record<string, unknown>)?.content as string) ||
                "Video";

              let durationSeconds = 0;
              const contentImg = l.contentImage as Record<string, unknown> | undefined;
              const thumbVM = contentImg?.thumbnailViewModel as Record<string, unknown> | undefined;
              const overlays = thumbVM?.overlays as Record<string, unknown>[] | undefined;

              if (Array.isArray(overlays)) {
                for (const ov of overlays) {
                  const bottomOverlay = ov?.thumbnailBottomOverlayViewModel as Record<string, unknown> | undefined;
                  const badges = bottomOverlay?.badges as Record<string, unknown>[] | undefined;
                  if (Array.isArray(badges)) {
                    for (const b of badges) {
                      const badgeVM = b?.thumbnailBadgeViewModel as Record<string, unknown> | undefined;
                      const txt = badgeVM?.text as string;
                      if (txt) {
                        const sec = parseTextDuration(txt);
                        if (sec > 0) {
                          durationSeconds = sec;
                          break;
                        }
                      }
                    }
                  }
                }
              }

              videoMap.set(videoId, {
                videoId,
                title,
                durationSeconds,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                channelName,
              });
            }
            return;
          }

          // Classic playlistVideoRenderer
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

          // Continuation items
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
 * Strategy 2: RSS Feed Fallback for YouTube Playlists
 */
async function fetchViaRssFeed(cleanId: string): Promise<PlaylistData | null> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${cleanId}`;
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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
    const videos: VideoInfo[] = [];

    for (const entry of entries) {
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const videoTitleMatch = entry.match(/<title>([^<]+)<\/title>/);

      if (videoIdMatch && videoTitleMatch) {
        const videoId = videoIdMatch[1].trim();
        const title = videoTitleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        videos.push({
          videoId,
          title,
          durationSeconds: 0, // RSS standard XML doesn't output durationSeconds directly
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channelName,
        });
      }
    }

    if (videos.length === 0) return null;

    return {
      playlistId: cleanId,
      title: playlistTitle || `Oynatma Listesi (${cleanId})`,
      videos,
      totalVideos: videos.length,
      totalSeconds: 0,
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
    // 1. Primary Engine: High-performance InnerTube multi-parser
    const innerTubeData = await fetchViaInnerTube(cleanId);
    if (innerTubeData && innerTubeData.videos.length > 0) {
      return NextResponse.json(innerTubeData);
    }

    // 2. Fallback Engine: YouTube RSS XML parser
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

