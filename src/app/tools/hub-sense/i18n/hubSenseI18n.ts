/**
 * HubSense — Complete Bilingual (TR / EN) Localization Dictionary
 * Strict Zero-Emoji standard, 100% comprehensive coverage of all UI strings,
 * metrics, science descriptions, tiers, alerts, steppers, and modals.
 */

export interface HubSenseDictionary {
  title: string;
  subtitle: string;
  soundToggle: string;
  sensoryProfile: string;
  scores: string;
  selectDiscipline: string;
  difficultyLevel: string;
  dailyChallenge: string;
  dailyChallengeBadge: string;
  dailyChallengeDesc: string;
  dailyRefreshesIn: string;
  dailyReadyPrompt: string;
  startSoloGame: (rounds: number) => string;
  roundsTitle: string;
  roundFast: string;
  roundStandard: string;
  roundMarathon: string;
  roundCustom: string;
  customRoundsPlaceholder: string;
  delayTitle: string;
  delayInstant: string;
  delaySec: (sec: number) => string;
  nextRoundIn: (sec: number) => string;
  skipDelay: string;
  goBack: string;
  roundCounter: string;
  watermark: string;

  // Disciplines
  disciplines: {
    color: { label: string; desc: string; scienceTitle: string; scienceDesc: string; metric: string };
    sound: { label: string; desc: string; scienceTitle: string; scienceDesc: string; metric: string };
    time: { label: string; desc: string; scienceTitle: string; scienceDesc: string; metric: string };
    shape: { label: string; desc: string; scienceTitle: string; scienceDesc: string; metric: string };
    sequence: { label: string; desc: string; scienceTitle: string; scienceDesc: string; metric: string };
  };

  // Difficulties
  difficulties: {
    easy: { label: string; desc: string };
    hard: { label: string; desc: string };
    brutal: { label: string; desc: string };
  };

  // Color Game
  color: {
    revealSubtitle: string;
    revealPrompt: string;
    hue: string;
    saturation: string;
    brightness: string;
    hueDec: string;
    hueInc: string;
    satInc: string;
    satDec: string;
    brightInc: string;
    brightDec: string;
    instruction: string;
    confirm: string;
    colorBlindModes: {
      none: string;
      protanopia: string;
      deuteranopia: string;
      tritanopia: string;
    };
  };

  // Sound Game
  sound: {
    revealSubtitle: string;
    revealPrompt: string;
    erbScale: string;
    playTone: string;
    stopTone: string;
    confirm: string;
    freqRange: string;
  };

  // Time Game
  time: {
    revealSubtitle: string;
    revealPrompt: string;
    modelName: string;
    holdButton: string;
    holdInstruction: string;
    releasePrompt: string;
    calculating: string;
    weberLawDesc: string;
  };

  // Shape Game
  shape: {
    revealSubtitle: string;
    revealPrompt: string;
    types: {
      circle: string;
      triangle: string;
      square: string;
      pentagon: string;
      hexagon: string;
      star: string;
    };
    scaleLabel: string;
    rotationLabel: string;
    dragPosition: string;
    confirm: string;
  };

  // Sequence Game
  sequence: {
    revealSubtitle: string;
    stepsEntered: string;
    reset: string;
    confirm: string;
    nodes: {
      c4: string;
      e4: string;
      g4: string;
      c5: string;
    };
  };

  // Round Results
  roundResult: {
    title: string;
    outOf: string;
    cumulative: string;
    nextRound: string;
    viewFinals: string;
    targetColor: string;
    yourGuess: string;
    deltaE: string;
    accuracy: string;
    pitchDev: string;
    targetFreq: string;
    guessFreq: string;
    targetDuration: string;
    guessDuration: string;
    errorMargin: string;
    timing: string;
    timingPerfect: string;
    timingEarly: string;
    timingLate: string;
    iouOverlap: string;
    rotationDev: string;
    scaleDev: string;
    positionDev: string;
    matchedSteps: string;
    chainAccuracy: string;
    memoryState: string;
    chainPerfect: string;
    chainPartial: string;
  };

