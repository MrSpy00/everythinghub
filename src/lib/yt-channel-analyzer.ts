export interface YTVideoItem {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  publishedAt: string;
  views?: string;
  descriptionSnippet?: string;
}

export interface YTEstimatedEarnings {
  monthlyMinUsd: number;
  monthlyMaxUsd: number;
  yearlyMinUsd: number;
  yearlyMaxUsd: number;
  estimatedAvgViewsPerMonth: number;
}

export interface YTChannelAnalysis {
  id: string;
  title: string;
  handle: string;
  customUrl: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCountText: string;
  subscriberCountNum: number;
  videoCountText: string;
  videoCountNum: number;
  totalEstimatedViews: number;
  description: string;
  keywords: string[];
  verified: boolean;
  rssUrl: string;
  country?: string;
  joinedYear?: string;
  uploadConsistency: "Daily" | "Weekly" | "Bi-Weekly" | "Occasional" | "Active";
  performanceScore: number; // 0 to 100
  earnings: YTEstimatedEarnings;
  latestVideos: YTVideoItem[];
  canonicalSource: string;
  isDemo?: boolean;
}

export function parseYouTubeChannelInput(input: string): {
  type: "channel_id" | "handle" | "video_url" | "channel_url" | "search_query";
  target: string;
  originalInput: string;
} {
  if (!input || typeof input !== "string") {
    return { type: "search_query", target: "", originalInput: "" };
  }

  const trimmed = input.trim();

  // Video URL check (e.g. youtube.com/watch?v=xxx or youtu.be/xxx)
  const videoMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
  if (videoMatch) {
    return { type: "video_url", target: videoMatch[1], originalInput: trimmed };
  }

  // Handle URL (e.g. youtube.com/@MrBeast or /@MrBeast/videos)
  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9._-]+)/i);
  if (handleMatch) {
    return { type: "handle", target: `@${handleMatch[1]}`, originalInput: trimmed };
  }

  // Direct Handle starting with @ (e.g. @MrBeast)
  if (trimmed.startsWith("@")) {
    return { type: "handle", target: trimmed, originalInput: trimmed };
  }

  // Channel ID URL (e.g. youtube.com/channel/UC...)
  const channelUrlMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
  if (channelUrlMatch) {
    return { type: "channel_id", target: channelUrlMatch[1], originalInput: trimmed };
  }

  // Plain Channel ID (UC...)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return { type: "channel_id", target: trimmed, originalInput: trimmed };
  }

  // Custom / user URL (e.g. youtube.com/c/xxx or youtube.com/user/xxx)
  const customMatch = trimmed.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9._-]+)/i);
  if (customMatch) {
    return { type: "channel_url", target: trimmed, originalInput: trimmed };
  }

  // Plain Creator name (e.g. "MrBeast", "mkbhd", "Barış Özcan")
  return { type: "search_query", target: trimmed, originalInput: trimmed };
}

export function parseSubscribersTextToNum(text: string): number {
  if (!text) return 0;
  const match = text.match(/([\d\.,]+)\s*([KMBkmbBinMilyarMilyon]*)?/i);
  if (!match) return 0;

  let val = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2]?.toUpperCase() || "";

  if (unit.startsWith("K") || unit.startsWith("BİN")) {
    val *= 1000;
  } else if (unit.startsWith("M") || unit.startsWith("MİLYON") || unit.startsWith("MN")) {
    val *= 1000000;
  } else if (unit.startsWith("B") || unit.startsWith("MR") || unit.startsWith("MİLYAR")) {
    val *= 1000000000;
  }

  return Math.round(val);
}

export function calculateEarningsProjection(subsNum: number, videosNum: number): YTEstimatedEarnings {
  // Conservative algorithmic estimation based on subscriber velocity and catalog size
  const monthlyViewsEstimate = Math.max(50000, Math.round(subsNum * 1.8 + videosNum * 1500));
  const minRpm = 1.2; // $1.20 per 1k views
  const maxRpm = 4.5; // $4.50 per 1k views

  const monthlyMin = Math.round((monthlyViewsEstimate / 1000) * minRpm);
  const monthlyMax = Math.round((monthlyViewsEstimate / 1000) * maxRpm);

  return {
    monthlyMinUsd: monthlyMin,
    monthlyMaxUsd: monthlyMax,
    yearlyMinUsd: monthlyMin * 12,
    yearlyMaxUsd: monthlyMax * 12,
    estimatedAvgViewsPerMonth: monthlyViewsEstimate,
  };
}

