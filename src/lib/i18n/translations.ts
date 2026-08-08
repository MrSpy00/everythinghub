export type Language = "tr" | "en";

export interface TranslationDictionary {
  // Navigation & General
  home: string;
  tools: string;
  categories: string;
  ytAnalyzerBadge: string;
  live: string;
  buyCoffee: string;
  githubRepo: string;
  allRightsReserved: string;
  designDevBy: string;

  // Hero Section
  studioTagline: string;
  studioHeroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  clear: string;
  explore: string;
  ytAnalyzerBtn: string;
  inspectAllTools: string;

  // Feature Highlights
  zeroDataTitle: string;
  zeroDataDesc: string;
  turbopackTitle: string;
  turbopackDesc: string;
  openSourceTitle: string;
  openSourceDesc: string;
  freeForeverTitle: string;
  freeForeverDesc: string;

  // Tool Grid & Categories
  toolHubHeader: string;
  allToolsTitle: string;
  activeCountLabel: string;
  searchFilterDesc: string;
  filterPlaceholder: string;
  all: string;
  videoCategory: string;
  imageCategory: string;
  developerCategory: string;
  textCategory: string;
  calcCategory: string;
  viewGrid: string;
  viewShowcase: string;
  viewCompact: string;
  noToolsFoundTitle: string;
  noToolsFoundDesc: string;
  resetFilters: string;
  runTool: string;
  comingSoon: string;
  newBadge: string;

  // Common Tool UI
  backToHub: string;
  ultraPrecise: string;
  guaranteedAccuracy: string;
  copyReport: string;
  reportCopied: string;
  exportCsv: string;
  apply: string;
  download: string;
  convert: string;
  format: string;
  minify: string;
  analyze: string;
  analyzing: string;
  
  // YT Playlist Analyzer
  ytPlaylistTitle: string;
  ytPlaylistSub: string;
  playlistUrlLabel: string;
  playlistUrlPlaceholder: string;
  tryExample: string;
  presetDailySchedule: string;
  presetRange: string;
  presetSpeed: string;
  minVal: string;
  maxVal: string;
  totalVideos: string;
  totalDuration: string;
  avgDuration: string;
  selectedVideos: string;
  speedSimulation: string;
  videoListTitle: string;
  dailyWatchTime: string;
  daysToComplete: string;

  // YT Thumbnail Downloader
  ytThumbTitle: string;
  ytThumbSub: string;
  ytThumbUrlLabel: string;
  ytThumbUrlPlaceholder: string;
  fetchThumbnails: string;
  maxRes: string;
  highRes: string;
  mediumRes: string;

  // YT Timestamp Generator
  ytTimestampTitle: string;
  ytTimestampSub: string;
  timestampStartLabel: string;
  generateLink: string;

  // Image Compressor
  imgCompressTitle: string;
  imgCompressSub: string;
  dropImage: string;
  qualityLabel: string;
  compressedSize: string;

  // Image Converter
  imgConvertTitle: string;
  imgConvertSub: string;
  targetFormat: string;

  // Color Picker
  colorPickerTitle: string;
  colorPickerSub: string;
  dominantColors: string;

  // JSON Formatter
  jsonTitle: string;
  jsonSub: string;
  beautify: string;
  rawJsonInput: string;
  jsonValid: string;
  jsonInvalid: string;

  // Base64
  base64Title: string;
  base64Sub: string;
  encode: string;
  decode: string;

  // Regex Tester
  regexTitle: string;
  regexSub: string;
  regexPattern: string;
  testString: string;
  matchesFound: string;

  // CSS Gradient Generator
  gradientTitle: string;
  gradientSub: string;
  linearGradient: string;
  radialGradient: string;
  copyCss: string;

  // Word Counter
  wordCounterTitle: string;
  wordCounterSub: string;
  words: string;
  characters: string;
  sentences: string;
  paragraphs: string;
  readingTime: string;

  // Case Converter
  caseConverterTitle: string;
  caseConverterSub: string;
  uppercase: string;
  lowercase: string;
  camelCase: string;
  snakeCase: string;
  kebabCase: string;

  // Unit Converter
  unitConverterTitle: string;
  unitConverterSub: string;
  categoryLength: string;
  categoryMass: string;
  categoryData: string;

