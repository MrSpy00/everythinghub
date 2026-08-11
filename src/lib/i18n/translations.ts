export type Language = "tr" | "en";

export interface ToolTranslation {
  title: string;
  description: string;
}

export interface TranslationDictionary {
  // Navigation & General
  home: string;
  tools: string;
  categories: string;
  quickAccess: string;
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
  audioCategory: string;
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

  // Spotify Playlist Analyzer & Profile Analyzer
  spotifyPlaylistTitle: string;
  spotifyPlaylistSub: string;
  spotifyProfileTitle: string;
  spotifyProfileSub: string;
  spotifyUrlPlaceholder: string;
  spotifyProfilePlaceholder: string;
  sonicRadarTitle: string;
  botShieldTitle: string;
  genreGalaxyTitle: string;
  keyWheelTitle: string;
  decadeTimelineTitle: string;
  coverStudioTitle: string;
  trackExplorerTitle: string;
  duplicateFinderTitle: string;
  exportStudioTitle: string;
  qualityScoreLabel: string;
  safeVerdict: string;
  moderateVerdict: string;
  highRiskVerdict: string;
  stuffingFlagLabel: string;
  durationAnomalyLabel: string;
  bimodalAnomalyLabel: string;
  energyLabel: string;
  danceabilityLabel: string;
  valenceLabel: string;
  acousticnessLabel: string;
  instrumentalnessLabel: string;
  livenessLabel: string;
  speechinessLabel: string;
  bpmLabel: string;
  loudnessLabel: string;
  dominantMoodLabel: string;
  chillMood: string;
  workoutMood: string;
  melancholicMood: string;
  focusMood: string;
  partyMood: string;
  artistDiversityLabel: string;
  curatorReachLabel: string;
  publicPlaylistsLabel: string;
  topTracksLabel: string;
  discographyLabel: string;

  // Dynamic Tool Translations Map
  toolTranslations: Record<string, ToolTranslation>;
}

