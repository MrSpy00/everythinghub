import {
  PlaySquare,
  Image,
  Code2,
  Calculator,
  Type,
  Music,
  Globe,
  Palette,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "video"
  | "image"
  | "text"
  | "developer"
  | "calculator"
  | "audio"
  | "web"
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
  emoji?: string;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  video: "Video",
  image: "Görsel",
  text: "Metin",
  developer: "Geliştirici",
  calculator: "Hesaplama",
  audio: "Ses",
  web: "Web",
  design: "Tasarım",
};

export const CATEGORY_ICONS: Record<ToolCategory, LucideIcon> = {
  video: PlaySquare,
  image: Image,
  text: Type,
  developer: Code2,
  calculator: Calculator,
  audio: Music,
  web: Globe,
  design: Palette,
};

export const tools: Tool[] = [
  {
    slug: "yt-playlist-length",
    title: "YouTube Playlist Analyzer",
    description:
      "Playlist süresini hesapla, farklı hızlarda izleme sürelerini gör, thumbnail'ları indir",
    icon: PlaySquare,
    category: "video",
    accentColor: "#ef4444",
    accentClass: "from-red-500 to-red-600",
    status: "live",
    tags: ["youtube", "playlist", "video", "süre", "hız", "thumbnail"],
    featured: true,
    newBadge: true,
    emoji: "🎬",
  },
  // Coming soon tools — altyapı hazır, eklenmeyi bekliyor
  {
    slug: "image-compressor",
    title: "Görsel Sıkıştırıcı",
    description: "Görselleri kalite kaybı olmadan sıkıştır — tamamen tarayıcıda",
    icon: Image,
    category: "image",
    accentColor: "#8b5cf6",
    accentClass: "from-violet-500 to-violet-600",
    status: "coming-soon",
    tags: ["görsel", "sıkıştırma", "webp", "png", "jpeg"],
    emoji: "🖼️",
  },
  {
    slug: "json-formatter",
    title: "JSON Formatlayıcı",
    description: "JSON'ı formatla, doğrula ve güzelleştir",
    icon: Code2,
    category: "developer",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "coming-soon",
    tags: ["json", "format", "validate", "developer"],
    emoji: "⚙️",
  },
  {
    slug: "color-picker",
    title: "Renk Paleti Oluşturucu",
    description: "Görselden renk çıkar, uyumlu paletler oluştur",
    icon: Palette,
    category: "design",
    accentColor: "#f59e0b",
    accentClass: "from-amber-500 to-amber-600",
    status: "coming-soon",
    tags: ["renk", "palet", "tasarım", "css"],
    emoji: "🎨",
  },
  {
    slug: "word-counter",
    title: "Kelime Sayacı",
    description: "Kelime, karakter ve okuma süresi hesapla",
    icon: Type,
    category: "text",
    accentColor: "#3b82f6",
    accentClass: "from-blue-500 to-blue-600",
    status: "coming-soon",
    tags: ["kelime", "karakter", "okuma", "metin"],
    emoji: "📝",
  },
  {
    slug: "css-gradient-generator",
    title: "CSS Gradient Üretici",
    description: "Görsel olarak CSS gradientler oluştur ve dışa aktar",
    icon: Zap,
    category: "developer",
    accentColor: "#ec4899",
    accentClass: "from-pink-500 to-pink-600",
    status: "coming-soon",
    tags: ["css", "gradient", "tasarım", "developer"],
    emoji: "✨",
  },
];

// Yardımcı fonksiyonlar
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
