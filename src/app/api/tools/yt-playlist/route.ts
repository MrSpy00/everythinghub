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
  viewCount?: string;
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

/**
 * Strategy 1: Direct HTML Scrape of YouTube Playlist Page (extracting ytInitialData)
 * Extremely reliable for getting exact video durations, full metadata and title.
 */
async function fetchPlaylistViaHtml(playlistId: string): Promise<PlaylistData | null> {
  try {
    const cleanId = playlistId.replace(/^VL/, "");
    const url = `https://www.youtube.com/playlist?list=${cleanId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const dataMatch = html.match(/var ytInitialData\s*=\s*({[\s\S]+?});<\/script>/);
    if (!dataMatch) return null;

    const initialData = JSON.parse(dataMatch[1]);
    const videos: VideoInfo[] = [];
    let playlistTitle = "";
    let channelName = "";

    // Extract title & channel
    const sidebar =
      initialData?.sidebar?.playlistSidebarRenderer?.items?.[0]
        ?.playlistSidebarPrimaryInfoRenderer;
    const header = initialData?.header?.playlistHeaderRenderer;

    playlistTitle =
      header?.title?.simpleText ||
      header?.title?.runs?.[0]?.text ||
      sidebar?.title?.runs?.[0]?.text ||
      sidebar?.title?.simpleText ||
      "";

    const owner =
      initialData?.sidebar?.playlistSidebarRenderer?.items?.[1]
        ?.playlistSidebarSecondaryInfoRenderer?.videoOwner?.videoOwnerRenderer;
    channelName = owner?.title?.runs?.[0]?.text || "";

    // Recursive search for all playlistVideoRenderer items
    const findVideos = (obj: unknown): void => {
      if (!obj || typeof obj !== "object") return;
      const o = obj as Record<string, unknown>;

      if (o.playlistVideoRenderer) {
        const v = o.playlistVideoRenderer as Record<string, unknown>;
        const videoId = v.videoId as string;
        if (videoId) {
          const title =
            (v.title as { simpleText?: string; runs?: { text: string }[] })?.simpleText ||
            (v.title as { runs?: { text: string }[] })?.runs?.[0]?.text ||
            "Video";

          // Try multiple duration fields
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
          if (durationSeconds === 0 && Array.isArray(v.thumbnailOverlays)) {
            for (const overlay of v.thumbnailOverlays as Record<string, unknown>[]) {
              const timeOverlay = overlay?.thumbnailOverlayTimeStatusRenderer as
                | Record<string, unknown>
                | undefined;
              if (timeOverlay?.text) {
                const txt =
                  (timeOverlay.text as { simpleText?: string; runs?: { text: string }[] })
                    ?.simpleText ||
                  (timeOverlay.text as { runs?: { text: string }[] })?.runs?.[0]?.text;
                const parsed = parseTextDuration(txt);
                if (parsed > 0) {
                  durationSeconds = parsed;
                  break;
                }
              }
            }
          }

          const thumbnail =
            `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

          videos.push({
            videoId,
            title,
            durationSeconds,
            thumbnail,
            channelName:
              (v.shortBylineText as { runs?: { text: string }[] })?.runs?.[0]?.text ||
              channelName,
          });
        }
        return;
      }

      for (const val of Object.values(o)) {
        if (Array.isArray(val)) {
          val.forEach(findVideos);
        } else if (val && typeof val === "object") {
          findVideos(val);
        }
      }
    };

    findVideos(initialData);

    if (videos.length === 0) return null;

    const totalSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0);

    return {
      playlistId: cleanId,
      title: playlistTitle || `YouTube Playlist (${cleanId})`,
      videos,
      totalVideos: videos.length,
      totalSeconds,
      channelName,
    };
  } catch (err) {
    console.error("HTML scrape error:", err);
    return null;
  }
}

/**
 * Strategy 2: InnerTube WEB & ANDROID API
 */
