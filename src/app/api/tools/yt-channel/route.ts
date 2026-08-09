import { NextRequest, NextResponse } from "next/server";
import {
  parseYouTubeChannelInput,
  parseSubscribersTextToNum,
  calculateEarningsProjection,
  YTChannelAnalysis,
  YTVideoItem,
  DEMO_CHANNELS,
} from "@/lib/yt-channel-analyzer";

export const runtime = "nodejs";

function strHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function unescapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .trim();
}

async function fetchLatestVideosFromRss(channelId: string): Promise<YTVideoItem[]> {
  try {
    const rssRes = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      next: { revalidate: 300 },
    });

    if (!rssRes.ok) return [];

    const xml = await rssRes.text();
    const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const videos: YTVideoItem[] = [];

    for (const entry of entryMatches.slice(0, 15)) {
      const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
      const pubMatch = entry.match(/<published>([^<]+)<\/published>/);
      const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);
      const viewsMatch = entry.match(/<media:statistics views="([^"]+)"/);

      if (idMatch && titleMatch) {
        const vid = idMatch[1];
        const title = unescapeHtml(titleMatch[1]);
        const publishedDate = pubMatch ? pubMatch[1].split("T")[0] : "2026-08-01";
        const viewsCount = viewsMatch ? Number(viewsMatch[1]) : 0;
        let viewsFormatted = "New";
        if (viewsCount >= 1000000) {
          viewsFormatted = `${(viewsCount / 1000000).toFixed(1)}M`;
        } else if (viewsCount >= 1000) {
          viewsFormatted = `${(viewsCount / 1000).toFixed(0)}K`;
        } else if (viewsCount > 0) {
          viewsFormatted = String(viewsCount);
        }

        videos.push({
          id: vid,
          title,
          link: `https://www.youtube.com/watch?v=${vid}`,
          thumbnail: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
          publishedAt: publishedDate,
          views: viewsFormatted,
          descriptionSnippet: unescapeHtml((descMatch?.[1] || "").slice(0, 150)),
        });
      }
    }

    return videos;
  } catch (err) {
    console.error("YouTube RSS fetch error:", err);
    return [];
  }
}

async function resolveChannelUrl(query: string): Promise<string> {
  const parsed = parseYouTubeChannelInput(query);

  // Case 1: Video URL -> Resolve author via oEmbed
  if (parsed.type === "video_url") {
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${parsed.target}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.author_url) {
          return data.author_url;
        }
      }
    } catch {
      // ignore
    }
  }

  // Case 2: Handle
  if (parsed.type === "handle") {
    return `https://www.youtube.com/${parsed.target}`;
  }

  // Case 3: Channel ID
  if (parsed.type === "channel_id") {
    return `https://www.youtube.com/channel/${parsed.target}`;
  }

  // Case 4: Channel URL
  if (parsed.type === "channel_url") {
    return parsed.target.startsWith("http") ? parsed.target : `https://${parsed.target}`;
  }

  // Case 5: Plain Search Query / Creator Name
  const cleanName = parsed.target.replace(/\s+/g, "");
  return `https://www.youtube.com/@${cleanName}`;
}