  // Total Result
  totalResult: {
    title: string;
    newPersonalBest: string;
    outOfFifty: string;
    leaderboardLabel: string;
    nicknamePlaceholder: string;
    submitting: string;
    submitScore: string;
    shareHeader: string;
    scoreLink: string;
    challengeFriend: string;
    downloadPng: string;
    twitterShare: string;
    whatsAppShare: string;
    nativeShare: string;
    menuReturn: string;
  };

  // Leaderboard Modal
  leaderboard: {
    title: string;
    globalTab: string;
    personalTab: string;
    allTime: string;
    today: string;
    thisWeek: string;
    emptyTitle: string;
    emptyDesc: string;
    rankHeader: string;
    playerHeader: string;
    scoreHeader: string;
    dateHeader: string;
    sourceServer: string;
    sourceLocal: string;
    personalEmpty: string;
  };

  // Sensory Insights Modal
  insights: {
    title: string;
    subtitle: string;
    ageHeroTitle: string;
    ageSuffix: string;
    overallAverage: string;
    pointsOutOfFifty: string;
    ageTiers: {
      peak: string;
      average: string;
      novice: string;
    };
    breakdownTitle: string;
    notPlayed: string;
    bestScore: string;
    maxScorePrefix: string;
  };

  // Shared Score Modal
  sharedModal: {
    badge: string;
    challengeTitle: (user: string) => string;
    challengeSubtitle: (game: string, diff: string) => string;
    acceptChallenge: string;
    close: string;
  };

  // Score Tiers
  tiers: {
    godlike: { label: string; message: string };
    master: { label: string; message: string };
    expert: { label: string; message: string };
    proficient: { label: string; message: string };
    novice: { label: string; message: string };
    unranked: { label: string; message: string };
  };

  // Toast / System messages
  toasts: {
    scoreCopied: string;
    challengeCopied: string;
    pngGenerating: string;
    pngDownloaded: string;
    scoreSavedRank: (rank: number) => string;
    scoreSaved: string;
    invalidUsername: string;
    rateLimit: string;
    invalidScores: string;
    alreadySubmitted: string;
    submitError: string;
    challengeLoaded: string;
  };
}

