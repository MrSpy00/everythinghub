import {
  PlaySquare,
  Image as ImageIcon,
  Code2,
  Calculator,
  Type,
  Palette,
  Layers,
  Download,
  Clock,
  FileCode2,
  Binary,
  Regex,
  CaseSensitive,
  Scale,
  Percent,
  Music,
  ListMusic,
  UserCheck,
  Disc3,
  Globe,
  Server,
  Coins,
  FileText,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "video"
  | "audio"
  | "image"
  | "text"
  | "developer"
  | "calculator"
  | "design";

export type ToolStatus = "live" | "coming-soon" | "beta";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  accentColor: string;
  accentClass: string;
  status: ToolStatus;
  tags?: string[];
  featured?: boolean;
  newBadge?: boolean;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  video: "Video",
  audio: "Ses & Müzik",
  image: "Görsel",
  text: "Metin",
  developer: "Geliştirici",
  calculator: "Hesaplama",
  design: "Tasarım",
};

export const CATEGORY_ICONS: Record<ToolCategory, LucideIcon> = {
  video: PlaySquare,
  audio: Music,
  image: ImageIcon,
  text: Type,
  developer: Code2,
  calculator: Calculator,
  design: Palette,
};

export const tools: Tool[] = [
  {
    slug: "spotify-playlist-analyzer",
    title: "Spotify Playlist Analizör",
    description:
      "Chosic & Artist.tools seviyesinde Sonic DNA radarı, bot & fraud tespiti, tür dağılımı, BPM/Key çarkı ve HD kapak stüdyosu",
    icon: ListMusic,
    category: "audio",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: [
      "spotify",
      "playlist",
      "analiz",
      "audio-features",
      "bpm",
      "bot-kontrol",
      "chosic",
      "artist-tools",
      "submithub",
      "kapak",
    ],
    featured: true,
    newBadge: true,
  },
  {
    slug: "spotify-profile-analyzer",
    title: "Spotify Profil & Sanatçı Analizör",
    description:
      "Küratör ve sanatçı profillerini inceleyin, takipçi gücünü, diskografiyi, en popüler şarkıları ve HD avatarları çıkarın",
    icon: UserCheck,
    category: "audio",
    accentColor: "#06b6d4",
    accentClass: "from-cyan-500 to-cyan-600",
    status: "live",
    tags: [
      "spotify",
      "profil",
      "sanatçı",
      "küratör",
      "takipçi",
      "diskografi",
      "analiz",
      "avatar",
    ],
    featured: true,
    newBadge: true,
  },
  {
    slug: "yt-playlist-length",
    title: "YouTube Playlist Analyzer",
    description:
      "Playlist süresini hesapla, farklı hızlarda izleme sürelerini gör, HD thumbnail ve CSV dışa aktar",
    icon: PlaySquare,
    category: "video",
    accentColor: "#ef4444",
    accentClass: "from-red-500 to-red-600",
    status: "live",
    tags: ["youtube", "playlist", "video", "sure", "hiz", "thumbnail", "csv"],
    featured: true,
    newBadge: true,
  },
  {
    slug: "yt-thumbnail-downloader",
    title: "YouTube Thumbnail İndirici",
    description:
      "Herhangi bir YouTube videosunun HD, Full HD ve 4K kapak görsellerini anında ücretsiz indir",
    icon: Download,
    category: "video",
    accentColor: "#f43f5e",
    accentClass: "from-rose-500 to-rose-600",
    status: "live",
    tags: ["youtube", "thumbnail", "kapak", "görsel", "indir", "hd"],
    newBadge: true,
  },
  {
    slug: "yt-timestamp-generator",
    title: "YouTube Zaman Damgası Üretici",
    description:
      "Videolar için saniye/dakika bazlı başlama bağlantıları (timestamp link) ve açıklama listeleri üret",
    icon: Clock,
    category: "video",
    accentColor: "#fb7185",
    accentClass: "from-pink-500 to-rose-500",
    status: "live",
    tags: ["youtube", "timestamp", "zaman", "link", "bağlantı"],
  },
  {
    slug: "image-compressor",
    title: "Görsel Sıkıştırıcı",
    description:
      "Görselleri kalite kaybı olmadan sıkıştır — %90'a varan boyut tasarrufu, tamamen tarayıcıda çalışır",
    icon: ImageIcon,
    category: "image",
    accentColor: "#a78bfa",
    accentClass: "from-violet-500 to-violet-600",
    status: "live",
    tags: ["görsel", "sıkıştırma", "webp", "png", "jpeg", "optimizasyon"],
    featured: true,
  },
  {
    slug: "image-converter",
    title: "Görsel Format Dönüştürücü",
    description:
      "PNG, JPEG, WebP ve AVIF formatları arasında anında kalite kaybı olmadan dönüştürme yapın",
    icon: FileCode2,
    category: "image",
    accentColor: "#c084fc",
    accentClass: "from-purple-500 to-purple-600",
    status: "live",
    tags: ["görsel", "dönüştürücü", "png", "jpeg", "webp", "format"],
  },
  {
    slug: "color-picker",
    title: "Renk Paleti & Resimden Renk Çıkarıcı",
    description:
      "Yüklediğiniz görselden dominant renk paletini çıkarın, HEX, RGB ve HSL formatında kopyalayın",
    icon: Palette,
    category: "design",
    accentColor: "#f59e0b",
    accentClass: "from-amber-500 to-amber-600",
    status: "live",
    tags: ["renk", "palet", "tasarım", "css", "hex", "rgb", "dominant"],
    featured: true,
  },
  {
    slug: "json-formatter",
    title: "JSON Formatlayıcı & Validator",
    description:
      "JSON verinizi anında düzeltin, sözdizimi hatalarını yakalayın, ağaç görünümünde inceleyin ve küçültün",
    icon: Code2,
    category: "developer",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["json", "format", "validate", "developer", "tree", "minify"],
    featured: true,
  },
  {
    slug: "base64-encoder",
    title: "Base64 Kodlayıcı & Çözücü",
    description:
      "Metinleri veya dosyaları Base64 formatına kodlayın ve güvenle geri çözün (URL-safe destekli)",
    icon: Binary,
    category: "developer",
    accentColor: "#06b6d4",
    accentClass: "from-cyan-500 to-cyan-600",
    status: "live",
    tags: ["base64", "encode", "decode", "metin", "görsel", "geliştirici"],
  },
  {
    slug: "regex-tester",
    title: "İnteraktif Regex Tester",
    description:
      "Düzenli ifadeleri (Regular Expressions) canlı olarak test edin, eşleşmeleri ve grupları vurgulayın",
    icon: Regex,
    category: "developer",
    accentColor: "#3b82f6",
    accentClass: "from-blue-500 to-blue-600",
    status: "live",
    tags: ["regex", "test", "pattern", "geliştirici", "kod"],
  },
  {
    slug: "css-gradient-generator",
    title: "CSS & Tailwind Gradient Üretici",
    description:
      "Çok renkli doğrusal ve dairesel CSS/Tailwind gradientler oluşturun, tek tıkla CSS kodunu alın",
    icon: Layers,
    category: "developer",
    accentColor: "#ec4899",
    accentClass: "from-pink-500 to-pink-600",
    status: "live",
    tags: ["css", "gradient", "tasarım", "tailwind", "mesh", "renk"],
  },
  {
    slug: "word-counter",
    title: "Kelime ve Metin Sayacı",
    description:
      "Kelime, karakter, cümle, paragraf ve tahmini okuma süresini anlık olarak analiz edin",
    icon: Type,
    category: "text",
    accentColor: "#818cf8",
    accentClass: "from-indigo-500 to-indigo-600",
    status: "live",
    tags: ["kelime", "karakter", "okuma", "metin", "analiz", "sayac"],
  },
  {
    slug: "case-converter",
    title: "Metin Kasa Dönüştürücü",
    description:
      "camelCase, snake_case, kebab-case, Title Case, UPPERCASE ve lowercase dönüşümlerini anında yapın",
    icon: CaseSensitive,
    category: "text",
    accentColor: "#a78bfa",
    accentClass: "from-violet-500 to-violet-600",
    status: "live",
    tags: ["metin", "case", "camelcase", "snakecase", "dönüştürücü"],
  },
  {
    slug: "unit-converter",
    title: "Çoklu Birim Dönüştürücü",
    description:
      "Uzunluk, kütle, sıcaklık, veri depolama ve hız birimlerini kesintisiz ve hassas dönüştürün",
    icon: Scale,
    category: "calculator",
    accentColor: "#14b8a6",
    accentClass: "from-teal-500 to-teal-600",
    status: "live",
    tags: ["birim", "dönüştürücü", "uzunluk", "kütle", "sıcaklık", "hesaplama"],
  },
  {
    slug: "percentage-calculator",
    title: "Yüzde & İndirim Hesaplayıcı",
    description:
      "Yüzde artış/azalış, oran hesaplama, indirimli fiyat ve KDV tutarlarını anında hesaplayın",
    icon: Percent,
    category: "calculator",
    accentColor: "#eab308",
    accentClass: "from-yellow-500 to-yellow-600",
    status: "live",
    tags: ["yüzde", "hesaplama", "indirim", "oran", "kdv", "finans"],
  },
  {
    slug: "ip-network-info",
    title: "IP & Ağ Latency Analizörü",
    description:
      "IP adresinizi, coğrafi konumunuzu, ISP sağlayıcınızı ve CDN ping sürelerinizi canlı analiz edin",
    icon: Globe,
    category: "developer",
    accentColor: "#06b6d4",
    accentClass: "from-cyan-500 to-cyan-600",
    status: "live",
    tags: ["ip", "network", "ping", "latency", "isp", "location", "geliştirici"],
    featured: true,
    newBadge: true,
  },
  {
    slug: "dns-lookup-tool",
    title: "DNS Kayıtları & DoH Sorgulayıcı",
    description:
      "A, AAAA, MX, TXT ve CNAME DNS kayıtlarını Cloudflare DoH altyapısıyla anında sorgulayın",
    icon: Server,
    category: "developer",
    accentColor: "#6366f1",
    accentClass: "from-indigo-500 to-indigo-600",
    status: "live",
    tags: ["dns", "lookup", "mx", "txt", "cname", "doh", "geliştirici"],
    featured: true,
    newBadge: true,
  },
  {
    slug: "currency-exchange-converter",
    title: "Canlı Döviz & Kripto Dönüştürücü",
    description:
      "150+ itibari para birimi ve kripto varlık arasında canlı dönüşüm hesaplamaları yapın",
    icon: Coins,
    category: "calculator",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["döviz", "kurlar", "dolar", "euro", "tl", "kripto", "dönüştürücü"],
    featured: true,
    newBadge: true,
  },
  {
    slug: "markdown-studio",
    title: "Markdown Studio & Canlı Önizleme",
    description:
      "Markdown dokümanlarınızı canlı önizleyin, metrikleri görün, HTML veya .md olarak indirin",
    icon: FileText,
    category: "text",
    accentColor: "#a855f7",
    accentClass: "from-purple-500 to-purple-600",
    status: "live",
    tags: ["markdown", "editör", "preview", "html", "metin"],
    newBadge: true,
  },
  {
    slug: "cron-expression-studio",
    title: "Cron İfadesi Üreteci & Açıklayıcı",
    description:
      "Linux crontab zamanlamalarını görsel olarak üretin ve Türkçe insani açıklamasını görün",
    icon: CalendarClock,
    category: "developer",
    accentColor: "#ec4899",
    accentClass: "from-pink-500 to-pink-600",
    status: "live",
    tags: ["cron", "crontab", "zamanlayıcı", "generator", "geliştirici"],
    newBadge: true,
  },
  {
    slug: "favicon-extractor",
    title: "Site Favicon & Logo İndirici",
    description:
      "Herhangi bir web sitesinin HD favicon, Apple touch icon ve SVG logosunu anında indirin",
    icon: ImageIcon,
    category: "design",
    accentColor: "#f59e0b",
    accentClass: "from-amber-500 to-amber-600",
    status: "live",
    tags: ["favicon", "logo", "görsel", "hd", "extractor", "tasarım"],
    newBadge: true,
  },
];

export const getToolBySlug = (slug: string) =>
  tools.find((t) => t.slug === slug);

export const getToolsByCategory = (cat: ToolCategory) =>
  tools.filter((t) => t.category === cat);

export const getFeaturedTools = () =>
  tools.filter((t) => t.featured && t.status === "live");

export const getLiveTools = () => tools.filter((t) => t.status === "live");

export const getComingSoonTools = () =>
  tools.filter((t) => t.status === "coming-soon");

export const getAllCategories = (): ToolCategory[] => [
  ...new Set(tools.map((t) => t.category)),
];
