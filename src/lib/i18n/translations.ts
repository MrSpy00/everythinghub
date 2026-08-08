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
  scrollToTop: string;

  // Hero Section
  studioTagline: string;
  studioHeroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  clear: string;
  explore: string;
  ytAnalyzerBtn: string;
  inspectAllTools: string;
  liveIndicator: string;

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
  designCategory: string;
  viewGrid: string;
  viewShowcase: string;
  viewCompact: string;
  noToolsFoundTitle: string;
  noToolsFoundDesc: string;
  resetFilters: string;
  runTool: string;
  comingSoon: string;
  newBadge: string;
  readyBadge: string;
  developingBadge: string;
  versionUpcoming: string;

  // Common Tool UI
  backToHub: string;
  ultraPrecise: string;
  guaranteedAccuracy: string;
  copyReport: string;
  reportCopied: string;
  copied: string;
  copy: string;
  exportCsv: string;
  exportJson: string;
  apply: string;
  download: string;
  convert: string;
  format: string;
  minify: string;
  analyze: string;
  analyzing: string;
  reset: string;
  selectAll: string;
  clearSelection: string;
  openInYoutube: string;
  openNewTab: string;
  copyLink: string;

  // YT Playlist Analyzer
  ytPlaylistTitle: string;
  ytPlaylistSub: string;
  playlistUrlLabel: string;
  playlistUrlPlaceholder: string;
  shortcutHint: string;
  calcModeLabel: string;
  calcModeFull: string;
  calcModeRange: string;
  calcModeRemaining: string;
  watchedCountLabel: string;
  includeCurrentVideo: string;
  tryExample: string;
  shuffleExamples: string;
  deviceHistoryTitle: string;
  deviceHistorySub: string;
  clearHistory: string;
  noHistoryYet: string;
  presetDailySchedule: string;
  presetRange: string;
  presetSpeed: string;
  manualRange: string;
  toWord: string;
  rangeSelectedToast: string;
  allSelectedToast: string;
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
  dailyPlannerTitle: string;
  dailyPlannerSub: string;
  dailyPresetsLabel: string;
  longestVideo: string;
  shortestVideo: string;
  timeSavedLabel: string;
  customSpeedLabel: string;
  filterVideosPlaceholder: string;
  sortIndex: string;
  sortDurationDesc: string;
  sortDurationAsc: string;
  sortTitle: string;
  showAllVideosBtn: string;
  showLessVideosBtn: string;
  analysisFailedTitle: string;
  csvSuccessToast: string;
  jsonSuccessToast: string;

  // YT Thumbnail Downloader
  ytThumbTitle: string;
  ytThumbSub: string;
  ytThumbUrlLabel: string;
  ytThumbUrlPlaceholder: string;
  fetchThumbnails: string;
  maxRes: string;
  highRes: string;
  mediumRes: string;
  realResolution: string;
  defaultResolution: string;
  downloadSuccessToast: string;
  imageOpenedToast: string;

  // YT Timestamp Generator
  ytTimestampTitle: string;
  ytTimestampSub: string;
  timestampStartLabel: string;
  generateLink: string;
  hoursLabel: string;
  minutesLabel: string;
  secondsLabel: string;
  generatedTimestampUrl: string;
  quickTimePresets: string;

  // Image Compressor
  imgCompressTitle: string;
  imgCompressSub: string;
  dropImage: string;
  qualityLabel: string;
  compressedSize: string;
  originalSize: string;
  sizeReduction: string;
  downloadCompressed: string;
  selectNewImage: string;

  // Image Converter
  imgConvertTitle: string;
  imgConvertSub: string;
  targetFormat: string;
  converting: string;
  convertedReady: string;

  // Color Picker
  colorPickerTitle: string;
  colorPickerSub: string;
  dominantColors: string;
  dropImageForPalette: string;
  hexCopied: string;
  rgbLabel: string;
  hslLabel: string;

  // JSON Formatter
  jsonTitle: string;
  jsonSub: string;
  beautify: string;
  rawJsonInput: string;
  jsonValid: string;
  jsonInvalid: string;
  formattedOutput: string;
  loadSampleJson: string;

  // Base64
  base64Title: string;
  base64Sub: string;
  encode: string;
  decode: string;
  rawTextInput: string;
  base64Input: string;
  base64Output: string;
  plainTextOutput: string;
  invalidBase64Error: string;

  // Regex Tester
  regexTitle: string;
  regexSub: string;
  regexPattern: string;
  testString: string;
  matchesFound: string;
  flagsLabel: string;
  noMatchesYet: string;

  // CSS Gradient Generator
  gradientTitle: string;
  gradientSub: string;
  linearGradient: string;
  radialGradient: string;
  copyCss: string;
  gradientDirection: string;
  colorStops: string;
  addColorStop: string;

  // Word Counter
  wordCounterTitle: string;
  wordCounterSub: string;
  words: string;
  characters: string;
  charactersNoSpaces: string;
  sentences: string;
  paragraphs: string;
  readingTime: string;
  speakingTime: string;
  textPlaceholder: string;

  // Case Converter
  caseConverterTitle: string;
  caseConverterSub: string;
  uppercase: string;
  lowercase: string;
  camelCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
  titleCase: string;
  caseInputPlaceholder: string;

  // Unit Converter
  unitConverterTitle: string;
  unitConverterSub: string;
  categoryLength: string;
  categoryMass: string;
  categoryData: string;
  categoryTemp: string;
  categorySpeed: string;
  fromUnit: string;
  toUnit: string;
  unitValue: string;
  unitResult: string;

  // Percentage Calculator
  percentageTitle: string;
  percentageSub: string;
  calculate: string;
  calcPercentageOf: string;
  calcIncreaseDecrease: string;
  calcDiscountVat: string;
  baseValue: string;
  percentageValue: string;
  resultLabel: string;
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
    scrollToTop: "En Yukarı Dön",

    // Hero Section
    studioTagline: "Studio v1.0 · 14 Aktif Araç · Sınırsız & Ücretsiz",
    studioHeroTitle: "Dijital Araçların Stüdyosu",
    heroSubtitle: "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    searchPlaceholder: "Araç veya özellik ara (örn: youtube, playlist, json, gradient)...",
    clear: "Temizle",
    explore: "Keşfet",
    ytAnalyzerBtn: "YouTube Playlist Analyzer",
    inspectAllTools: "Tüm Araçları İncele",
    liveIndicator: "CANLI ÇALIŞIYOR",

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
    designCategory: "Tasarım & Renk",
    viewGrid: "Izgara",
    viewShowcase: "Vitrin",
    viewCompact: "Liste",
    noToolsFoundTitle: "Eşleşen araç bulunamadı",
    noToolsFoundDesc: "terimi için hiçbir araç bulunamadı. Lütfen farklı bir arama yapın veya filtreleri temizleyin.",
    resetFilters: "Filtreleri Sıfırla",
    runTool: "Çalıştır",
    comingSoon: "Yakında",
    newBadge: "Yeni",
    readyBadge: "Hazır",
    developingBadge: "Geliştiriliyor",
    versionUpcoming: "v1.1 Sürümünde",

    // Common Tool UI
    backToHub: "Hub Menüsüne Dön",
    ultraPrecise: "Ultra Hassas v2.5",
    guaranteedAccuracy: "%100 Doğru Süre & Sayı Garantili",
    copyReport: "Özel Raporu Kopyala",
    reportCopied: "Rapor Kopyalandı!",
    copied: "Kopyalandı!",
    copy: "Kopyala",
    exportCsv: "CSV Dışa Aktar",
    exportJson: "JSON Dışa Aktar",
    apply: "Uygula",
    download: "İndir",
    convert: "Dönüştür",
    format: "Formatla",
    minify: "Küçült",
    analyze: "Playlist Analiz Et",
    analyzing: "Ayrıştırılıyor...",
    reset: "Sıfırla",
    selectAll: "Tümünü Seç",
    clearSelection: "Seçimleri Temizle",
    openInYoutube: "YouTube'da Aç",
    openNewTab: "Sekmede Aç",
    copyLink: "URL Kopyala",

    // YT Playlist Analyzer
    ytPlaylistTitle: "YouTube Playlist Analyzer",
    ytPlaylistSub: "Özel hazır şablon butonları, canlı çalışma planlayıcısı, özel video aralıkları ve anlık süper analiz.",
    playlistUrlLabel: "YouTube Playlist URL veya ID Yapıştırın",
    playlistUrlPlaceholder: "Playlist → youtube.com/playlist?list=PLxxxxxx\nBirden fazla bağlantı yapıştırabilirsiniz...",
    shortcutHint: "Ctrl + Enter ile çalıştır",
    calcModeLabel: "Hesaplama Modu Seçimi",
    calcModeFull: "Tüm Playlist",
    calcModeRange: "Özel Video Aralığı",
    calcModeRemaining: "Kalan Videolar Modu",
    watchedCountLabel: "Şu ana kadar izlediğim video #:",
    includeCurrentVideo: "Mevcut videoyu dahil et",
    tryExample: "Örnek Konular & Canlı Çalma Listeleri:",
    shuffleExamples: "Rastgele Konular Keşfet",
    deviceHistoryTitle: "Bu Cihazdaki Son Analizler",
    deviceHistorySub: "Önceden analiz ettiğiniz oynatma listelerini tek tıkla tekrar açın veya inceleyin.",
    clearHistory: "Geçmişi Temizle",
    noHistoryYet: "Bu cihazda henüz kaydedilmiş bir analiz geçmişi bulunmuyor.",
    presetDailySchedule: "Günlük İzleme Planı (Şablonlar)",
    presetRange: "Özel Video Aralığı & Filtre Şablonları",
    presetSpeed: "İzleme Hızı Simülasyonu",
    manualRange: "Manuel Aralık:",
    toWord: "ile",
    rangeSelectedToast: "videolar arasındaki aralık seçildi!",
    allSelectedToast: "video başarıyla analiz edildi!",
    minVal: "Dk",
    maxVal: "Maks",
    totalVideos: "Toplam Video",
    totalDuration: "Toplam Süre",
    avgDuration: "Ortalama Süre",
    selectedVideos: "Seçili Video",
    speedSimulation: "Oynatma Hızı Analizi",
    videoListTitle: "Oynatma Listesi İçeriği & Detaylı Videolar",
    dailyWatchTime: "Günlük İzleme Süresi",
    daysToComplete: "Tamamlama Süresi",
    dailyPlannerTitle: "Günlük Çalışma & İzleme Planlayıcısı",
    dailyPlannerSub: "Günde ayıracağınız zamana göre bitiş tarihini ve günlük ortalamanızı anında hesaplayın.",
    dailyPresetsLabel: "Hazır Zaman Şablonları (Günde Kaç Saat/Dakika?):",
    longestVideo: "En Uzun Video",
    shortestVideo: "En Kısa Video",
    timeSavedLabel: "zaman tasarrufu",
    customSpeedLabel: "Özel Oynatma Hızı Simülatörü",
    filterVideosPlaceholder: "Video başlığına göre filtrele...",
    sortIndex: "Sıralama: Varsayılan Liste Sırası",
    sortDurationDesc: "Süreye Göre: En Uzundan En Kısaya",
    sortDurationAsc: "Süreye Göre: En Kısadan En Uzuna",
    sortTitle: "Başlığa Göre: A'dan Z'ye",
    showAllVideosBtn: "Tüm Videoları Göster",
    showLessVideosBtn: "Daha Az Göster",
    analysisFailedTitle: "Analiz Başarısız Oldu",
    csvSuccessToast: "CSV tablosu başarıyla indirildi!",
    jsonSuccessToast: "JSON verisi başarıyla indirildi!",

    // YT Thumbnail Downloader
    ytThumbTitle: "YouTube Thumbnail İndirici",
    ytThumbSub: "YouTube video kapak görsellerini HD, 1080p ve 4K çözünürlüklerde anında indir veya kopyala.",
    ytThumbUrlLabel: "YouTube Video Bağlantısı veya Video ID",
    ytThumbUrlPlaceholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ veya dQw4w9WgXcQ...",
    fetchThumbnails: "Görselleri Getir",
    maxRes: "Maksimum Çözünürlük (4K/HD)",
    highRes: "Yüksek Çözünürlük (1080p)",
    mediumRes: "Orta Çözünürlük (720p)",
    realResolution: "Gerçek Çözünürlük",
    defaultResolution: "Varsayılan Çözünürlük",
    downloadSuccessToast: "Görsel başarıyla indirildi!",
    imageOpenedToast: "Görsel sekmede açıldı!",

    // YT Timestamp Generator
    ytTimestampTitle: "YouTube Zaman Damgası Üretici",
    ytTimestampSub: "Videonun tam istenilen dakikasında başlatılacak zaman damgalı YouTube bağlantıları oluşturun.",
    timestampStartLabel: "Başlangıç Zamanı",
    generateLink: "Bağlantıyı Oluştur",
    hoursLabel: "Saat",
    minutesLabel: "Dakika",
    secondsLabel: "Saniye",
    generatedTimestampUrl: "Oluşturulan Zaman Damgalı Bağlantı",
    quickTimePresets: "Hızlı Zaman Şablonları:",

    // Image Compressor
    imgCompressTitle: "Görsel Sıkıştırıcı",
    imgCompressSub: "PNG, JPG ve WebP görsellerini cihazınızda %90'a varan oranda boyut düşürerek sıkıştırın.",
    dropImage: "Görseli Buraya Sürükleyin veya Dosya Seçin",
    qualityLabel: "Sıkıştırma Kalitesi",
    compressedSize: "Sıkıştırılmış Boyut",
    originalSize: "Orijinal Boyut",
    sizeReduction: "Boyut Tasarrufu",
    downloadCompressed: "Sıkıştırılmış Görseli İndir",
    selectNewImage: "Farklı Görsel Seç",

    // Image Converter
    imgConvertTitle: "Görsel Format Dönüştürücü",
    imgConvertSub: "PNG, JPG, WebP ve AVIF görsellerini anında ücretsiz ve kayıpsız dönüştürün.",
    targetFormat: "Hedef Format",
    converting: "Dönüştürülüyor...",
    convertedReady: "Dönüştürülen Görsel Hazır",

    // Color Picker
    colorPickerTitle: "Renk Paleti & Resimden Renk Çıkarıcı",
    colorPickerSub: "Görsellerden uyumlu dominant renk paletleri üretin ve HEX kodlarını kopyalayın.",
    dominantColors: "Öne Çıkan Dominant Renk Paleti",
    dropImageForPalette: "Palet Çıkarmak İçin Görsel Yükleyin",
    hexCopied: "HEX Kodu Kopyalandı!",
    rgbLabel: "RGB Değeri",
    hslLabel: "HSL Değeri",

    // JSON Formatter
    jsonTitle: "JSON Formatlayıcı & Validator",
    jsonSub: "JSON verilerinizi anında doğrulayın, güzelleştirin (beautify) veya küçültün (minify).",
    beautify: "Formatla (Beautify)",
    rawJsonInput: "Ham JSON Girdisi",
    jsonValid: "JSON Sözdizimi Geçerli",
    jsonInvalid: "Geçersiz JSON Sözdizimi",
    formattedOutput: "Biçimlendirilmiş JSON Çıktısı",
    loadSampleJson: "Örnek JSON Yükle",

    // Base64
    base64Title: "Base64 Kodlayıcı & Çözücü",
    base64Sub: "Metinlerinizi UTF-8 desteğiyle Base64 formatına dönüştürün veya çözün.",
    encode: "Kodla (Encode)",
    decode: "Çöz (Decode)",
    rawTextInput: "Düz Metin Girdisi",
    base64Input: "Base64 Girdisi",
    base64Output: "Base64 Çıktısı",
    plainTextOutput: "Düz Metin Çıktısı",
    invalidBase64Error: "Geçersiz Base64 dizgisi!",

    // Regex Tester
    regexTitle: "İnteraktif Regex Tester",
    regexSub: "Düzenli ifadelerinizi (Regular Expressions) canlı metinler üzerinde anlık test edin.",
    regexPattern: "Regex Deseni",
    testString: "Test Edilecek Metin",
    matchesFound: "Bulunan Eşleşmeler",
    flagsLabel: "Bayraklar (Flags)",
    noMatchesYet: "Henüz bir eşleşme bulunamadı.",

    // CSS Gradient Generator
    gradientTitle: "CSS Gradient Üretici",
    gradientSub: "Çok katmanlı modern renk geçişleri oluşturun ve CSS kodlarını kopyalayın.",
    linearGradient: "Doğrusal (Linear)",
    radialGradient: "Dairesel (Radial)",
    copyCss: "CSS Kodunu Kopyala",
    gradientDirection: "Geçiş Açısı / Yönü",
    colorStops: "Renk Durakları",
    addColorStop: "Renk Ekle",

    // Word Counter
    wordCounterTitle: "Kelime ve Metin Sayacı",
    wordCounterSub: "Kelime, karakter, cümle ve tahmini okuma/konuşma sürelerini anlık hesaplayın.",
    words: "Kelime",
    characters: "Karakter (Boşluklu)",
    charactersNoSpaces: "Karakter (Boşluksuz)",
    sentences: "Cümle",
    paragraphs: "Paragraf",
    readingTime: "Okuma Süresi",
    speakingTime: "Konuşma Süresi",
    textPlaceholder: "Metninizi buraya yapıştırın veya yazmaya başlayın...",

    // Case Converter
    caseConverterTitle: "Metin Kasa Dönüştürücü",
    caseConverterSub: "camelCase, snake_case, kebab-case ve BÜYÜK/KÜÇÜK harf formatlarına anında dönüştürün.",
    uppercase: "BÜYÜK HARF (UPPERCASE)",
    lowercase: "küçük harf (lowercase)",
    camelCase: "camelCase",
    snakeCase: "snake_case",
    kebabCase: "kebab-case",
    constantCase: "CONSTANT_CASE",
    titleCase: "Başlık Düzeni (Title Case)",
    caseInputPlaceholder: "Dönüştürülecek metni buraya yazın...",

    // Unit Converter
    unitConverterTitle: "Çoklu Birim Dönüştürücü",
    unitConverterSub: "Uzunluk, kütle, sıcaklık, hız ve veri depolama birimlerini hassas dönüştürün.",
    categoryLength: "Uzunluk",
    categoryMass: "Kütle",
    categoryData: "Veri Depolama",
    categoryTemp: "Sıcaklık",
    categorySpeed: "Hız",
    fromUnit: "Kaynak Birim",
    toUnit: "Hedef Birim",
    unitValue: "Dönüştürülecek Değer",
    unitResult: "Dönüştürme Sonucu",

    // Percentage Calculator
    percentageTitle: "Yüzde & İndirim Hesaplayıcı",
    percentageSub: "Yüzde oranları, indirimli fiyat ve KDV tutarlarını anında hesaplayın.",
    calculate: "Hesapla",
    calcPercentageOf: "Bir Sayının Yüzdesi",
    calcIncreaseDecrease: "Yüzdelik Değişim (Artış / Azalış)",
    calcDiscountVat: "İndirim ve KDV Tutarı",
    baseValue: "Ana Sayı / Fiyat",
    percentageValue: "Yüzde Oranı (%)",
    resultLabel: "Hesaplanan Sonuç",
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
    scrollToTop: "Scroll to Top",

    // Hero Section
    studioTagline: "Studio v1.0 · 14 Active Tools · Unlimited & Free",
    studioHeroTitle: "Digital Tools Studio",
    heroSubtitle: "No registration, login, or API keys required; 100% private and browser-processed.",
    searchPlaceholder: "Search tools or features (e.g. youtube, playlist, json, gradient)...",
    clear: "Clear",
    explore: "Explore",
    ytAnalyzerBtn: "YouTube Playlist Analyzer",
    inspectAllTools: "Inspect All Tools",
    liveIndicator: "SYSTEM OPERATIONAL",

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
    designCategory: "Design & Color",
    viewGrid: "Grid",
    viewShowcase: "Showcase",
    viewCompact: "List",
    noToolsFoundTitle: "No matching tools found",
    noToolsFoundDesc: "No tools matched your search term. Please try a different query or reset filters.",
    resetFilters: "Reset Filters",
    runTool: "Launch",
    comingSoon: "Coming Soon",
    newBadge: "New",
    readyBadge: "Ready",
    developingBadge: "In Progress",
    versionUpcoming: "In v1.1 Release",

    // Common Tool UI
    backToHub: "Back to Hub Menu",
    ultraPrecise: "Ultra Precise v2.5",
    guaranteedAccuracy: "100% Accurate Duration & Count Guaranteed",
    copyReport: "Copy Custom Report",
    reportCopied: "Report Copied!",
    copied: "Copied!",
    copy: "Copy",
    exportCsv: "Export CSV",
    exportJson: "Export JSON",
    apply: "Apply",
    download: "Download",
    convert: "Convert",
    format: "Format",
    minify: "Minify",
    analyze: "Analyze Playlist",
    analyzing: "Parsing...",
    reset: "Reset",
    selectAll: "Select All",
    clearSelection: "Clear Selection",
    openInYoutube: "Open in YouTube",
    openNewTab: "Open in Tab",
    copyLink: "Copy Link",

    // YT Playlist Analyzer
    ytPlaylistTitle: "YouTube Playlist Analyzer",
    ytPlaylistSub: "Custom preset buttons, live watch scheduler, custom video range filters, and instant super analysis.",
    playlistUrlLabel: "Paste YouTube Playlist URL or ID",
    playlistUrlPlaceholder: "Playlist → youtube.com/playlist?list=PLxxxxxx\nYou can paste multiple links...",
    shortcutHint: "Press Ctrl + Enter to analyze",
    calcModeLabel: "Calculation Mode Selection",
    calcModeFull: "Full Playlist",
    calcModeRange: "Custom Video Range",
    calcModeRemaining: "Remaining Videos Mode",
    watchedCountLabel: "Videos watched so far #:",
    includeCurrentVideo: "Include current video",
    tryExample: "Sample Topics & Live Playlists:",
    shuffleExamples: "Discover Random Topics",
    deviceHistoryTitle: "Recent Analyses on this Device",
    deviceHistorySub: "Instantly reopen or inspect playlists you previously analyzed on this device.",
    clearHistory: "Clear History",
    noHistoryYet: "No analysis history recorded on this device yet.",
    presetDailySchedule: "Daily Watch Schedule (Presets)",
    presetRange: "Custom Video Range & Filter Presets",
    presetSpeed: "Playback Speed Simulation",
    manualRange: "Manual Range:",
    toWord: "to",
    rangeSelectedToast: "videos selected in range!",
    allSelectedToast: "videos successfully analyzed!",
    minVal: "Min",
    maxVal: "Max",
    totalVideos: "Total Videos",
    totalDuration: "Total Duration",
    avgDuration: "Average Duration",
    selectedVideos: "Selected Videos",
    speedSimulation: "Playback Speed Analysis",
    videoListTitle: "Playlist Contents & Detailed Videos",
    dailyWatchTime: "Daily Watch Time",
    daysToComplete: "Days to Complete",
    dailyPlannerTitle: "Daily Study & Watch Planner",
    dailyPlannerSub: "Calculate your exact completion date and daily average based on your allocated time.",
    dailyPresetsLabel: "Ready Time Presets (How many hours/minutes per day?):",
    longestVideo: "Longest Video",
    shortestVideo: "Shortest Video",
    timeSavedLabel: "time saved",
    customSpeedLabel: "Custom Speed Simulator",
    filterVideosPlaceholder: "Filter by video title...",
    sortIndex: "Sort: Default Playlist Order",
    sortDurationDesc: "Sort by Duration: Longest to Shortest",
    sortDurationAsc: "Sort by Duration: Shortest to Longest",
    sortTitle: "Sort by Title: A to Z",
    showAllVideosBtn: "Show All Videos",
    showLessVideosBtn: "Show Less",
    analysisFailedTitle: "Analysis Failed",
    csvSuccessToast: "CSV sheet successfully downloaded!",
    jsonSuccessToast: "JSON payload successfully exported!",

    // YT Thumbnail Downloader
    ytThumbTitle: "YouTube Thumbnail Downloader",
    ytThumbSub: "Download or copy YouTube video cover images in HD, 1080p, and 4K resolutions instantly.",
    ytThumbUrlLabel: "YouTube Video Link or Video ID",
    ytThumbUrlPlaceholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ...",
    fetchThumbnails: "Fetch Thumbnails",
    maxRes: "Maximum Resolution (4K/HD)",
    highRes: "High Resolution (1080p)",
    mediumRes: "Medium Resolution (720p)",
    realResolution: "Real Resolution",
    defaultResolution: "Default Resolution",
    downloadSuccessToast: "Image downloaded successfully!",
    imageOpenedToast: "Image opened in new tab!",

    // YT Timestamp Generator
    ytTimestampTitle: "YouTube Timestamp Generator",
    ytTimestampSub: "Create timestamped YouTube links that launch videos at your exact chosen start time.",
    timestampStartLabel: "Start Time",
    generateLink: "Generate Link",
    hoursLabel: "Hours",
    minutesLabel: "Minutes",
    secondsLabel: "Seconds",
    generatedTimestampUrl: "Generated Timestamp Link",
    quickTimePresets: "Quick Time Presets:",

    // Image Compressor
    imgCompressTitle: "Image Compressor",
    imgCompressSub: "Compress PNG, JPG, and WebP images locally on your device with up to 90% size reduction.",
    dropImage: "Drag and Drop Image Here or Click to Select File",
    qualityLabel: "Compression Quality",
    compressedSize: "Compressed Size",
    originalSize: "Original Size",
    sizeReduction: "Size Reduction",
    downloadCompressed: "Download Compressed Image",
    selectNewImage: "Select Another Image",

    // Image Converter
    imgConvertTitle: "Image Format Converter",
    imgConvertSub: "Convert PNG, JPG, WebP, and AVIF images instantly for free without quality loss.",
    targetFormat: "Target Format",
    converting: "Converting...",
    convertedReady: "Converted Image Ready",

    // Color Picker
    colorPickerTitle: "Color Palette & Extractor",
    colorPickerSub: "Extract harmonious dominant color palettes from images and copy HEX codes.",
    dominantColors: "Featured Dominant Color Palette",
    dropImageForPalette: "Upload Image to Extract Palette",
    hexCopied: "HEX Code Copied!",
    rgbLabel: "RGB Value",
    hslLabel: "HSL Value",

    // JSON Formatter
    jsonTitle: "JSON Formatter & Validator",
    jsonSub: "Instantly validate, beautify, or minify your JSON data.",
    beautify: "Format (Beautify)",
    rawJsonInput: "Raw JSON Input",
    jsonValid: "Valid JSON Syntax",
    jsonInvalid: "Invalid JSON Syntax",
    formattedOutput: "Formatted JSON Output",
    loadSampleJson: "Load Sample JSON",

    // Base64
    base64Title: "Base64 Encoder & Decoder",
    base64Sub: "Encode or decode your text to/from Base64 format with full UTF-8 support.",
    encode: "Encode Base64",
    decode: "Decode Base64",
    rawTextInput: "Plain Text Input",
    base64Input: "Base64 Input",
    base64Output: "Base64 Output",
    plainTextOutput: "Plain Text Output",
    invalidBase64Error: "Invalid Base64 string!",

    // Regex Tester
    regexTitle: "Interactive Regex Tester",
    regexSub: "Test your regular expressions live against sample texts and inspect matches.",
    regexPattern: "Regex Pattern",
    testString: "Test String",
    matchesFound: "Matches Found",
    flagsLabel: "Flags",
    noMatchesYet: "No matches found yet.",

    // CSS Gradient Generator
    gradientTitle: "CSS Gradient Generator",
    gradientSub: "Create multi-layer modern color gradients and copy CSS code.",
    linearGradient: "Linear Gradient",
    radialGradient: "Radial Gradient",
    copyCss: "Copy CSS Code",
    gradientDirection: "Gradient Direction / Angle",
    colorStops: "Color Stops",
    addColorStop: "Add Color Stop",

    // Word Counter
    wordCounterTitle: "Word and Text Counter",
    wordCounterSub: "Instantly calculate word, character, sentence counts and estimated reading time.",
    words: "Words",
    characters: "Characters (with spaces)",
    charactersNoSpaces: "Characters (no spaces)",
    sentences: "Sentences",
    paragraphs: "Paragraphs",
    readingTime: "Reading Time",
    speakingTime: "Speaking Time",
    textPlaceholder: "Paste your text here or start typing...",

    // Case Converter
    caseConverterTitle: "Text Case Converter",
    caseConverterSub: "Instantly convert text between camelCase, snake_case, kebab-case, and UPPERCASE/lowercase.",
    uppercase: "UPPERCASE",
    lowercase: "lowercase",
    camelCase: "camelCase",
    snakeCase: "snake_case",
    kebabCase: "kebab-case",
    constantCase: "CONSTANT_CASE",
    titleCase: "Title Case",
    caseInputPlaceholder: "Enter text to convert here...",

    // Unit Converter
    unitConverterTitle: "Multi-Unit Converter",
    unitConverterSub: "Seamlessly and accurately convert across Length, Mass, Temperature, Speed, and Data Storage units.",
    categoryLength: "Length",
    categoryMass: "Mass",
    categoryData: "Data Storage",
    categoryTemp: "Temperature",
    categorySpeed: "Speed",
    fromUnit: "From Unit",
    toUnit: "To Unit",
    unitValue: "Value to Convert",
    unitResult: "Converted Result",

    // Percentage Calculator
    percentageTitle: "Percentage & Discount Calculator",
    percentageSub: "Instantly calculate percentage rates, discounted prices, and amounts.",
    calculate: "Calculate",
    calcPercentageOf: "Percentage of a Number",
    calcIncreaseDecrease: "Percentage Change (Increase / Decrease)",
    calcDiscountVat: "Discount and Tax Amount",
    baseValue: "Base Amount / Price",
    percentageValue: "Percentage Rate (%)",
    resultLabel: "Calculated Result",
  },
};