export const translations: Record<Language, TranslationDictionary> = {
  tr: {
    // Navigation & General
    home: "Ana Sayfa",
    tools: "Araçlar",
    categories: "Kategoriler",
    quickAccess: "Hızlı Erişim",
    ytAnalyzerBadge: "YT Analizörü",
    live: "Canlı",
    buyCoffee: "Kahve Ismarla",
    githubRepo: "GitHub Projesi",
    allRightsReserved: "Tüm hakları saklıdır.",
    designDevBy: "Tasarım ve Geliştirme: aegisSoft",
    scrollToTop: "En Yukarı Dön",

    // Hero Section
    studioTagline: "Studio v1.0 · 41+ Aktif Araç · Sınırsız & Ücretsiz",
    studioHeroTitle: "Dijital Araçların Stüdyosu",
    heroSubtitle: "Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.",
    searchPlaceholder: "Araç veya özellik ara (örn: youtube, playlist, json, gradient)...",
    clear: "Temizle",
    explore: "Keşfet",
    ytAnalyzerBtn: "YouTube Çalma Listesi Analizörü",
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
    audioCategory: "Ses & Müzik",
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
    openNewTab: "Yeni Sekmede Aç",
    copyLink: "Bağlantıyı Kopyala",

    // YT Playlist Analyzer
    ytPlaylistTitle: "YouTube Çalma Listesi Analizörü",
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
    ytThumbTitle: "YouTube Kapak Görseli İndirici",
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
    imgCompressTitle: "Görsel Sıkıştırıcı & Boyut Küçültücü",
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
    gradientTitle: "CSS & Tailwind Gradient Üretici",
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
    caseConverterTitle: "Metin Harf Formatı Dönüştürücü",
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

    // Spotify Playlist Analyzer & Profile Analyzer (TR)
    spotifyPlaylistTitle: "Spotify Playlist Analizör & Sonic Stüdyosu",
    spotifyPlaylistSub: "Chosic, Artist.tools ve SubmitHub seviyesinde derin bot tespiti, sonic DNA radarı, tür galaksisi ve HD kapak stüdyosu.",
    spotifyProfileTitle: "Spotify Profil & Sanatçı Analizörü",
    spotifyProfileSub: "Küratör ve sanatçı profillerinin takipçi etki gücünü, diskografisini, en popüler şarkılarını ve yüksek çözünürlüklü avatarlarını inceleyin.",
    spotifyUrlPlaceholder: "Spotify Çalma Listesi URL'si veya URI yapıştırın (örn: https://open.spotify.com/playlist/...)",
    spotifyProfilePlaceholder: "Spotify Kullanıcı veya Sanatçı URL'si yapıştırın (örn: https://open.spotify.com/artist/...)",
    sonicRadarTitle: "Sonic DNA Radarı (Audio Features)",
    botShieldTitle: "Bot & Sahte Akış Güvenlik Kalkanı",
    genreGalaxyTitle: "Tür Galaksisi & Vibe Analizi",
    keyWheelTitle: "Camelot & Müzikal Anahtar Çarkı",
    decadeTimelineTitle: "Zaman Tüneli & Çıkış Yılları",
    coverStudioTitle: "Yüksek Çözünürlüklü Kapak Stüdyosu",
    trackExplorerTitle: "Parça Listesi & Akıllı Filtreler",
    duplicateFinderTitle: "Kopya Şarkı Tespiti & Temizleyici",
    exportStudioTitle: "Dışa Aktarma & DJ Araçları",
    qualityScoreLabel: "Kalite Skoru",
    safeVerdict: "Güvenli & Organik Liste",
    moderateVerdict: "Dikkat - Orta Risk Seviyesi",
    highRiskVerdict: "Yüksek Risk - Şüpheli Bot/Payola Akışı",
    stuffingFlagLabel: "Sanatçı Yığma Anomalisi",
    durationAnomalyLabel: "Kısa Şarkı Stream Avcılığı",
    bimodalAnomalyLabel: "Aşırı Popülerlik Ayrışması",
    energyLabel: "Enerji",
    danceabilityLabel: "Dans Edilebilirlik",
    valenceLabel: "Pozitiflik / Mood",
    acousticnessLabel: "Akustiklik",
    instrumentalnessLabel: "Enstrümantallik",
    livenessLabel: "Canlılık",
    speechinessLabel: "Konuşma Oranı",
    bpmLabel: "Tempo (BPM)",
    loudnessLabel: "Ses Şiddeti (dB)",
    dominantMoodLabel: "Baskın Mood Vibe",
    chillMood: "Sakin & Dinlendirici",
    workoutMood: "Yüksek Enerjili & Spor",
    melancholicMood: "Melankolik & Duygusal",
    focusMood: "Derin Odaklanma & Çalışma",
    partyMood: "Parti & Dans",
    artistDiversityLabel: "Sanatçı Çeşitlilik İndeksi",
    curatorReachLabel: "Küratör Takipçi Erişimi",
    publicPlaylistsLabel: "Halka Açık Çalma Listeleri",
    topTracksLabel: "En Popüler Şarkılar",
    discographyLabel: "Diskografi Dökümü",

    // Tool Card Dynamic Translations (TR)
    toolTranslations: {
      "api-playground": {
        title: "Canlı API Test Konsolu & Açık API Kataloğu",
        description: "150+ ücretsiz ve sıfır-auth açık API'yi canlı test edin, özel HTTP GET/POST istekleri gönderin.",
      },
      "qr-code-studio": {
        title: "QR Kod Stüdyosu Pro",
        description: "WiFi şifre paylaşımı, vCard, URL ve kripto cüzdanlar için özel renkli vektörel SVG ve PNG QR kodları üretin.",
      },
      "jwt-debugger": {
        title: "İstemci Taraflı JWT Debugger & Token Çözücü",
        description: "JWT başlık, payload ve imza verilerini %100 tarayıcı tarafında çözün ve süre geri sayımını izleyin.",
      },
      "crypto-hash-studio": {
        title: "Kriptografik Hash, HMAC & UUID Laboratuvarı",
        description: "SHA-256, SHA-512, MD5, HMAC ve UUID v4/v7 üretimini Web Crypto API ile anında gerçekleştirin.",
      },
      "barcode-generator": {
        title: "Vektörel Barkod Üreteci",
        description: "EAN-13, UPC-A, Code 128 ve Code 39 standartlarında vektörel SVG ve yüksek çözünürlüklü PNG barkodları üretin.",
      },
      "weather-air-quality": {
        title: "Canlı Hava Durumu & Hava Kalitesi Radarı",
        description: "Open-Meteo ile dünya genelinde 7 günlük saatlik hava durumu, UV indeksi ve PM2.5/PM10 hava kalitesini takip edin.",
      },
      "world-countries-explorer": {
        title: "Dünya Ülkeleri & Coğrafya Stüdyosu",
        description: "250+ dünya ülkesinin bayrakları, nüfusu, başkenti, dilleri ve para birimlerini keşfedin ve karşılaştırın.",
      },
      "audio-spectrum-studio": {
        title: "Web Audio Osiloskop & Spektrum Analizörü",
        description: "Mikrofon veya ses dalgalarını gerçek zamanlı osiloskop ve FFT frekans spektrumu olarak analiz edin.",
      },
      "bpm-tapper": {
        title: "Hassas BPM Tapper & Akıllı Metronom",
        description: "Klavyeden veya dokunarak anlık BPM hesaplayın ve Web Audio milisaniye zamanlayıcılı metronom ile ritim tutun.",
      },
      "exif-purger": {
        title: "EXIF Metaveri İnceleyici & Gizlilik Temizleyici",
        description: "Fotoğraflarınızdaki GPS konum koordinatlarını, kamera modelini inceleyin ve paylaşmadan önce temizleyin.",
      },
      "sql-to-types": {
        title: "SQL'den TypeScript, Zod & Prisma Dönüştürücü",
        description: "SQL CREATE TABLE tablolarını TypeScript interface, Zod şeması, Prisma modeli ve Go struct kodlarına dönüştürün.",
      },
      "curl-to-code": {
        title: "cURL'den Çoklu Dil Kod Üreticisi",
        description: "cURL komutlarını JavaScript fetch, Axios, Python requests, Go ve PHP kodlarına anında çevirin.",
      },
      "smart-dictionary": {
        title: "İngilizce Akıllı Sözlük, Telaffuz & Kafiye Motoru",
        description: "İngilizce kelimelerin fonetik telaffuz seslerini dinleyin, tanımları inceleyin ve kafiyeli kelimeleri keşfedin.",
      },
      "book-isbn-finder": {
        title: "Açık Kitaplık & ISBN Arama Motoru",
        description: "20M+ kitap, yazar ve ISBN numarası üzerinden kitap kapağı, yayıncı ve basım yılı bilgilerini arayın.",
      },
      "trivia-quiz-arena": {
        title: "İnteraktif Bilgi Yarışması & Trivia Arena",
        description: "Bilim, teknoloji, tarih ve genel kültür alanlarında binlerce soruyla bilginizi canlı test edin.",
      },
      "mock-data-generator": {
        title: "Geliştiriciler İçin Akıllı Mock Veri Üreteci",
        description: "Testler için Türkçe ve uluslararası sahte kimlikler, adresler, telefonlar ve JSON/CSV mock verileri üretin.",
      },
      "ip-network-info": {
        title: "IP & Ağ Latency Analizörü",
        description: "IP adresinizi, coğrafi konumunuzu, ISP sağlayıcınızı ve CDN ping sürelerinizi canlı analiz edin.",
      },
      "dns-lookup-tool": {
        title: "DNS Kayıtları & DoH Sorgulayıcı",
        description: "A, AAAA, MX, TXT ve CNAME DNS kayıtlarını Cloudflare & Google DoH altyapısıyla sorgulayın.",
      },
      "currency-exchange-converter": {
        title: "Canlı Döviz & Kripto Dönüştürücü",
        description: "150+ itibari para birimi ve kripto varlık arasında Avrupa Merkez Bankası verileriyle canlı dönüşüm yapın.",
      },
      "markdown-studio": {
        title: "Markdown Studio & Canlı Önizleme",
        description: "Markdown dokümanlarınızı canlı önizleyin, metrikleri görün, HTML veya .md olarak indirin.",
      },
      "cron-expression-studio": {
        title: "Cron İfadesi Üreteci & Açıklayıcı",
        description: "Linux crontab zamanlamalarını görsel olarak üretin ve Türkçe insani açıklamasını görün.",
      },
      "favicon-extractor": {
        title: "Site Favicon & Logo İndirici",
        description: "Herhangi bir web sitesinin HD favicon, Apple touch icon ve SVG logosunu anında indirin.",
      },
      "spotify-playlist-analyzer": {
        title: "Spotify Playlist Analizör",
        description: "Chosic & Artist.tools seviyesinde Sonic DNA radarı, bot tespiti, türler ve HD kapak stüdyosu.",
      },
      "spotify-profile-analyzer": {
        title: "Spotify Profil & Sanatçı Analizör",
        description: "Küratör ve sanatçı profillerini inceleyin, takipçi gücünü, diskografiyi ve HD avatarları çıkarın.",
      },
      "yt-playlist-length": {
        title: "YouTube Çalma Listesi Analizörü",
        description: "Playlist süresini hesapla, hız simülasyonunu gör, kapak görselleri ve CSV dışa aktar.",
      },
      "yt-thumbnail-downloader": {
        title: "YouTube Kapak Görseli İndirici",
        description: "Herhangi bir YouTube videosunun HD, 1080p ve 4K kapak görsellerini ücretsiz indirin.",
      },
      "yt-timestamp-generator": {
        title: "YouTube Zaman Damgası Oluşturucu",
        description: "İstenilen dakikada başlatılacak zaman damgalı YouTube bağlantıları oluşturun.",
      },
      "image-compressor": {
        title: "Görsel Sıkıştırıcı & Boyut Küçültücü",
        description: "PNG, JPG ve WebP görsellerini kalite kaybı olmadan %90'a varan oranda sıkıştırın.",
      },
      "image-converter": {
        title: "Görsel Format Dönüştürücü",
        description: "PNG, JPG, WebP ve AVIF formatları arasında kayıpsız ve anında dönüştürme yapın.",
      },
      "color-picker": {
        title: "Renk Paleti & Resimden Renk Çıkarıcı",
        description: "Görselden dominant renk paletini çıkarın, HEX, RGB ve HSL kodlarını alın.",
      },
      "json-formatter": {
        title: "JSON Formatlayıcı & Validator",
        description: "JSON verinizi doğrulayın, güzelleştirin, ağaç görünümünde inceleyin ve küçültün.",
      },
      "base64-encoder": {
        title: "Base64 Kodlayıcı & Çözücü",
        description: "Metinleri UTF-8 desteğiyle Base64 formatına dönüştürün veya güvenle çözün.",
      },
      "regex-tester": {
        title: "İnteraktif Regex Tester",
        description: "Düzenli ifadeleri (Regex) canlı metinler üzerinde test edin ve eşleşmeleri inceleyin.",
      },
      "css-gradient-generator": {
        title: "CSS & Tailwind Gradient Üretici",
        description: "Çok katmanlı modern renk geçişleri oluşturun ve CSS kodlarını kopyalayın.",
      },
      "word-counter": {
        title: "Kelime ve Metin Sayacı",
        description: "Kelime, karakter, cümle ve tahmini okuma/konuşma sürelerini anlık hesaplayın.",
      },
      "case-converter": {
        title: "Metin Harf Formatı Dönüştürücü",
        description: "camelCase, snake_case, kebab-case ve BÜYÜK/KÜÇÜK harf dönüşümlerini anında yapın.",
      },
      "unit-converter": {
        title: "Çoklu Birim Dönüştürücü",
        description: "Uzunluk, kütle, sıcaklık, hız ve veri depolama birimlerini hassas dönüştürün.",
      },
      "percentage-calculator": {
        title: "Yüzde & İndirim Hesaplayıcı",
        description: "Yüzde oranları, indirimli fiyat ve KDV tutarlarını anında hesaplayın.",
      },
    },
  },
  en: {
    // Navigation & General
    home: "Home",
    tools: "Tools",
    categories: "Categories",
    quickAccess: "Quick Access",
    ytAnalyzerBadge: "YT Analyzer",
    live: "Live",
    buyCoffee: "Buy Me a Coffee",
    githubRepo: "GitHub Project",
    allRightsReserved: "All rights reserved.",
    designDevBy: "Design & Engineering: aegisSoft",
    scrollToTop: "Scroll to Top",

    // Hero Section
    studioTagline: "Studio v1.0 · 41+ Active Tools · Unlimited & Free",
    studioHeroTitle: "Digital Tools Studio",
    heroSubtitle: "No registration, login, or API keys required; 100% private and browser-processed.",
    searchPlaceholder: "Search tools or features (e.g. youtube, playlist, json, gradient)...",
    clear: "Clear",
    explore: "Explore",
    ytAnalyzerBtn: "YouTube Playlist Length & Video Analyzer",
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
    audioCategory: "Audio & Music",
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
    openNewTab: "Open in New Tab",
    copyLink: "Copy Link",

    // YT Playlist Analyzer
    ytPlaylistTitle: "YouTube Playlist Length & Video Analyzer",
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
    imgCompressTitle: "Image Compressor & Size Reducer",
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
    jsonSub: "Instantly validate, beautify, inspect tree structures, or minify your JSON data.",
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
    gradientTitle: "CSS & Tailwind Gradient Generator",
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
    caseConverterSub: "Instantly convert between camelCase, snake_case, kebab-case, Title Case and UPPERCASE.",
    uppercase: "UPPERCASE",
    lowercase: "lowercase",
    camelCase: "camelCase",
    snakeCase: "snake_case",
    kebabCase: "kebab-case",
    constantCase: "CONSTANT_CASE",
    titleCase: "Title Case",
    caseInputPlaceholder: "Type or paste text to convert...",

    // Unit Converter
    unitConverterTitle: "Multi-Unit Converter",
    unitConverterSub: "Convert length, mass, temperature, speed, and digital storage units with high precision.",
    categoryLength: "Length",
    categoryMass: "Mass",
    categoryData: "Data Storage",
    categoryTemp: "Temperature",
    categorySpeed: "Speed",
    fromUnit: "Source Unit",
    toUnit: "Target Unit",
    unitValue: "Value to Convert",
    unitResult: "Converted Result",

    // Percentage Calculator
    percentageTitle: "Percentage & Discount Calculator",
    percentageSub: "Calculate percentages, discounts, VAT and price adjustments instantly.",
    calculate: "Calculate",
    calcPercentageOf: "Percentage of a Number",
    calcIncreaseDecrease: "Percentage Change (Increase / Decrease)",
    calcDiscountVat: "Discount & VAT Amount",
    baseValue: "Base Amount / Price",
    percentageValue: "Percentage Rate (%)",
    resultLabel: "Calculated Result",

    // Spotify Playlist Analyzer & Profile Analyzer (EN)
    spotifyPlaylistTitle: "Spotify Playlist Analyzer & Sonic Studio",
    spotifyPlaylistSub: "Deep bot detection, sonic DNA radar, genre galaxy, and HD cover studio matching Chosic, Artist.tools, and SubmitHub.",
    spotifyProfileTitle: "Spotify Profile & Artist Analyzer",
    spotifyProfileSub: "Inspect curator and artist profiles, analyze follower reach, discography breakdowns, top tracks, and download HD avatars.",
    spotifyUrlPlaceholder: "Paste Spotify Playlist URL or URI (e.g., https://open.spotify.com/playlist/...)",
    spotifyProfilePlaceholder: "Paste Spotify User or Artist URL (e.g., https://open.spotify.com/artist/...)",
    sonicRadarTitle: "Sonic DNA Radar (Audio Features)",
    botShieldTitle: "Bot & Artificial Stream Shield",
    genreGalaxyTitle: "Genre Galaxy & Mood Vibe",
    keyWheelTitle: "Camelot & Musical Key Wheel",
    decadeTimelineTitle: "Decade Timeline & Release Distribution",
    coverStudioTitle: "High-Resolution Artwork Studio",
    trackExplorerTitle: "Tracklist & Intelligent Filters",
    duplicateFinderTitle: "Duplicate Track Scanner & Cleaner",
    exportStudioTitle: "Export Studio & DJ Tools",
    qualityScoreLabel: "Quality Score",
    safeVerdict: "Safe & Organic Playlist",
    moderateVerdict: "Caution - Moderate Risk Detected",
    highRiskVerdict: "High Risk - Suspicious Bot / Payola Activity",
    stuffingFlagLabel: "Artist Stacking Anomaly",
    durationAnomalyLabel: "Short Song Stream Farming Anomaly",
    bimodalAnomalyLabel: "Extreme Popularity Discrepancy",
    energyLabel: "Energy",
    danceabilityLabel: "Danceability",
    valenceLabel: "Valence (Mood)",
    acousticnessLabel: "Acousticness",
    instrumentalnessLabel: "Instrumentalness",
    livenessLabel: "Liveness",
    speechinessLabel: "Speechiness",
    bpmLabel: "Tempo (BPM)",
    loudnessLabel: "Loudness (dB)",
    dominantMoodLabel: "Dominant Mood Vibe",
    chillMood: "Chill & Relaxing",
    workoutMood: "High Energy & Workout",
    melancholicMood: "Melancholic & Emotional",
    focusMood: "Deep Focus & Study",
    partyMood: "Party & Dance",
    artistDiversityLabel: "Artist Diversity Index",
    curatorReachLabel: "Curator Follower Reach",
    publicPlaylistsLabel: "Public Playlists",
    topTracksLabel: "Top Tracks",
    discographyLabel: "Discography Breakdown",

    // Tool Card Dynamic Translations (EN)
    toolTranslations: {
      "api-playground": {
        title: "Live API Test Console & Public API Hub",
        description: "Test 150+ free and zero-auth public APIs live, send custom HTTP GET/POST requests and inspect payloads.",
      },
      "qr-code-studio": {
        title: "Vector QR Code Studio Pro",
        description: "Generate customized vector SVG and HD PNG QR codes for WiFi passwords, vCards, URLs, and crypto wallets.",
      },
      "jwt-debugger": {
        title: "Client-Side JWT Debugger & Token Decoder",
        description: "Decode JWT header, payload, and signatures 100% in-browser with live expiration countdown and claim parsing.",
      },
      "crypto-hash-studio": {
        title: "Cryptographic Hash, HMAC & UUID Lab",
        description: "Generate SHA-256, SHA-512, MD5, HMAC and UUID v4/v7 instantly using the browser's native Web Crypto API.",
      },
      "barcode-generator": {
        title: "Vector Barcode Generator",
        description: "Create print-ready vector SVG and high-resolution PNG barcodes in EAN-13, UPC-A, Code 128 and Code 39 formats.",
      },
      "weather-air-quality": {
        title: "Live Weather & Air Quality Radar",
        description: "Track 7-day hourly weather forecasts, UV index, and PM2.5/PM10 European Air Quality Index (AQI) globally with Open-Meteo.",
      },
      "world-countries-explorer": {
        title: "World Countries & Geography Studio",
        description: "Explore and compare flags, populations, capitals, languages, and currencies for 250+ countries via REST Countries.",
      },
      "audio-spectrum-studio": {
        title: "Web Audio Oscilloscope & Spectrum Analyzer",
        description: "Analyze microphone or synthesized audio in real-time with hardware-accelerated 60 FPS oscilloscope and FFT spectrum.",
      },
      "bpm-tapper": {
        title: "Precision BPM Tapper & Smart Metronome",
        description: "Tap to calculate live BPM with standard deviation consistency scores, and keep rhythm with a scheduled Web Audio metronome.",
      },
      "exif-purger": {
        title: "EXIF Metadata Inspector & Privacy Purger",
        description: "Inspect GPS coordinates, camera models, and exposure metadata from photos and purge them before sharing.",
      },
      "sql-to-types": {
        title: "SQL to TypeScript, Zod & Prisma Converter",
        description: "Convert SQL CREATE TABLE statements into TypeScript interfaces, Zod schemas, Prisma models, and Go structs.",
      },
      "curl-to-code": {
        title: "cURL to Multi-Language Code Generator",
        description: "Convert cURL commands into JavaScript fetch, Axios, Python requests, Go, and PHP code snippets.",
      },
      "smart-dictionary": {
        title: "Smart Dictionary, Phonetics & Rhyme Studio",
        description: "Listen to audio pronunciations, inspect definitions, and discover rhymes and synonyms via Free Dictionary and Datamuse.",
      },
      "book-isbn-finder": {
        title: "Open Library & ISBN Search Engine",
        description: "Search 20M+ books, authors, and ISBNs for HD cover artwork, publishers, page counts, and publication years.",
      },
      "trivia-quiz-arena": {
        title: "Interactive Trivia Quiz & Knowledge Arena",
        description: "Test your knowledge across 24 categories in science, technology, history, and pop culture with live scoring streaks.",
      },
      "mock-data-generator": {
        title: "Smart Mock Data & Identity Generator",
        description: "Generate fake identities, addresses, phone numbers, company profiles, and downloadable JSON/CSV mock datasets.",
      },
      "ip-network-info": {
        title: "IP & Network Latency Analyzer",
        description: "Analyze your IP address, geolocation, ISP, and CDN latency with 4-source redundant verification.",
      },
      "dns-lookup-tool": {
        title: "DNS Records & Multi-Resolver DoH",
        description: "Query A, AAAA, MX, TXT, and CNAME DNS records via Cloudflare & Google DoH with DNSSEC verification.",
      },
      "currency-exchange-converter": {
        title: "Live Currency & Crypto Converter",
        description: "Convert between 150+ fiat currencies and cryptocurrencies using live European Central Bank (ECB) and crypto rates.",
      },
      "markdown-studio": {
        title: "Markdown Studio & Live Preview",
        description: "Edit, live preview, inspect writing metrics, and export Markdown documents as HTML or .md files.",
      },
      "cron-expression-studio": {
        title: "Cron Expression Generator & Explainer",
        description: "Visually generate Linux crontab schedules and inspect human-readable breakdowns.",
      },
      "favicon-extractor": {
        title: "Site Favicon & Logo Downloader",
        description: "Download HD favicons, Apple touch icons, and SVG logos from any website with one click.",
      },
      "spotify-playlist-analyzer": {
        title: "Spotify Playlist Analyzer",
        description: "Sonic DNA radar, bot detection, genre breakdown, BPM/Key wheel and HD cover studio like Chosic & Artist.tools.",
      },
      "spotify-profile-analyzer": {
        title: "Spotify Profile & Artist Analyzer",
        description: "Inspect curator and artist profiles, analyze follower reach, discography, top tracks, and extract HD avatars.",
      },
      "yt-playlist-length": {
        title: "YouTube Playlist Length & Video Analyzer",
        description: "Calculate playlist total duration, playback speeds, extract HD thumbnails and export CSV.",
      },
      "yt-thumbnail-downloader": {
        title: "YouTube Thumbnail Downloader",
        description: "Download or copy YouTube video cover images in HD, 1080p, and 4K resolutions instantly.",
      },
      "yt-timestamp-generator": {
        title: "YouTube Timestamp Generator",
        description: "Create timestamped YouTube links that launch videos at your exact chosen start time.",
      },
      "image-compressor": {
        title: "Image Compressor & Size Reducer",
        description: "Compress PNG, JPG, and WebP images locally on your device with up to 90% size reduction.",
      },
      "image-converter": {
        title: "Image Format Converter",
        description: "Convert PNG, JPG, WebP, and AVIF images instantly for free without quality loss.",
      },
      "color-picker": {
        title: "Color Palette & Extractor",
        description: "Extract harmonious dominant color palettes from images and copy HEX codes.",
      },
      "json-formatter": {
        title: "JSON Formatter & Validator",
        description: "Instantly validate, beautify, inspect tree structures, or minify your JSON data.",
      },
      "base64-encoder": {
        title: "Base64 Encoder & Decoder",
        description: "Encode or decode your text to/from Base64 format with full UTF-8 support.",
      },
      "regex-tester": {
        title: "Interactive Regex Tester",
        description: "Test your regular expressions live against sample texts and inspect matches.",
      },
      "css-gradient-generator": {
        title: "CSS & Tailwind Gradient Generator",
        description: "Create multi-layer modern color gradients and copy CSS code.",
      },
      "word-counter": {
        title: "Word and Text Counter",
        description: "Instantly calculate word, character, sentence counts and estimated reading time.",
      },
      "case-converter": {
        title: "Text Case Converter",
        description: "Instantly convert between camelCase, snake_case, kebab-case, Title Case and UPPERCASE.",
      },
      "unit-converter": {
        title: "Multi-Unit Converter",
        description: "Convert length, mass, temperature, speed, and digital storage units with high precision.",
      },
      "percentage-calculator": {
        title: "Percentage & Discount Calculator",
        description: "Calculate percentages, discounts, VAT and price adjustments instantly.",
      },
    },
  },
};