export const hubSenseTranslations: Record<"tr" | "en", HubSenseDictionary> = {
  tr: {
    title: "HubSense",
    subtitle: "Bilişsel Duyu Hafızası & Algı Test Arenası",
    soundToggle: "Ses Efektlerini Aç/Kapat",
    sensoryProfile: "Duyu Profili",
    scores: "Skorlar",
    selectDiscipline: "Duyu Disiplini Seç",
    difficultyLevel: "Zorluk Derecesi",
    dailyChallenge: "Günlük Meydan Okuma",
    dailyChallengeBadge: "Günlük Küresel Mücadele",
    dailyChallengeDesc: "Dünya genelinde herkes bugün aynı 5 uyaran dizisini çözüyor. Tek bir resmi deneme hakkın var!",
    dailyRefreshesIn: "Yenileniyor",
    dailyReadyPrompt: "Hazırım, Başla",
    startSoloGame: (rounds) => `Oyuna Başla (${rounds} Tur)`,
    roundsTitle: "Tur Sayısı",
    roundFast: "Hızlı 3 tur",
    roundStandard: "Standart 5 tur",
    roundMarathon: "Maraton 10 tur",
    roundCustom: "Özel Tur Sayısı",
    customRoundsPlaceholder: "Tur sayısı yazın (1-20)",
    delayTitle: "Turlar Arası Bekleme Süresi",
    delayInstant: "0sn (Anında)",
    delaySec: (sec: number) => `${sec}sn`,
    nextRoundIn: (sec: number) => `Sonraki Tur ${sec}sn İçinde Başlıyor...`,
    skipDelay: "Hemen Başlat",
    goBack: "Geri Dön",
    roundCounter: "Tur",
    watermark: "HubSense",

    disciplines: {
      color: {
        label: "Renk",
        desc: "Ton, doygunluk ve parlaklığı 3 eksende yeniden oluştur.",
        scienceTitle: "CIELAB Delta-E 2000 Standardı",
        scienceDesc: "İnsan gözünün koni hücreleri (LMS) ve görsel korteksteki renk algısını en kusursuz modelleyen uluslararası CIE renk farkı formülü.",
        metric: "Delta-E Sapma",
      },
      sound: {
        label: "Ses",
        desc: "Duyduğun perdeyi bellekte tut, doğru frekansı sentezle.",
        scienceTitle: "ERB Psikokustik Filtreleme",
        scienceDesc: "Koklear baziler zarın frekans bant genişliğini (Equivalent Rectangular Bandwidth) modelleyerek perde hassasiyetini ölçer.",
        metric: "Sent & ERB Mesafe",
      },
      time: {
        label: "Zaman",
        desc: "Hedef süreyi hisset, butonu tam zamanında bırak.",
        scienceTitle: "Weber-Fechner İç Saat Yasası",
        scienceDesc: "Beynin suplementer motor alanı ve bazal gangliyonlarındaki sirkadiyen & aralık zamanlama tutarlılığını test eder.",
        metric: "Milisaniye Hata Oranı",
      },
      shape: {
        label: "Şekil",
        desc: "Geometriyi zihninde tut; ölçek, konum ve açıyı eşle.",
        scienceTitle: "IoU & Afinite Dönüşüm Geometrisi",
        scienceDesc: "Görsel-uzamsal çalışma belleğindeki nesne konturu, döndürme ve ölçek parametrelerinin Intersection-over-Union çakışması.",
        metric: "IoU & Derece Hatası",
      },
      sequence: {
        label: "Dizi",
        desc: "Harmonik ses-ışık zincirini eksiksiz tekrarla.",
        scienceTitle: "İki Duyulu Fonolojik Döngü",
        scienceDesc: "Prefrontal korteksin görsel ve işitsel çalışma belleğini aynı anda koordine etme kapasitesini (Dual Working Memory) ölçer.",
        metric: "Sıralı Doğruluk",
      },
    },

    difficulties: {
      easy: { label: "Kolay", desc: "Daha uzun görme süresi, toleranslı kontrol" },
      hard: { label: "Zor", desc: "Kısa odaklanma süresi, hassas eşikler" },
      brutal: { label: "Vahşi", desc: "Anlık refleks, sıfır tolerans, maksimum hassasiyet" },
    },

    color: {
      revealSubtitle: "Hatırlamak için kalan süre",
      revealPrompt: "Bu tonu aklında tut...",
      hue: "Ton",
      saturation: "Doygunluk",
      brightness: "Parlaklık",
      hueDec: "Ton Azalt",
      hueInc: "Ton Artır",
      satInc: "Doygunluk Artır",
      satDec: "Doygunluk Azalt",
      brightInc: "Parlaklık Artır",
      brightDec: "Parlaklık Azalt",
      instruction: "Sol çubuklardan Ton, Doygunluk ve Parlaklığı ayarlayın",
      confirm: "Bu Rengi Seç ve Onayla",
      colorBlindModes: {
        none: "Normal",
        protanopia: "Protanopi",
        deuteranopia: "Döteranopi",
        tritanopia: "Tritanopi",
      },
    },

    sound: {
      revealSubtitle: "Perdeyi aklında tut",
      revealPrompt: "Dikkatle dinle...",
      erbScale: "ERB Psikokustik Ölçeği",
      playTone: "Sesi Dinle",
      stopTone: "Durdur",
      confirm: "Frekansı Onayla",
      freqRange: "80Hz — 2000Hz",
    },

    time: {
      revealSubtitle: "Süreyi hisset ve aklında tut",
      revealPrompt: "Işık sönene kadar süreyi hisset...",
      modelName: "Weber-Fechner Modeli",
      holdButton: "BASILI TUT",
      holdInstruction: "ve doğru anda bırak",
      releasePrompt: "SÜRE DOLUNCA BIRAK",
      calculating: "Puan Hesaplanıyor...",
      weberLawDesc: "Hedef süreyi zihninde canlandır, butona basılı tut ve süre tamamlandığında parmağını kaldır.",
    },

    shape: {
      revealSubtitle: "Geometriyi aklında tut",
      revealPrompt: "Türü, açıyı ve boyutu incele...",
      types: {
        circle: "Daire",
        triangle: "Üçgen",
        square: "Kare",
        pentagon: "Beşgen",
        hexagon: "Altıgen",
        star: "Yıldız",
      },
      scaleLabel: "Boyut (Ölçek)",
      rotationLabel: "Döndürme Açısı",
      dragPosition: "Sürükle: Konum",
      confirm: "Şekli Onayla",
    },

    sequence: {
      revealSubtitle: "Sırayı ve sesleri dinle",
      stepsEntered: "Adım Girildi",
      reset: "Sıfırla",
      confirm: "Diziyi Onayla",
      nodes: {
        c4: "Do (C4)",
        e4: "Mi (E4)",
        g4: "Sol (G4)",
        c5: "Do (C5)",
      },
    },

    roundResult: {
      title: "Sonucu",
      outOf: "/ 10.0 Puan",
      cumulative: "Toplam Kümülatif",
      nextRound: "Sonraki Tura Geç",
      viewFinals: "Final Sonuçları Gör",
      targetColor: "Hedef Renk",
      yourGuess: "Tahminin",
      deltaE: "CIELAB Delta-E 2000 Farkı",
      accuracy: "Algı Doğruluk Oranı",
      pitchDev: "Perde Sapması",
      targetFreq: "Hedef Frekans",
      guessFreq: "Tahmin Frekans",
      targetDuration: "Hedef Süre",
      guessDuration: "Tahmin Süre",
      errorMargin: "Hata Payı",
      timing: "Zamanlama",
      timingPerfect: "Kusursuz!",
      timingEarly: "Erken Bıraktın",
      timingLate: "Geç Bıraktın",
      iouOverlap: "IoU Çakışma",
      rotationDev: "Döndürme Sapması",
      scaleDev: "Ölçek Sapması",
      positionDev: "Pozisyon Sapması",
      matchedSteps: "Doğru Sıralı Adım",
      chainAccuracy: "Zincir Doğruluğu",
      memoryState: "Bellek Durumu",
      chainPerfect: "Kusursuz Zincir",
      chainPartial: "Kısmi Eşleşme",
    },

    totalResult: {
      title: "Oyun Tamamlandı",
      newPersonalBest: "Yeni Kişisel Rekor!",
      outOfFifty: "/ 50.0",
      leaderboardLabel: "Liderlik Tablosuna İsim Yaz",
      nicknamePlaceholder: "RUMUZ (3-20 KARAKTER)",
      submitting: "Kaydediliyor...",
      submitScore: "Skoru Gönder",
      shareHeader: "Skorunu Paylaş & Meydan Oku",
      scoreLink: "Skor Linki",
      challengeFriend: "Meydan Oku",
      downloadPng: "PNG İndir",
      twitterShare: "X / Tweet",
      whatsAppShare: "WhatsApp",
      nativeShare: "Paylaş",
      menuReturn: "Menüye Dön",
    },

    leaderboard: {
      title: "Skor Tablosu",
      globalTab: "Global",
      personalTab: "Kişisel",
      allTime: "Tüm Zamanlar",
      today: "Bugün",
      thisWeek: "Bu Hafta",
      emptyTitle: "Henüz kayıt yok.",
      emptyDesc: "İlk skoru sen gönder ve sıralamada yerini al!",
      rankHeader: "Sıra",
      playerHeader: "Oyuncu",
      scoreHeader: "Skor",
      dateHeader: "Tarih",
      sourceServer: "Küresel Sunucu",
      sourceLocal: "Çevrimdışı Bellek",
      personalEmpty: "Bu modda henüz tamamlanmış oyunun yok.",
    },

    insights: {
      title: "Duyu Profili & Bilim",
      subtitle: "Bilişsel algı analizi ve metrikler",
      ageHeroTitle: "Bilişsel Duyu Yaşı",
      ageSuffix: "yaş",
      overallAverage: "Genel Ortalama",
      pointsOutOfFifty: "/ 50 Puan",
      ageTiers: {
        peak: "Duyuların en üst %1 insan seviyesinde reaktif ve keskin.",
        average: "Duyuların ortalama bir yetişkin algı düzeyinde dengeli.",
        novice: "Birkaç oyun oynayarak duyu profilini oluşturmaya başla.",
      },
      breakdownTitle: "Duyu Alanları & En İyi Skorlar",
      notPlayed: "Oynanmadı",
      bestScore: "En İyi Skor",
      maxScorePrefix: "Maks",
    },

    sharedModal: {
      badge: "Meydan Okuma Geldi!",
      challengeTitle: (u) => `${u} sana meydan okuyor`,
      challengeSubtitle: (g, d) => `${g} disiplini · ${d.toUpperCase()} zorluk derecesi`,
      acceptChallenge: "Meydan Okumayı Kabul Et",
      close: "Kapat",
    },

    tiers: {
      godlike: { label: "Kusursuz Algı", message: "İnsan algısının en üst %0.1 sınırındasın." },
      master: { label: "Usta Duyu", message: "Olağanüstü yüksek duyusal kalibrasyon ve keskinlik." },
      expert: { label: "Uzman Algı", message: "Ortalamanın belirgin biçimde üzerinde duyusal bellek." },
      proficient: { label: "Yetkin Seviye", message: "Dengeli ve tutarlı duyusal performans." },
      novice: { label: "Gelişmekte Olan", message: "Düzenli antrenman ile algını çok daha keskinleştirebilirsin." },
      unranked: { label: "Derecesiz", message: "Daha fazla tur tamamlayarak dereceni belirle." },
    },

    toasts: {
      scoreCopied: "Paylaşım linki panoya kopyalandı!",
      challengeCopied: "Aynı oyun meydan okuma linki kopyalandı!",
      pngGenerating: "Skor kartı görseli oluşturuluyor...",
      pngDownloaded: "Skor kartı PNG olarak indirildi!",
      scoreSavedRank: (r) => `Skor kaydedildi! Küresel Sıralaman: #${r}`,
      scoreSaved: "Skor başarıyla kaydedildi!",
      invalidUsername: "Geçersiz kullanıcı adı",
      rateLimit: "Çok hızlı gönderim yaptınız. Lütfen biraz bekleyin.",
      invalidScores: "Geçersiz tur skorları.",
      alreadySubmitted: "Bu oyun skorunu zaten kaydettin!",
      submitError: "Skor gönderilirken bir hata oluştu.",
      challengeLoaded: "Meydan okuma oturumu yüklendi!",
    },
  },

  en: {
    title: "HubSense",
    subtitle: "Cognitive Sensory Memory & Perception Testing Arena",
    soundToggle: "Toggle Sound Effects",
    sensoryProfile: "Sensory Profile",
    scores: "Leaderboard",
    selectDiscipline: "Select Sensory Discipline",
    difficultyLevel: "Difficulty Level",
    dailyChallenge: "Daily Challenge",
    dailyChallengeBadge: "Daily Global Challenge",
    dailyChallengeDesc: "Everyone worldwide solves the exact same 5 stimuli today. You get one official attempt!",
    dailyRefreshesIn: "Refreshes in",
    dailyReadyPrompt: "I'm Ready, Start",
    startSoloGame: (rounds) => `Start Game (${rounds} Rounds)`,
    roundsTitle: "Round Count",
    roundFast: "Fast 3 rounds",
    roundStandard: "Standard 5 rounds",
    roundMarathon: "Marathon 10 rounds",
    roundCustom: "Custom Rounds",
    customRoundsPlaceholder: "Enter rounds (1-20)",
    delayTitle: "Inter-Round Prep Delay",
    delayInstant: "0s (Instant)",
    delaySec: (sec: number) => `${sec}s`,
    nextRoundIn: (sec: number) => `Next Round Starts in ${sec}s...`,
    skipDelay: "Start Now",
    goBack: "Go Back",
    roundCounter: "Round",
    watermark: "HubSense",

    disciplines: {
      color: {
        label: "Color",
        desc: "Reconstruct hue, saturation, and brightness from visual memory.",
        scienceTitle: "CIELAB Delta-E 2000 Standard",
        scienceDesc: "International CIE color difference formula modeling human cone photoreceptors (LMS) and visual cortex perception.",
        metric: "Delta-E Deviation",
      },
      sound: {
        label: "Sound",
        desc: "Retain auditory pitch and synthesize exact frequency.",
        scienceTitle: "ERB Psychoacoustic Filtering",
        scienceDesc: "Measures pitch discrimination by modeling the cochlear basilar membrane Equivalent Rectangular Bandwidth.",
        metric: "Cents & ERB Distance",
      },
      time: {
        label: "Time",
        desc: "Estimate target duration and release pad on timing.",
        scienceTitle: "Weber-Fechner Internal Clock Law",
        scienceDesc: "Tests interval timing consistency in the supplementary motor area and basal ganglia circuitry.",
        metric: "Millisecond Error Rate",
      },
      shape: {
        label: "Shape",
        desc: "Replicate shape geometry, scale, position, and rotation.",
        scienceTitle: "IoU & Affine Transformation Geometry",
        scienceDesc: "Intersection-over-Union alignment of object contour, rotation angle, and scale in visuospatial working memory.",
        metric: "IoU & Angle Error",
      },
      sequence: {
        label: "Sequence",
        desc: "Memorize and repeat progressive audio-visual chain.",
        scienceTitle: "Dual-Sensory Phonological Loop",
        scienceDesc: "Evaluates prefrontal cortex bandwidth in synchronizing auditory and visual working memory buffers simultaneously.",
        metric: "Sequential Accuracy",
      },
    },

    difficulties: {
      easy: { label: "Easy", desc: "Longer stimulus view time, tolerant calibration" },
      hard: { label: "Hard", desc: "Short focus duration, precision thresholds" },
      brutal: { label: "Brutal", desc: "Instant reflex, zero tolerance, maximum precision" },
    },

    color: {
      revealSubtitle: "Time left to memorize",
      revealPrompt: "Keep this tone in mind...",
      hue: "Hue",
      saturation: "Saturation",
      brightness: "Brightness",
      hueDec: "Decrease Hue",
      hueInc: "Increase Hue",
      satInc: "Increase Saturation",
      satDec: "Decrease Saturation",
      brightInc: "Increase Brightness",
      brightDec: "Decrease Brightness",
      instruction: "Adjust Hue, Saturation and Brightness using the left sliders",
      confirm: "Confirm Selected Color",
      colorBlindModes: {
        none: "Normal",
        protanopia: "Protanopia",
        deuteranopia: "Deuteranopia",
        tritanopia: "Tritanopia",
      },
    },

    sound: {
      revealSubtitle: "Remember this pitch",
      revealPrompt: "Listen carefully...",
      erbScale: "ERB Psychoacoustic Scale",
      playTone: "Listen to Tone",
      stopTone: "Stop",
      confirm: "Confirm Frequency",
      freqRange: "80Hz — 2000Hz",
    },

    time: {
      revealSubtitle: "Feel and memorize the duration",
      revealPrompt: "Feel the duration until the light fades...",
      modelName: "Weber-Fechner Model",
      holdButton: "HOLD DOWN",
      holdInstruction: "and release at the right moment",
      releasePrompt: "RELEASE ON TIME",
      calculating: "Calculating Score...",
      weberLawDesc: "Visualize target duration, hold the button down and lift your finger when the duration completes.",
    },

    shape: {
      revealSubtitle: "Remember the geometry",
      revealPrompt: "Examine shape type, angle, and size...",
      types: {
        circle: "Circle",
        triangle: "Triangle",
        square: "Square",
        pentagon: "Pentagon",
        hexagon: "Hexagon",
        star: "Star",
      },
      scaleLabel: "Size (Scale)",
      rotationLabel: "Rotation Angle",
      dragPosition: "Drag: Position",
      confirm: "Confirm Shape",
    },

    sequence: {
      revealSubtitle: "Listen to sequence & sounds",
      stepsEntered: "Steps Entered",
      reset: "Reset",
      confirm: "Confirm Sequence",
      nodes: {
        c4: "C4 (Do)",
        e4: "E4 (Mi)",
        g4: "G4 (Sol)",
        c5: "C5 (Do)",
      },
    },

    roundResult: {
      title: "Result",
      outOf: "/ 10.0 Points",
      cumulative: "Cumulative Total",
      nextRound: "Next Round",
      viewFinals: "View Final Results",
      targetColor: "Target Color",
      yourGuess: "Your Guess",
      deltaE: "CIELAB Delta-E 2000 Difference",
      accuracy: "Perception Accuracy",
      pitchDev: "Pitch Deviation",
      targetFreq: "Target Frequency",
      guessFreq: "Guessed Frequency",
      targetDuration: "Target Duration",
      guessDuration: "Guessed Duration",
      errorMargin: "Error Margin",
      timing: "Timing",
      timingPerfect: "Flawless!",
      timingEarly: "Released Early",
      timingLate: "Released Late",
      iouOverlap: "IoU Overlap",
      rotationDev: "Rotation Deviation",
      scaleDev: "Scale Deviation",
      positionDev: "Position Deviation",
      matchedSteps: "Matched Steps",
      chainAccuracy: "Chain Accuracy",
      memoryState: "Memory State",
      chainPerfect: "Flawless Chain",
      chainPartial: "Partial Match",
    },

    totalResult: {
      title: "Game Completed",
      newPersonalBest: "New Personal Best!",
      outOfFifty: "/ 50.0",
      leaderboardLabel: "Enter Name for Leaderboard",
      nicknamePlaceholder: "NICKNAME (3-20 CHARS)",
      submitting: "Submitting...",
      submitScore: "Submit Score",
      shareHeader: "Share Score & Challenge",
      scoreLink: "Score Link",
      challengeFriend: "Challenge",
      downloadPng: "Download PNG",
      twitterShare: "X / Tweet",
      whatsAppShare: "WhatsApp",
      nativeShare: "Share",
      menuReturn: "Return to Menu",
    },

    leaderboard: {
      title: "Leaderboard",
      globalTab: "Global",
      personalTab: "Personal",
      allTime: "All Time",
      today: "Today",
      thisWeek: "This Week",
      emptyTitle: "No scores recorded yet.",
      emptyDesc: "Be the first to submit a score and claim the top rank!",
      rankHeader: "Rank",
      playerHeader: "Player",
      scoreHeader: "Score",
      dateHeader: "Date",
      sourceServer: "Global Server",
      sourceLocal: "Offline Storage",
      personalEmpty: "No completed games in this mode yet.",
    },

    insights: {
      title: "Sensory Profile & Science",
      subtitle: "Cognitive perception analysis & metrics",
      ageHeroTitle: "Cognitive Sensory Age",
      ageSuffix: "y/o",
      overallAverage: "Overall Average",
      pointsOutOfFifty: "/ 50 Points",
      ageTiers: {
        peak: "Your sensory reaction is in the top 1% human peak tier.",
        average: "Your sensory balance matches average adult acuity.",
        novice: "Play more rounds to build your complete sensory profile.",
      },
      breakdownTitle: "Sensory Domains & Best Scores",
      notPlayed: "Not Played",
      bestScore: "Best Score",
      maxScorePrefix: "Max",
    },

    sharedModal: {
      badge: "Challenge Received!",
      challengeTitle: (u) => `${u} is challenging you`,
      challengeSubtitle: (g, d) => `${g} discipline · ${d.toUpperCase()} difficulty`,
      acceptChallenge: "Accept Challenge",
      close: "Close",
    },

    tiers: {
      godlike: { label: "Godlike Perception", message: "You stand at the upper 0.1% peak of human sensory acuity." },
      master: { label: "Master Sensory", message: "Exceptionally calibrated sensory acuity and memory retention." },
      expert: { label: "Expert Perception", message: "Significantly above-average sensory working memory capacity." },
      proficient: { label: "Proficient Acuity", message: "Balanced and consistent sensory perception performance." },
      novice: { label: "Developing Sense", message: "With regular mental calibration, you can sharpen your senses." },
      unranked: { label: "Unranked", message: "Complete more rounds to calibrate your rating." },
    },

    toasts: {
      scoreCopied: "Share link copied to clipboard!",
      challengeCopied: "Challenge link with matching seed copied!",
      pngGenerating: "Generating high-res score card image...",
      pngDownloaded: "Score card image downloaded as PNG!",
      scoreSavedRank: (r) => `Score saved! Global Leaderboard Rank: #${r}`,
      scoreSaved: "Score successfully submitted!",
      invalidUsername: "Invalid nickname",
      rateLimit: "Submitting too fast. Please wait a moment.",
      invalidScores: "Invalid round scores.",
      alreadySubmitted: "You have already recorded this game session!",
      submitError: "An error occurred while submitting your score.",
      challengeLoaded: "Challenge game session loaded!",
    },
  },
};