  // Percentage Calculator
  percentageTitle: string;
  percentageSub: string;
  calculate: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  tr: {
    // Navigation & General
    home: "Ana Sayfa",
    tools: "Araçlar",
    categories: "Kategoriler",
    ytAnalyzerBadge: "YT Analyzer",
    live: "Canlı",
    buyCoffee: "Kahve Ismarla",
    githubRepo: "GitHub Projesi",
    allRightsReserved: "Tüm hakları saklıdır.",
    designDevBy: "Tasarım ve Geliştirme: aegisSoft",

    // Hero Section
    studioTagline: "Studio v1.0 · 14 Aktif Araç · Sınırsız & Ücretsiz",
    studioHeroTitle: "Dijital Araçların Stüdyosu",
    heroSubtitle: "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    searchPlaceholder: "Araç veya özellik ara (örn: youtube, playlist, json, gradient)...",
    clear: "Temizle",
    explore: "Keşfet",
    ytAnalyzerBtn: "YouTube Playlist Analyzer",
    inspectAllTools: "Tüm Araçları İncele",

    // Feature Highlights
    zeroDataTitle: "Sıfır Veri Saklama",
    zeroDataDesc: "Tamamen gizlilik odaklı",
    turbopackTitle: "Ultra Hızlı Altyapı",
    turbopackDesc: "Yüksek hızlı işlem gücü",
    openSourceTitle: "Açık Kaynak Kod",
    openSourceDesc: "GitHub üzerinde şeffaf",
    freeForeverTitle: "Sınırsız & Ücretsiz",
    freeForeverDesc: "Kayıt veya üyelik gerektirmez",

    // Tool Grid & Categories
    toolHubHeader: "Araç Merkezi",
    allToolsTitle: "Tüm Dijital Araçlar",
    activeCountLabel: "Aktif",
    searchFilterDesc: "İhtiyacınız olan aracı anında arayın, kategorilere göre filtreleyin veya etkileşimli vitrinde kaydırın.",
    filterPlaceholder: "Araç filtrele...",
    all: "Tümü",
    videoCategory: "Video & YouTube",
    imageCategory: "Görsel & Tasarım",
    developerCategory: "Geliştirici Araçları",
    textCategory: "Metin & İçerik",
    calcCategory: "Hesaplama & Birim",
    viewGrid: "Izgara",
    viewShowcase: "Vitrin",
    viewCompact: "Liste",
    noToolsFoundTitle: "Eşleşen araç bulunamadı",
    noToolsFoundDesc: "terimi için hiçbir araç bulunamadı. Lütfen farklı bir arama yapın veya filtreleri temizleyin.",
    resetFilters: "Filtreleri Sıfırla",
    runTool: "Çalıştır",
    comingSoon: "Yakında",
    newBadge: "Yeni",

    // Common Tool UI
    backToHub: "Hub Menüsüne Dön",
    ultraPrecise: "Ultra Hassas v2.5",
    guaranteedAccuracy: "%100 Doğru Süre & Sayı Garantili",
    copyReport: "Özel Raporu Kopyala",
    reportCopied: "Rapor Kopyalandı!",
    exportCsv: "CSV Dışa Aktar",
    apply: "Uygula",
    download: "İndir",
    convert: "Dönüştür",
    format: "Formatla",
    minify: "Küçült",
    analyze: "Playlist Analiz Et",
    analyzing: "Ayrıştırılıyor...",

    // YT Playlist Analyzer
    ytPlaylistTitle: "YouTube Playlist Analyzer",
    ytPlaylistSub: "Özel hazır şablon butonları, canlı çalışma planlayıcısı, özel video aralıkları ve anlık süper analiz.",
    playlistUrlLabel: "YouTube Playlist Bağlantısı veya Playlist ID",
    playlistUrlPlaceholder: "https://www.youtube.com/playlist?list=PL...",
    tryExample: "Örnek Playlist Deneyin:",
    presetDailySchedule: "Günlük İzleme Planı (Şablonlar)",
    presetRange: "Video Aralık Seçimi (Şablonlar)",
    presetSpeed: "İzleme Hızı Simülasyonu",
    minVal: "Dk",
    maxVal: "Maks",
    totalVideos: "Toplam Video",
    totalDuration: "Toplam Süre",
    avgDuration: "Ortalama Video Süresi",
    selectedVideos: "Seçili Video",
    speedSimulation: "Oynatma Hızı Analizi",
    videoListTitle: "Oynatma Listesi İçeriği & Detaylı Videolar",
    dailyWatchTime: "Günlük İzleme Süresi",
    daysToComplete: "Tamamlama Süresi",

    // YT Thumbnail Downloader
    ytThumbTitle: "YouTube Thumbnail İndirici",
    ytThumbSub: "YouTube video kapak görsellerini HD, 1080p ve 4K çözünürlüklerde anında indir veya kopyala.",
    ytThumbUrlLabel: "YouTube Video Bağlantısı veya Video ID",
    ytThumbUrlPlaceholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ...",
    fetchThumbnails: "Görselleri Getir",
    maxRes: "Maksimum Çözünürlük (4K/HD)",
    highRes: "Yüksek Çözünürlük (1080p)",
    mediumRes: "Orta Çözünürlük (720p)",

    // YT Timestamp Generator
    ytTimestampTitle: "YouTube Zaman Damgası Üretici",
    ytTimestampSub: "Videonun tam istenilen dakikasında başlatılacak zaman damgalı YouTube bağlantıları oluşturun.",
    timestampStartLabel: "Başlangıç Zamanı (Dakika / Saniye)",
    generateLink: "Bağlantıyı Oluştur",

    // Image Compressor
    imgCompressTitle: "Görsel Sıkıştırıcı",
    imgCompressSub: "PNG, JPG ve WebP görsellerini cihazınızda %90'a varan oranda boyut düşürerek sıkıştırın.",
    dropImage: "Görseli Buraya Sürükleyin veya Dosya Seçin",
    qualityLabel: "Sıkıştırma Kalitesi",
    compressedSize: "Sıkıştırılmış Boyut",

    // Image Converter
    imgConvertTitle: "Görsel Format Dönüştürücü",
    imgConvertSub: "PNG, JPG ve WebP görsellerini anında ücretsiz dönüştürün.",
    targetFormat: "Hedef Format",

    // Color Picker
    colorPickerTitle: "Renk Paleti & Çıkarıcı",
    colorPickerSub: "Görsellerden uyumlu dominant renk paletleri üretin ve HEX kodlarını kopyalayın.",
    dominantColors: "Öne Çıkan Dominant Renk Paleti",

    // JSON Formatter
    jsonTitle: "JSON Formatlayıcı & Validator",
    jsonSub: "JSON verilerinizi anında doğrulayın, güzelleştirin (beautify) veya küçültün (minify).",
    beautify: "Formatla (Beautify)",
    rawJsonInput: "Ham JSON Girdisi",
    jsonValid: "JSON Sözdizimi Geçerli",
    jsonInvalid: "Geçersiz JSON Sözdizimi",

    // Base64
    base64Title: "Base64 Kodlayıcı & Çözücü",
    base64Sub: "Metinlerinizi UTF-8 desteğiyle Base64 formatına dönüştürün veya çözün.",
    encode: "Base64 Kodla (Encode)",
    decode: "Base64 Çöz (Decode)",

    // Regex Tester
    regexTitle: "İnteraktif Regex Tester",
    regexSub: "Düzenli ifadelerinizi (Regular Expressions) canlı metinler üzerinde anlık test edin.",
    regexPattern: "Regex Deseni",
    testString: "Test Metni",
    matchesFound: "Bulunan Eşleşmeler",

    // CSS Gradient Generator
    gradientTitle: "CSS Gradient Üretici",
    gradientSub: "Çok katmanlı modern renk geçişleri oluşturun ve CSS kodlarını kopyalayın.",
    linearGradient: "Doğrusal (Linear)",
    radialGradient: "Dairesel (Radial)",
    copyCss: "CSS Kodunu Kopyala",

    // Word Counter
    wordCounterTitle: "Kelime ve Metin Sayacı",
    wordCounterSub: "Kelime, karakter, cümle ve tahmini okuma/konuşma sürelerini anlık hesaplayın.",
    words: "Kelime",
    characters: "Karakter",
    sentences: "Cümle",
    paragraphs: "Paragraf",
    readingTime: "Okuma Süresi",

    // Case Converter
    caseConverterTitle: "Metin Kasa Dönüştürücü",
    caseConverterSub: "camelCase, snake_case, kebab-case ve BÜYÜK/KÜÇÜK harf formatlarına anında dönüştürün.",
    uppercase: "BÜYÜK HARF",
    lowercase: "küçük harf",
    camelCase: "camelCase",
    snakeCase: "snake_case",
    kebabCase: "kebab-case",

    // Unit Converter
    unitConverterTitle: "Çoklu Birim Dönüştürücü",
    unitConverterSub: "Uzunluk, kütle ve veri depolama birimlerini kesintisiz ve hassas dönüştürün.",
    categoryLength: "Uzunluk",
    categoryMass: "Kütle",
    categoryData: "Veri Depolama",

    // Percentage Calculator
    percentageTitle: "Yüzde & İndirim Hesaplayıcı",
    percentageSub: "Yüzde oranları, indirimli fiyat ve KDV tutarlarını anında hesaplayın.",
    calculate: "Hesapla",
  },
  en: {
    // Navigation & General
    home: "Home",
    tools: "Tools",
    categories: "Categories",
    ytAnalyzerBadge: "YT Analyzer",
    live: "Live",
    buyCoffee: "Buy Me a Coffee",
    githubRepo: "GitHub Project",
    allRightsReserved: "All rights reserved.",
    designDevBy: "Design & Engineering: aegisSoft",

    // Hero Section
    studioTagline: "Studio v1.0 · 14 Active Tools · Unlimited & Free",
    studioHeroTitle: "Digital Tools Studio",
    heroSubtitle: "No registration, login, or API keys required; 100% private and browser-processed.",
    searchPlaceholder: "Search tools or features (e.g. youtube, playlist, json, gradient)...",
    clear: "Clear",
    explore: "Explore",
    ytAnalyzerBtn: "YouTube Playlist Analyzer",
    inspectAllTools: "Inspect All Tools",

    // Feature Highlights
    zeroDataTitle: "Zero Data Retention",
    zeroDataDesc: "Strictly privacy-first",
    turbopackTitle: "Ultra-Fast Engine",
    turbopackDesc: "High-speed processing power",
    openSourceTitle: "Open Source Code",
    openSourceDesc: "Transparent on GitHub",
    freeForeverTitle: "Unlimited & Free",
    freeForeverDesc: "No registration or login needed",

    // Tool Grid & Categories
    toolHubHeader: "Tool Hub",
    allToolsTitle: "All Digital Tools",
    activeCountLabel: "Active",
    searchFilterDesc: "Search any tool instantly, filter by categories, or swipe through the interactive showcase.",
    filterPlaceholder: "Filter tools...",
    all: "All",
    videoCategory: "Video & YouTube",
    imageCategory: "Image & Design",
    developerCategory: "Developer Tools",
    textCategory: "Text & Content",
    calcCategory: "Calculation & Units",
    viewGrid: "Grid",
    viewShowcase: "Showcase",
    viewCompact: "List",
    noToolsFoundTitle: "No matching tools found",
    noToolsFoundDesc: "No tools matched your search term. Please try a different query or reset filters.",
    resetFilters: "Reset Filters",
    runTool: "Launch",
    comingSoon: "Coming Soon",
    newBadge: "New",

    // Common Tool UI
    backToHub: "Back to Hub Menu",
    ultraPrecise: "Ultra Precise v2.5",
    guaranteedAccuracy: "100% Accurate Duration & Count Guaranteed",
    copyReport: "Copy Custom Report",
    reportCopied: "Report Copied!",
    exportCsv: "Export CSV",
    apply: "Apply",
    download: "Download",
    convert: "Convert",
    format: "Format",
    minify: "Minify",
    analyze: "Analyze Playlist",
    analyzing: "Parsing...",

    // YT Playlist Analyzer
    ytPlaylistTitle: "YouTube Playlist Analyzer",
    ytPlaylistSub: "Custom preset buttons, live watch scheduler, custom video range filters, and instant super analysis.",
    playlistUrlLabel: "YouTube Playlist Link or Playlist ID",
    playlistUrlPlaceholder: "https://www.youtube.com/playlist?list=PL...",
    tryExample: "Try Sample Playlist:",
    presetDailySchedule: "Daily Watch Schedule (Presets)",
    presetRange: "Video Range Selection (Presets)",
    presetSpeed: "Playback Speed Simulation",
    minVal: "Min",
    maxVal: "Max",
    totalVideos: "Total Videos",
    totalDuration: "Total Duration",
    avgDuration: "Average Video Duration",
    selectedVideos: "Selected Videos",
    speedSimulation: "Playback Speed Analysis",
    videoListTitle: "Playlist Contents & Detailed Videos",
    dailyWatchTime: "Daily Watch Time",
    daysToComplete: "Days to Complete",

    // YT Thumbnail Downloader
    ytThumbTitle: "YouTube Thumbnail Downloader",
    ytThumbSub: "Download or copy YouTube video cover images in HD, 1080p, and 4K resolutions instantly.",
    ytThumbUrlLabel: "YouTube Video Link or Video ID",
    ytThumbUrlPlaceholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ...",
    fetchThumbnails: "Fetch Thumbnails",
    maxRes: "Maximum Resolution (4K/HD)",
    highRes: "High Resolution (1080p)",
    mediumRes: "Medium Resolution (720p)",

    // YT Timestamp Generator
    ytTimestampTitle: "YouTube Timestamp Generator",
    ytTimestampSub: "Create timestamped YouTube links that launch videos at your exact chosen start time.",
    timestampStartLabel: "Start Time (Minutes / Seconds)",
    generateLink: "Generate Link",

    // Image Compressor
    imgCompressTitle: "Image Compressor",
    imgCompressSub: "Compress PNG, JPG, and WebP images locally on your device with up to 90% size reduction.",
    dropImage: "Drag and Drop Image Here or Click to Select File",
    qualityLabel: "Compression Quality",
    compressedSize: "Compressed Size",

    // Image Converter
    imgConvertTitle: "Image Format Converter",
    imgConvertSub: "Convert PNG, JPG, and WebP images instantly for free.",
    targetFormat: "Target Format",

    // Color Picker
    colorPickerTitle: "Color Palette Extractor",
    colorPickerSub: "Extract harmonious dominant color palettes from images and copy HEX codes.",
    dominantColors: "Featured Dominant Color Palette",

    // JSON Formatter
    jsonTitle: "JSON Formatter & Validator",
    jsonSub: "Instantly validate, beautify, or minify your JSON data.",
    beautify: "Format (Beautify)",
    rawJsonInput: "Raw JSON Input",
    jsonValid: "Valid JSON Syntax",
    jsonInvalid: "Invalid JSON Syntax",

    // Base64
    base64Title: "Base64 Encoder & Decoder",
    base64Sub: "Encode or decode your text to/from Base64 format with full UTF-8 support.",
    encode: "Encode Base64",
    decode: "Decode Base64",

    // Regex Tester
    regexTitle: "Interactive Regex Tester",
    regexSub: "Test your regular expressions live against sample texts and inspect matches.",
    regexPattern: "Regex Pattern",
    testString: "Test String",
    matchesFound: "Matches Found",

    // CSS Gradient Generator
    gradientTitle: "CSS Gradient Generator",
    gradientSub: "Create multi-layer modern color gradients and copy CSS code.",
    linearGradient: "Linear Gradient",
    radialGradient: "Radial Gradient",
    copyCss: "Copy CSS Code",

    // Word Counter
    wordCounterTitle: "Word and Text Counter",
    wordCounterSub: "Instantly calculate word, character, sentence counts and estimated reading time.",
    words: "Words",
    characters: "Characters",
    sentences: "Sentences",
    paragraphs: "Paragraphs",
    readingTime: "Reading Time",

    // Case Converter
    caseConverterTitle: "Text Case Converter",
    caseConverterSub: "Instantly convert text between camelCase, snake_case, kebab-case, and UPPERCASE/lowercase.",
    uppercase: "UPPERCASE",
    lowercase: "lowercase",
    camelCase: "camelCase",
    snakeCase: "snake_case",
    kebabCase: "kebab-case",

    // Unit Converter
    unitConverterTitle: "Multi-Unit Converter",
    unitConverterSub: "Seamlessly and accurately convert across Length, Mass, and Data Storage units.",
    categoryLength: "Length",
    categoryMass: "Mass",
    categoryData: "Data Storage",

    // Percentage Calculator
    percentageTitle: "Percentage & Discount Calculator",
    percentageSub: "Instantly calculate percentage rates, discounted prices, and amounts.",
    calculate: "Calculate",
  },
};