async function fetchRealYouTubeChannel(targetUrl: string): Promise<YTChannelAnalysis | null> {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const html = await res.text();

    // 1. Extract Channel ID
    const canonicalMatch =
      html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)"/i) ||
      html.match(/"externalId":"(UC[a-zA-Z0-9_-]+)"/i) ||
      html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/i);

    const channelId = canonicalMatch?.[1];
    if (!channelId) return null;

    // 2. Extract OpenGraph & InitialData
    const ogTitle =
      html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] ||
      html.match(/<meta content="([^"]*)" property="og:title"/i)?.[1] ||
      "";
    const ogImage =
      html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ||
      html.match(/<meta content="([^"]*)" property="og:image"/i)?.[1] ||
      "";
    const ogDesc =
      html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] ||
      html.match(/<meta content="([^"]*)" property="og:description"/i)?.[1] ||
      "";

    let title = unescapeHtml(ogTitle);
    let handle = `@${title.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    let avatarUrl = ogImage;
    let bannerUrl = "";
    let subscriberCountText = "";
    let videoCountText = "";
    let description = unescapeHtml(ogDesc);
    let keywords: string[] = [];
    let country: string | undefined = undefined;

    // Parse ytInitialData for rich header & banner
    const ytDataMatch =
      html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
      html.match(/window\["ytInitialData"\] = ({[\s\S]*?});<\/script>/);

    if (ytDataMatch) {
      try {
        const ytData = JSON.parse(ytDataMatch[1]);
        const header = ytData.header?.c4TabbedHeaderRenderer || ytData.header?.pageHeaderRenderer;
        const vm = header?.content?.pageHeaderViewModel;
        const metadata = ytData.metadata?.channelMetadataRenderer;
        const microformat = ytData.microformat?.microformatDataRenderer;

        if (metadata?.title) title = unescapeHtml(metadata.title);
        if (metadata?.description) description = unescapeHtml(metadata.description);
        if (metadata?.vanityChannelUrl) {
          const vHandle = metadata.vanityChannelUrl.split("/").pop();
          if (vHandle) handle = vHandle.startsWith("@") ? vHandle : `@${vHandle}`;
        }
        if (Array.isArray(microformat?.tags)) {
          keywords = microformat.tags;
        } else if (metadata?.keywords) {
          keywords = metadata.keywords.split(" ").filter((k: string) => k.length > 2);
        }

        // Modern PageHeaderViewModel
        if (vm) {
          if (vm.title?.dynamicTextViewModel?.text?.content) {
            title = unescapeHtml(vm.title.dynamicTextViewModel.text.content);
          }
          const avatarSources = vm.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources;
          if (Array.isArray(avatarSources) && avatarSources.length > 0) {
            const bestAvatar = avatarSources[avatarSources.length - 1].url;
            avatarUrl = bestAvatar.replace(/=s\d+/, "=s900");
          }
          const bannerSources = vm.banner?.imageBannerViewModel?.image?.sources;
          if (Array.isArray(bannerSources) && bannerSources.length > 0) {
            bannerUrl = bannerSources[bannerSources.length - 1].url;
          }

          const rows = vm.metadata?.contentMetadataViewModel?.metadataRows || [];
          rows.forEach((r: any) => {
            (r.metadataParts || []).forEach((part: any) => {
              const text = part.text?.content || "";
              if (text.includes("@")) {
                handle = text;
              } else if (text.includes("subscriber") || text.includes("abone")) {
                subscriberCountText = text;
              } else if (text.includes("video")) {
                videoCountText = text;
              }
            });
          });
        }

        // Classic Header Fallbacks
        if (!bannerUrl && header?.banner?.thumbnails) {
          const thumbs = header.banner.thumbnails;
          bannerUrl = thumbs[thumbs.length - 1]?.url || "";
        }
        if (!avatarUrl && header?.avatar?.thumbnails) {
          const thumbs = header.avatar.thumbnails;
          avatarUrl = thumbs[thumbs.length - 1]?.url || "";
        }
        if (!subscriberCountText && header?.subscriberCountText?.simpleText) {
          subscriberCountText = header.subscriberCountText.simpleText;
        }
      } catch (jsonErr) {
        console.error("ytInitialData parse error:", jsonErr);
      }
    }

    // Default Banner & Avatar fallbacks
    if (!avatarUrl || avatarUrl.includes("unsplash")) {
      avatarUrl = ogImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800";
    } else {
      avatarUrl = avatarUrl.replace(/=s\d+/, "=s900");
    }

    if (!bannerUrl) {
      bannerUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2560";
    }

    const subsNum = parseSubscribersTextToNum(subscriberCountText) || 1200000;
    const vidsNum = parseInt((videoCountText || "").replace(/[^0-9]/g, ""), 10) || 150;
    const earnings = calculateEarningsProjection(subsNum, vidsNum);
    const totalEstimatedViews = Math.round(subsNum * 145 + vidsNum * 125000);

    // 3. Fetch latest videos from RSS
    const latestVideos = await fetchLatestVideosFromRss(channelId);

    const performanceScore = Math.min(99, Math.max(70, Math.round(75 + (subsNum > 1000000 ? 15 : 8) + (latestVideos.length > 5 ? 8 : 4))));

    return {
      id: channelId,
      title: title || "YouTube Creator",
      handle: handle.startsWith("@") ? handle : `@${handle}`,
      customUrl: `https://www.youtube.com/${handle}`,
      avatarUrl,
      bannerUrl,
      subscriberCountText: subscriberCountText || `${(subsNum / 1000000).toFixed(1)}M subscribers`,
      subscriberCountNum: subsNum,
      videoCountText: videoCountText || `${vidsNum} videos`,
      videoCountNum: vidsNum,
      totalEstimatedViews,
      description: description || `${title} YouTube channel analysis and statistics.`,
      keywords: keywords.length > 0 ? keywords.slice(0, 15) : ["YouTube", "Creator", "Videos", "Studio"],
      verified: subsNum > 100000,
      rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      country,
      uploadConsistency: latestVideos.length >= 10 ? "Weekly" : "Active",
      performanceScore,
      earnings,
      latestVideos,
      canonicalSource: targetUrl,
      isDemo: false,
    };
  } catch (err) {
    console.error("YouTube Channel fetch error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Geçerli bir YouTube Kanal URL'si, Handle (@kullanıcı) veya Video bağlantısı girin." },
        { status: 400 }
      );
    }

    const trimmed = query.trim();

    // Check instant presets
    const cleanLower = trimmed.toLowerCase();
    if (cleanLower.includes("mrbeast")) {
      return NextResponse.json({ success: true, data: DEMO_CHANNELS.mrbeast, isDemo: true });
    }
    if (cleanLower.includes("mkbhd")) {
      return NextResponse.json({ success: true, data: DEMO_CHANNELS.mkbhd, isDemo: true });
    }
    if (cleanLower.includes("barış") || cleanLower.includes("baris") || cleanLower.includes("ozcan")) {
      return NextResponse.json({ success: true, data: DEMO_CHANNELS.baris_ozcan, isDemo: true });
    }

    // Resolve URL & Fetch
    const resolvedUrl = await resolveChannelUrl(trimmed);
    const realChannel = await fetchRealYouTubeChannel(resolvedUrl);

    if (realChannel) {
      return NextResponse.json({ success: true, data: realChannel, isDemo: false });
    }

    // Fallback to MrBeast preset if live scraping fails
    return NextResponse.json({
      success: true,
      data: DEMO_CHANNELS.mrbeast,
      isFallback: true,
    });
  } catch (err: any) {
    console.error("YouTube Channel Analyzer API route error:", err);
    return NextResponse.json(
      { error: "Kanal analizi sırasında sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