export const DEMO_CHANNELS: Record<string, YTChannelAnalysis> = {
  mrbeast: {
    id: "UCX6OQ3DkcsbYNE6H8uQQuVA",
    title: "MrBeast",
    handle: "@MrBeast",
    customUrl: "https://www.youtube.com/@MrBeast",
    avatarUrl: "https://yt3.googleusercontent.com/nxYrc_1_2f77DoBadyxMTmv7ZpRZapHR5jbuYe7PlPd5cIRJxtNNEYyOC0ZsxaDyJJzXrnJiuDE=s900-c-k-c0x00ffffff-no-rj",
    bannerUrl: "https://yt3.googleusercontent.com/mHMO_eEMp0dPvh0ADwXhPXNYb_GnjSVsLI8biqF1CpxT8OPl7izhNQsDPD3JHhd5y5Mg9GrP=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    subscriberCountText: "512M subscribers",
    subscriberCountNum: 512000000,
    videoCountText: "996 videos",
    videoCountNum: 996,
    totalEstimatedViews: 92400000000,
    description: "SUBSCRIBE FOR A COOKIE! New MrBeast or MrBeast Gaming video every single Saturday at noon eastern time!",
    keywords: ["mrbeast6000", "beast", "mrbeast", "Mr.Beast", "entertainment", "challenge", "giveaway", "viral"],
    verified: true,
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCX6OQ3DkcsbYNE6H8uQQuVA",
    country: "United States",
    joinedYear: "2012",
    uploadConsistency: "Weekly",
    performanceScore: 99,
    earnings: {
      monthlyMinUsd: 1200000,
      monthlyMaxUsd: 4500000,
      yearlyMinUsd: 14400000,
      yearlyMaxUsd: 54000000,
      estimatedAvgViewsPerMonth: 950000000,
    },
    latestVideos: [
      {
        id: "0e3GPea1Tyg",
        title: "Last To Leave Mansion, Keeps It",
        link: "https://www.youtube.com/watch?v=0e3GPea1Tyg",
        thumbnail: "https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg",
        publishedAt: "2026-08-01",
        views: "85M",
        descriptionSnippet: "I gave 100 people a chance to win this massive luxury mansion!",
      },
      {
        id: "J_M4eC8w5_I",
        title: "Paying For Food With My Car",
        link: "https://www.youtube.com/watch?v=J_M4eC8w5_I",
        thumbnail: "https://i.ytimg.com/vi/J_M4eC8w5_I/maxresdefault.jpg",
        publishedAt: "2026-07-25",
        views: "112M",
        descriptionSnippet: "Every drive-thru we visited got whatever they asked for!",
      },
    ],
    canonicalSource: "https://www.youtube.com/@MrBeast",
    isDemo: true,
  },
  mkbhd: {
    id: "UCBJycsmduvYEL83R_U4JriQ",
    title: "Marques Brownlee",
    handle: "@mkbhd",
    customUrl: "https://www.youtube.com/@mkbhd",
    avatarUrl: "https://yt3.googleusercontent.com/qu4TmIaYUlS41-dJ9gZ7DUR3nilvmB5_11i6OKSdvNnBNiyOusZP1bMN6ICnuxtjFBb6ioKgRQ=s900-c-k-c0x00ffffff-no-rj",
    bannerUrl: "https://yt3.googleusercontent.com/eH2P8M2rM79F6_wH4lTzQj3W8yA1bV5_X8Z_7kC2n9V1L0w=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    subscriberCountText: "19.5M subscribers",
    subscriberCountNum: 19500000,
    videoCountText: "1,680 videos",
    videoCountNum: 1680,
    totalEstimatedViews: 4100000000,
    description: "MKBHD: Quality Tech Videos | YouTuber | Geek | Consumer Electronics | Tech Head | Internet Personality",
    keywords: ["MKBHD", "Marques Brownlee", "Tech Reviews", "Smartphones", "Apple", "Android", "EVs", "Tesla"],
    verified: true,
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ",
    country: "United States",
    joinedYear: "2008",
    uploadConsistency: "Active",
    performanceScore: 96,
    earnings: {
      monthlyMinUsd: 48000,
      monthlyMaxUsd: 180000,
      yearlyMinUsd: 576000,
      yearlyMaxUsd: 2160000,
      estimatedAvgViewsPerMonth: 38000000,
    },
    latestVideos: [
      {
        id: "abc123mkbhd",
        title: "Galaxy Z Fold 8 Review: Honeymoon's Over",
        link: "https://www.youtube.com/@mkbhd",
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
        publishedAt: "2026-08-05",
        views: "2.4M",
        descriptionSnippet: "Full in-depth impressions after 2 months of daily driving the new foldable flagship.",
      },
    ],
    canonicalSource: "https://www.youtube.com/@mkbhd",
    isDemo: true,
  },
  baris_ozcan: {
    id: "UCv6jcPwFujuTIwFQ11jt1Yw",
    title: "Barış Özcan",
    handle: "@BarisOzcan",
    customUrl: "https://www.youtube.com/@BarisOzcan",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600",
    subscriberCountText: "6.85M abone",
    subscriberCountNum: 6850000,
    videoCountText: "650 video",
    videoCountNum: 650,
    totalEstimatedViews: 850000000,
    description: "Sanat, tasarım ve teknoloji hikayeleri. Geleceğe dair bilimsel araştırmalar ve vizyoner belgeseller.",
    keywords: ["Barış Özcan", "Bilim", "Sanat", "Tasarım", "Teknoloji", "Uzay", "Yapay Zeka", "Hikaye Anlatıcılığı"],
    verified: true,
    rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCv6jcPwFujuTIwFQ11jt1Yw",
    country: "Turkey",
    joinedYear: "2015",
    uploadConsistency: "Weekly",
    performanceScore: 95,
    earnings: {
      monthlyMinUsd: 15000,
      monthlyMaxUsd: 55000,
      yearlyMinUsd: 180000,
      yearlyMaxUsd: 660000,
      estimatedAvgViewsPerMonth: 12000000,
    },
    latestVideos: [
      {
        id: "bo_latest_1",
        title: "Yapay Zekanın Yeni Çağı: İnsan Zihni ile Bütünleşme",
        link: "https://www.youtube.com/@BarisOzcan",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        publishedAt: "2026-08-04",
        views: "1.2M",
        descriptionSnippet: "Teknoloji ve insan beyni arasındaki sınırların kalktığı yeni dönem üzerine kapsamlı bir inceleme.",
      },
    ],
    canonicalSource: "https://www.youtube.com/@BarisOzcan",
    isDemo: true,
  },
};