async function fetchPlaylistViaInnerTube(playlistId: string): Promise<PlaylistData | null> {
  const cleanId = playlistId.replace(/^VL/, "");
  const videos: VideoInfo[] = [];
  let continuationToken: string | null = null;
  let playlistTitle = "";
  let channelName = "";
  let page = 0;
  const maxPages = 40;

  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    Referer: "https://www.youtube.com/",
    Origin: "https://www.youtube.com",
  };

  const baseBody = {
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20240401.00.00",
        hl: "tr",
        gl: "TR",
      },
    },
  };

  do {
    try {
      const url =
        "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
      const body =
        page === 0
          ? { ...baseBody, browseId: `VL${cleanId}` }
          : { ...baseBody, continuation: continuationToken };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
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
          header?.title?.simpleText || header?.title?.runs?.[0]?.text || "";
        channelName =
          data?.sidebar?.playlistSidebarRenderer?.items?.[0]
            ?.playlistSidebarPrimaryInfoRenderer?.videoOwner?.videoOwnerRenderer
            ?.title?.runs?.[0]?.text || "";
      }

      const extractVideos = (obj: unknown): void => {
        if (!obj || typeof obj !== "object") return;
        const o = obj as Record<string, unknown>;

        if (o.playlistVideoRenderer) {
          const v = o.playlistVideoRenderer as Record<string, unknown>;
          const videoId = v.videoId as string;
          if (videoId) {
            const title =
              (v.title as { simpleText?: string; runs?: { text: string }[] })
                ?.simpleText ||
              (v.title as { runs?: { text: string }[] })?.runs?.[0]?.text ||
              "Video";

            let durationSeconds = 0;
            if (v.lengthSeconds) {
              durationSeconds = parseInt(v.lengthSeconds as string, 10) || 0;
            }
            if (durationSeconds === 0 && v.lengthText) {
              const lt =
                (v.lengthText as { simpleText?: string; runs?: { text: string }[] })
                  ?.simpleText ||
                (v.lengthText as { runs?: { text: string }[] })?.runs?.[0]?.text;
              durationSeconds = parseTextDuration(lt);
            }
            if (durationSeconds === 0 && Array.isArray(v.thumbnailOverlays)) {
              for (const overlay of v.thumbnailOverlays as Record<string, unknown>[]) {
                const timeOverlay = overlay?.thumbnailOverlayTimeStatusRenderer as
                  | Record<string, unknown>
                  | undefined;
                if (timeOverlay?.text) {
                  const txt =
                    (timeOverlay.text as { simpleText?: string; runs?: { text: string }[] })
                      ?.simpleText ||
                    (timeOverlay.text as { runs?: { text: string }[] })?.runs?.[0]?.text;
                  const parsed = parseTextDuration(txt);
                  if (parsed > 0) {
                    durationSeconds = parsed;
                    break;
                  }
                }
              }
            }

            const thumbnail =
              `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

            videos.push({ videoId, title, durationSeconds, thumbnail });
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
            val.forEach(extractVideos);
          } else if (val && typeof val === "object") {
            extractVideos(val);
          }
        }
      };

      extractVideos(data);
      page++;
    } catch {
      break;
    }
  } while (continuationToken && page < maxPages);

  if (videos.length === 0) return null;

  const totalSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0);

  return {
    playlistId: cleanId,
    title: playlistTitle || `Playlist (${cleanId})`,
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

  // Sanitize playlist ID
  const cleanId = rawId
    .replace(/^https?:\/\/(?:www\.)?youtube\.com\/playlist\?list=/, "")
    .replace(/&.*$/, "")
    .replace(/^VL/, "")
    .trim();

  try {
    // 1. Try HTML scraping first (provides exact durations & rich metadata)
    const htmlData = await fetchPlaylistViaHtml(cleanId);
    if (htmlData && htmlData.videos.length > 0) {
      return NextResponse.json(htmlData);
    }

    // 2. Try InnerTube API
    const innerTubeData = await fetchPlaylistViaInnerTube(cleanId);
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
