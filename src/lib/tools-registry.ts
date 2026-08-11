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
  Terminal,
  QrCode,
  Key,
  Hash,
  Barcode,
  CloudSun,
  Waves,
  Camera,
  Database,
  BookOpen,
  HelpCircle,
  Cpu,
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
  text: "Metin & Dil",
  developer: "Geliştirici & Ağ",
  calculator: "Hesaplama & Finans",
  design: "Tasarım & Vektör",
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
  // 0. aegisFlasher (Featured Flagship)
  {
    slug: "aegisflasher",
    title: "aegisFlasher — Evrensel Web Mikrokontrolcü Flaşlayıcı & Seri Monitör",
    description:
      "ESP32, ESP8266, Arduino AVR, Raspberry Pi Pico ve STM32 için sıfır kurulumlu Web Serial firmware flaşlayıcı, 30+ hazır firmware kataloğu, bellek dökümü ve ANSI terminal",
    icon: Cpu,
    category: "developer",
    accentColor: "#8b5cf6",
    accentClass: "from-violet-500 to-indigo-600",
    status: "live",
    tags: [
      "flasher",
      "esp32",
      "esp8266",
      "arduino",
      "pico",
      "stm32",
      "webserial",
      "wled",
      "tasmota",
      "meshtastic",
      "marauder",
      "esptool",
      "stk500",
      "terminal",
      "geliştirici",
    ],
    featured: true,
    newBadge: true,
  },
  // 1. Zero-Auth API Playground (Featured New)
  {
    slug: "api-playground",
    title: "Canlı API Test Konsolu & Açık API Kataloğu",
    description:
      "150+ ücretsiz ve sıfır-auth açık API'yi canlı test edin, özel HTTP GET/POST istekleri gönderin, yanıt süresi ve JSON yüklerini anında inceleyin",
    icon: Terminal,
    category: "developer",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["api", "rest", "http", "freeapi", "hoppscotch", "geliştirici", "test", "curl"],
    featured: true,
    newBadge: true,
  },
  // 2. Vector QR Studio Pro
  {
    slug: "qr-code-studio",
    title: "QR Kod Stüdyosu Pro",
    description:
      "WiFi şifre paylaşımı, vCard kartvizit, URL ve kripto cüzdanlar için özel renkli, logolu ve vektörel SVG/PNG QR kodları üretin",
    icon: QrCode,
    category: "design",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["qr", "wifi", "vcard", "svg", "tasarım", "vektör", "logo"],
    featured: true,
    newBadge: true,
  },
  // 3. JWT Debugger
  {
    slug: "jwt-debugger",
    title: "İstemci Taraflı JWT Debugger & Token Çözücü",
    description:
      "JSON Web Token (JWT) başlık, payload ve imza verilerini %100 tarayıcı tarafında çözün. Canlı süre geri sayımı ve claim ayrıştırma",
    icon: Key,
    category: "developer",
    accentColor: "#6366f1",
    accentClass: "from-indigo-500 to-indigo-600",
    status: "live",
    tags: ["jwt", "token", "decoder", "auth", "güvenlik", "geliştirici"],
    featured: true,
    newBadge: true,
  },
  // 4. Crypto Hash & UUID Lab
  {
    slug: "crypto-hash-studio",
    title: "Kriptografik Hash, HMAC & UUID/NanoID Laboratuvarı",
    description:
      "SHA-256, SHA-512, MD5, HMAC ve UUID v4/v7/NanoID üretimini %100 tarayıcı tarafında Web Crypto API ile anında gerçekleştirin",
    icon: Hash,
    category: "developer",
    accentColor: "#8b5cf6",
    accentClass: "from-purple-500 to-purple-600",
    status: "live",
    tags: ["sha256", "hash", "hmac", "uuid", "nanoid", "crypto", "checksum"],
    newBadge: true,
  },
  // 5. Barcode Generator
  {
    slug: "barcode-generator",
    title: "Vektörel Barkod Üreteci",
    description:
      "EAN-13, UPC-A, Code 128 ve Code 39 barkod standartlarında baskıya hazır vektörel SVG ve yüksek çözünürlüklü PNG barkodları ücretsiz üretin",
    icon: Barcode,
    category: "design",
    accentColor: "#f59e0b",
    accentClass: "from-amber-500 to-amber-600",
    status: "live",
    tags: ["barkod", "ean13", "code128", "upc", "vektör", "svg", "tasarım"],
    newBadge: true,
  },
  // 6. Live Weather & Air Quality Radar
  {
    slug: "weather-air-quality",
    title: "Canlı Hava Durumu & Hava Kalitesi Radarı",
    description:
      "Open-Meteo ile dünya genelinde 7 günlük saatlik hava durumu, UV indeksi ve PM2.5/PM10 hava kalitesi indeksini (AQI) canlı takip edin",
    icon: CloudSun,
    category: "calculator",
    accentColor: "#0284c7",
    accentClass: "from-sky-500 to-sky-600",
    status: "live",
    tags: ["hava", "durumu", "aqi", "pm25", "uv", "radar", "açık-veri"],
    featured: true,
    newBadge: true,
  },
  // 7. World Countries Explorer
  {
    slug: "world-countries-explorer",
    title: "Dünya Ülkeleri & Coğrafya Karşılaştırma Stüdyosu",
    description:
      "REST Countries ile 250+ dünya ülkesinin bayrakları, nüfusu, başkenti, dilleri ve para birimlerini canlı keşfedin ve ülkeleri karşılaştırın",
    icon: Globe,
    category: "calculator",
    accentColor: "#4f46e5",
    accentClass: "from-indigo-500 to-indigo-600",
    status: "live",
    tags: ["ülkeler", "bayrak", "nüfus", "başkent", "coğrafya", "karşılaştırma"],
    newBadge: true,
  },
  // 8. Web Audio Spectrum Studio
  {
    slug: "audio-spectrum-studio",
    title: "Web Audio Osiloskop & Spektrum Analizörü",
    description:
      "Mikrofon veya ses dalgalarını Web Audio API ile gerçek zamanlı osiloskop ve FFT frekans spektrumu olarak analiz edin. Saf ton üreteci",
    icon: Waves,
    category: "audio",
    accentColor: "#06b6d4",
    accentClass: "from-cyan-500 to-cyan-600",
    status: "live",
    tags: ["audio", "osiloskop", "fft", "spektrum", "frekans", "ses", "ton"],
    featured: true,
    newBadge: true,
  },
  // 9. Precision BPM Tapper & Metronome
  {
    slug: "bpm-tapper",
    title: "Hassas BPM Tapper & Akıllı Metronom",
    description:
      "Klavyeden veya dokunarak anlık BPM hesaplayın, tutarlılık sapmasını görün ve Web Audio milisaniye zamanlayıcılı metronom ile ritim tutun",
    icon: Music,
    category: "audio",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["bpm", "tempo", "metronom", "ritim", "müzik", "sayıcı"],
    newBadge: true,
  },
  // 10. EXIF Purger
  {
    slug: "exif-purger",
    title: "EXIF Metaveri İnceleyici & Gizlilik Temizleyici",
    description:
      "Fotoğraflarınızdaki GPS konum koordinatlarını, kamera modelini ve çekim metaverilerini inceleyin ve paylaşmadan önce %100 temizleyin",
    icon: Camera,
    category: "image",
    accentColor: "#f43f5e",
    accentClass: "from-rose-500 to-rose-600",
    status: "live",
    tags: ["exif", "metadata", "gps", "fotoğraf", "gizlilik", "temizleyici"],
    newBadge: true,
  },
  // 11. SQL to Types
  {
    slug: "sql-to-types",
    title: "SQL'den TypeScript, Zod & Prisma Dönüştürücü",
    description:
      "SQL CREATE TABLE tablolarını anında TypeScript interface, Zod şeması, Prisma modeli, Go struct ve Python Pydantic kodlarına dönüştürün",
    icon: Database,
    category: "developer",
    accentColor: "#6366f1",
    accentClass: "from-indigo-500 to-indigo-600",
    status: "live",
    tags: ["sql", "typescript", "zod", "prisma", "go", "pydantic", "şema"],
    newBadge: true,
  },
  // 12. cURL to Code
  {
    slug: "curl-to-code",
    title: "cURL'den Çoklu Dil Kod Üreticisi",
    description:
      "cURL komutlarını anında JavaScript fetch, Axios, Python requests, Go ve PHP kodlarına dönüştürün",
    icon: Terminal,
    category: "developer",
    accentColor: "#06b6d4",
    accentClass: "from-cyan-500 to-cyan-600",
    status: "live",
    tags: ["curl", "fetch", "axios", "python", "go", "php", "kod"],
    newBadge: true,
  },
  // 13. Smart Dictionary
  {
    slug: "smart-dictionary",
    title: "İngilizce Akıllı Sözlük, Telaffuz & Kafiye Motoru",
    description:
      "İngilizce kelimelerin fonetik telaffuz seslerini dinleyin, tanımları inceleyin, kafiyeli kelimeleri ve eşanlamlıları canlı keşfedin",
    icon: BookOpen,
    category: "text",
    accentColor: "#3b82f6",
    accentClass: "from-blue-500 to-blue-600",
    status: "live",
    tags: ["sözlük", "dictionary", "rhyme", "kafiye", "synonym", "sesli-telaffuz"],
    newBadge: true,
  },
  // 14. Book & ISBN Finder
  {
    slug: "book-isbn-finder",
    title: "Açık Kitaplık & ISBN Arama Motoru",
    description:
      "20M+ kitap, yazar ve ISBN numarası üzerinden kitap kapağı, yayıncı, sayfa sayısı ve basım yılı bilgilerini canlı arayın",
    icon: BookOpen,
    category: "text",
    accentColor: "#f59e0b",
    accentClass: "from-amber-500 to-amber-600",
    status: "live",
    tags: ["kitap", "isbn", "openlibrary", "yazar", "kapak", "kütüphane"],
    newBadge: true,
  },
  // 15. Trivia Quiz Arena
  {
    slug: "trivia-quiz-arena",
    title: "İnteraktif Bilgi Yarışması & Trivia Arena",
    description:
      "Bilim, teknoloji, tarih ve genel kültür alanlarında binlerce soruyla bilginizi canlı test edin. İnteraktif skor ve kategori filtreli trivia arenası",
    icon: HelpCircle,
    category: "text",
    accentColor: "#ec4899",
    accentClass: "from-pink-500 to-pink-600",
    status: "live",
    tags: ["trivia", "bilgi-yarışması", "quiz", "genel-kültür", "bilim", "oyun"],
    newBadge: true,
  },
  // 16. Mock Data Generator
  {
    slug: "mock-data-generator",
    title: "Geliştiriciler İçin Akıllı Mock Veri Üreteci",
    description:
      "Testler ve prototipler için Türkçe ve uluslararası sahte kimlikler, adresler, telefon numaraları, şirket bilgileri ve JSON/CSV mock verileri üretin",
    icon: Database,
    category: "developer",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["mock", "test-verisi", "sahte-kimlik", "json", "csv", "geliştirici"],
    newBadge: true,
  },
  // Existing Studio Tools
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
    tags: ["spotify", "playlist", "analiz", "audio-features", "bpm", "bot-kontrol", "chosic", "kapak"],
    featured: true,
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
    tags: ["spotify", "profil", "sanatçı", "küratör", "takipçi", "diskografi", "avatar"],
    featured: true,
  },
  {
    slug: "yt-channel-analyzer",
    title: "YouTube Kanal & Profil Analizörü Pro",
    description:
      "Abone sayısı, tahmini gelir hesaplama, 2560x1440 HD banner/avatar indirme ve son videoları anında inceleyin",
    icon: PlaySquare,
    category: "video",
    accentColor: "#ef4444",
    accentClass: "from-rose-500 to-red-600",
    status: "live",
    tags: ["youtube", "kanal", "profil", "abone", "gelir", "banner", "avatar", "analytics", "video"],
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
    title: "Kelime & Karakter Sayacı",
    description:
      "Metninizin kelime, karakter, cümle, paragraf sayısını ve tahmini okuma süresini anlık hesaplayın",
    icon: Type,
    category: "text",
    accentColor: "#10b981",
    accentClass: "from-emerald-500 to-emerald-600",
    status: "live",
    tags: ["kelime", "karakter", "sayac", "metin", "okuma-suresi"],
  },
  {
    slug: "case-converter",
    title: "Büyük/Küçük Harf & Metin Dönüştürücü",
    description:
      "Metinleri UPPERCASE, lowercase, Title Case, camelCase, snake_case ve kebab-case formatlarına dönüştürün",
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
  },
  {
    slug: "hex-color-studio",
    title: "Kapsamlı HEX Kodu & Renk Mimarisi Stüdyosu",
    description:
      "HEX, RGB, HSL, CMYK, OKLCH dönüşümleri, WCAG 2.1 kontrast analizi, renk körlüğü simülasyonu ve Tailwind 50-950 palet mimarisi",
    icon: Palette,
    category: "design",
    accentColor: "#8b5cf6",
    accentClass: "from-purple-500 to-indigo-600",
    status: "live",
    tags: ["hex", "renk", "color", "palette", "rgb", "hsl", "cmyk", "oklch", "wcag", "tailwind", "tasarım"],
    featured: true,
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
