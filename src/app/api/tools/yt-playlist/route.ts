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
}

// Parse duration from string like "12:34" or "1:23:45"
function parseTextDuration(text: string): number {
  const parts = text.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

async function fetchPlaylistViaInnerTube(
  playlistId: string
): Promise<PlaylistData> {
  const videos: VideoInfo[] = [];
  let continuationToken: string | null = null;
  let playlistTitle = "";
  let channelName = "";
  let page = 0;
  const maxPages = 50; // safety limit

  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.youtube.com/",
    Origin: "https://www.youtube.com",
  };

  const baseBody = {
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20240101.00.00",
        hl: "en",
        gl: "US",
      },
    },
  };

  do {
    let body: object;
    let url: string;

    if (page === 0) {
      url =
        "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
      body = {
        ...baseBody,
        browseId: `VL${playlistId}`,
        params: "wgYCCAA%3D",
      };
    } else {
      url =
        "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
      body = {
        ...baseBody,
        continuation: continuationToken,
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) break;

    const data = await res.json();
    continuationToken = null;

    // Extract playlist metadata (first page only)
    if (page === 0) {
      try {
        const header =
          data?.header?.playlistHeaderRenderer ||
          data?.sidebar?.playlistSidebarRenderer?.items?.[0]
            ?.playlistSidebarPrimaryInfoRenderer;
        playlistTitle = header?.title?.simpleText || header?.title?.runs?.[0]?.text || "";
        channelName =
          data?.sidebar?.playlistSidebarRenderer?.items?.[0]
            ?.playlistSidebarPrimaryInfoRenderer?.videoOwner?.videoOwnerRenderer
            ?.title?.runs?.[0]?.text || "";
      } catch {
        // ignore
      }
    }

    // Extract videos from content
    const extractVideos = (obj: unknown): void => {
      if (!obj || typeof obj !== "object") return;
      const o = obj as Record<string, unknown>;

      if (o.playlistVideoRenderer) {
        const v = o.playlistVideoRenderer as Record<string, unknown>;
        const videoId = v.videoId as string;
        const title =
          (v.title as { simpleText?: string; runs?: { text: string }[] })
            ?.simpleText ||
          (v.title as { runs?: { text: string }[] })?.runs?.[0]?.text ||
          "Bilinmeyen";

        const lengthText =
          (v.lengthText as { simpleText?: string })?.simpleText || "0:00";
        const durationSeconds = parseTextDuration(lengthText);

        const thumbnail =
          `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

        if (videoId && durationSeconds >= 0) {
          videos.push({ videoId, title, durationSeconds, thumbnail });
        }
        return;
      }

      // Look for continuation token
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
  } while (continuationToken && page < maxPages);

  const totalSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0);

  return {
    playlistId,
    title: playlistTitle,
    videos,
    totalVideos: videos.length,
    totalSeconds,
    channelName,
  };
}

// Fallback: YouTube RSS feed (limited to ~15 videos but always works)
async function fetchPlaylistViaRSS(playlistId: string): Promise<Partial<PlaylistData>> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const res = await fetch(url);
    if (!res.ok) return {};

    const xml = await res.text();
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "";

    const entries = xml.matchAll(
      /<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<\/entry>/g
    );

    const videos: VideoInfo[] = [];
    for (const [, videoId, entryTitle] of entries) {
      videos.push({
        videoId,
        title: entryTitle.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        durationSeconds: 0, // RSS doesn't include duration
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      });
    }

    return { title, videos, totalVideos: videos.length, totalSeconds: 0 };
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get("id");

  if (!playlistId) {
    return NextResponse.json(
      { error: "Playlist ID gerekli" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchPlaylistViaInnerTube(playlistId);

    if (data.videos.length === 0) {
      // Fallback to RSS
      const rssData = await fetchPlaylistViaRSS(playlistId);
      if (rssData.videos && rssData.videos.length > 0) {
        return NextResponse.json({
          ...data,
          ...rssData,
          fallback: true,
          error: "Süre bilgisi alınamadı (RSS fallback)",
        });
      }
      return NextResponse.json(
        { error: "Playlist bulunamadı veya gizli" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("YT Playlist fetch error:", err);
    return NextResponse.json(
      { error: "Playlist alınırken hata oluştu" },
      { status: 500 }
    );
  }
}
