/**
 * aegisFlasher Universal Firmware Catalog & Manifest Database
 * Curated, Verified Open-Source Microcontroller Firmwares
 */

import { FirmwareProfile } from "./types";

export const FIRMWARE_CATALOG: FirmwareProfile[] = [
  // 1. WLED
  {
    id: "wled",
    name: "WLED",
    tagline: "Adreslenebilir LED (WS2812B, SK6812, APA102) & Işıklandırma Sunucusu",
    taglineEn: "Addressable LED (WS2812B, SK6812, APA102) & Light Control Server",
    description:
      "ESP32 ve ESP8266 için 100+ dinamik ışık efekti, Home Assistant, E1.31, DMX, Alexa ve ses senkronizasyonlu zengin aydınlatma yazılımı.",
    descriptionEn:
      "Feature-rich illumination software for ESP32 and ESP8266 featuring 100+ dynamic lighting effects, Home Assistant, E1.31, DMX, Alexa, and sound reactive sync.",
    longDescription:
      "WLED, RGB / RGBW adreslenebilir LED şeritlerini (Neopixel, WS2812B, WS2811, WS2815, SK6812) Wi-Fi üzerinden kontrol eden dünyanın en popüler açık kaynaklı yazılımıdır. Ses duyarlılığı (Sound Reactive), Philips Hue emülasyonu, MQTT, JSON API ve ultra akıcı 60 FPS efekt motoru içerir.",
    longDescriptionEn:
      "WLED is the world's most popular open-source software to control RGB/RGBW addressable LED strips over Wi-Fi. Features Sound Reactive audio, Philips Hue emulation, MQTT, JSON API, and ultra-smooth 60 FPS effects engine.",
    category: "smart-home",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266"],
    stars: "14.2k",
    badge: "Popüler",
    badgeEn: "Popular",
    author: "Aircoookie & WLED Community",
    websiteUrl: "https://kno.wled.ge/",
    githubUrl: "https://github.com/Aircoookie/WLED",
    documentationUrl: "https://kno.wled.ge/basics/getting-started/",
    license: "MIT",
    latestVersion: "0.14.4",
    availableVersions: ["0.14.4", "0.14.0", "0.13.3"],
    recommendedBaud: 921600,
    eraseBeforeFlash: false,
    builds: {
      "0.14.4": [
        {
          chip: "ESP32",
          version: "0.14.4",
          description: "ESP32 Standart 4MB Flash (Tüm WROOM/WROVER modelleri)",
          descriptionEn: "ESP32 Standard 4MB Flash (All WROOM/WROVER modules)",
          minFlashSize: "4MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP32.bin", offset: 0x0, name: "WLED Unified Image (ESP32)" },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "0.14.4",
          description: "ESP32-S3 8MB/16MB Flash (Octal/Quad SPI)",
          descriptionEn: "ESP32-S3 8MB/16MB Flash (Octal/Quad SPI)",
          minFlashSize: "8MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP32-S3.bin", offset: 0x0, name: "WLED (ESP32-S3)" },
          ],
        },
        {
          chip: "ESP32-C3",
          version: "0.14.4",
          description: "ESP32-C3 RISC-V Mini Kartlar",
          descriptionEn: "ESP32-C3 RISC-V Mini Boards",
          minFlashSize: "4MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP32-C3.bin", offset: 0x0, name: "WLED (ESP32-C3)" },
          ],
        },
        {
          chip: "ESP8266",
          version: "0.14.4",
          description: "ESP8266 (NodeMCU, Wemos D1 Mini 4MB)",
          descriptionEn: "ESP8266 (NodeMCU, Wemos D1 Mini 4MB)",
          minFlashSize: "4MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP8266.bin", offset: 0x0, name: "WLED (ESP8266 4MB)" },
          ],
        },
      ],
      "0.14.0": [
        {
          chip: "ESP32",
          version: "0.14.0",
          description: "ESP32 Standart 4MB Flash",
          descriptionEn: "ESP32 Standard 4MB Flash",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.0/dist/WLED_0.14.0_ESP32.bin", offset: 0x0, name: "WLED ESP32 v0.14.0" },
          ],
        },
      ],
      "0.13.3": [
        {
          chip: "ESP32",
          version: "0.13.3",
          description: "ESP32 Legacy Stable",
          descriptionEn: "ESP32 Legacy Stable",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.13.3/dist/WLED_0.13.3_ESP32.bin", offset: 0x0, name: "WLED ESP32 v0.13.3" },
          ],
        },
      ],
    },
  },

  // 2. Tasmota
  {
    id: "tasmota",
    name: "Tasmota",
    tagline: "Gelişmiş Akıllı Ev & Sensör İşletim Sistemi",
    taglineEn: "Advanced Smart Home & Sensor Firmware OS",
    description:
      "Sonoff, Tuya ve ESP tabanlı röleleri, prizleri ve sensörleri bulut bağımlılığı olmadan yerel Home Assistant / MQTT ile yönetin.",
    descriptionEn:
      "Control Sonoff, Tuya, and ESP relays, plugs, and sensors locally with Home Assistant / MQTT without cloud dependency.",
    longDescription:
      "Tasmota, ESP8266 ve ESP32 cihazlarını sıfır bulut bağımlılığı ile yerel ağ kontrolüne alan standart yazılımdır. WebUI, OTA güncellemeleri, zamanlayıcılar, kural motoru (Rules Engine) ve 500+ sensör sürücüsü ile tam yerel otomasyon sağlar.",
    longDescriptionEn:
      "Tasmota is the open-source standard for local control of ESP8266 and ESP32 devices with zero cloud dependency. Includes WebUI, OTA updates, timers, Rules Engine, and 500+ sensor drivers.",
    category: "smart-home",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266"],
    stars: "21.5k",
    badge: "Standart",
    badgeEn: "Standard",
    author: "Theo Arends & Tasmota Team",
    websiteUrl: "https://tasmota.github.io/docs/",
    githubUrl: "https://github.com/arendst/Tasmota",
    documentationUrl: "https://tasmota.github.io/docs/Getting-Started/",
    license: "GPL-3.0",
    latestVersion: "14.3.0",
    availableVersions: ["14.3.0", "14.0.0", "13.4.0"],
    recommendedBaud: 921600,
    eraseBeforeFlash: true,
    builds: {
      "14.3.0": [
        {
          chip: "ESP32",
          version: "14.3.0",
          description: "Tasmota32 Standart (İngilizce)",
          descriptionEn: "Tasmota32 Standard (English)",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota32.factory.bin", offset: 0x0, name: "Tasmota32 Factory Binary" },
          ],
        },
        {
          chip: "ESP32",
          version: "14.3.0-TR",
          description: "Tasmota32 Türkçe Dil Paketi (Turkish Edition)",
          descriptionEn: "Tasmota32 Turkish Language Edition",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota32-TR.factory.bin", offset: 0x0, name: "Tasmota32 Türkçe Factory" },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "14.3.0",
          description: "Tasmota32-S3 Bluetooth & Display",
          descriptionEn: "Tasmota32-S3 Bluetooth & Display",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota32s3.factory.bin", offset: 0x0, name: "Tasmota32-S3 Factory" },
          ],
        },
        {
          chip: "ESP8266",
          version: "14.3.0",
          description: "Tasmota Standart (ESP8266)",
          descriptionEn: "Tasmota Standard (ESP8266)",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota.bin", offset: 0x0, name: "Tasmota ESP8266" },
          ],
        },
      ],
      "14.0.0": [
        {
          chip: "ESP32",
          version: "14.0.0",
          description: "Tasmota32 v14.0.0",
          descriptionEn: "Tasmota32 v14.0.0",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release-14.0.0/tasmota32.factory.bin", offset: 0x0, name: "Tasmota32 Factory" },
          ],
        },
      ],
    },
  },

  // 3. Meshtastic
  {
    id: "meshtastic",
    name: "Meshtastic",
    tagline: "Merkeziyetsiz, Şebekesiz (Off-Grid) LoRa Mesh Telsiz Haberleşmesi",
    taglineEn: "Decentralized Off-Grid LoRa Mesh Radio Communication",
    description:
      "İnternet ve hücresel ağ olmadan kilometrelerce menzilde şifreli mesajlaşma, GPS konum paylaşımı ve acil durum mesh ağı.",
    descriptionEn:
      "Encrypted messaging, GPS location sharing, and emergency mesh network over long range without internet or cellular connectivity.",
    longDescription:
      "Meshtastic, hücresel şebekelerin veya internetin bulunmadığı dağcılık, afet, off-grid ve taktiksel senaryolarda LoRa radyo frekansları üzerinden uçtan uca şifreli (AES-256) mesajlaşma ve telemetri ağı kurar.",
    longDescriptionEn:
      "Meshtastic builds end-to-end encrypted (AES-256) messaging and telemetry mesh networks over LoRa radio frequencies for off-grid, emergency, outdoor, and tactical scenarios.",
    category: "security-mesh",
    supportedChips: ["ESP32", "ESP32-S3"],
    stars: "11.8k",
    badge: "LoRa Mesh",
    badgeEn: "LoRa Mesh",
    author: "Meshtastic Project",
    websiteUrl: "https://meshtastic.org/",
    githubUrl: "https://github.com/meshtastic/firmware",
    documentationUrl: "https://meshtastic.org/docs/getting-started/",
    license: "GPL-3.0",
    latestVersion: "2.5.4",
    availableVersions: ["2.5.4", "2.3.13"],
    recommendedBaud: 921600,
    eraseBeforeFlash: true,
    builds: {
      "2.5.4": [
        {
          chip: "ESP32-S3",
          version: "2.5.4",
          description: "Heltec Wireless Tracker / Heltec LoRa32 V3 (ESP32-S3)",
          descriptionEn: "Heltec Wireless Tracker / Heltec LoRa32 V3 (ESP32-S3)",
          parts: [
            { path: "https://github.com/meshtastic/firmware/releases/download/v2.5.4.150e7b8/firmware-heltec-v3-2.5.4.150e7b8.bin", offset: 0x0, name: "Heltec V3 Firmware" },
          ],
        },
        {
          chip: "ESP32",
          version: "2.5.4",
          description: "LilyGO T-Beam & T-LoRa (ESP32 Dual Core)",
          descriptionEn: "LilyGO T-Beam & T-LoRa (ESP32 Dual Core)",
          parts: [
            { path: "https://github.com/meshtastic/firmware/releases/download/v2.5.4.150e7b8/firmware-tbeam-2.5.4.150e7b8.bin", offset: 0x0, name: "T-Beam Firmware" },
          ],
        },
      ],
    },
  },

  // 4. ESP32 WiFi Marauder
  {
    id: "esp32-marauder",
    name: "ESP32 Marauder",
    tagline: "Kablosuz Ağ Güvenlik Testi & RF Analiz Paketi (Wi-Fi / BLE)",
    taglineEn: "Wireless Network Security Audit & RF Analysis Suite (Wi-Fi / BLE)",
    description:
      "Wi-Fi paket analizi, beacon spam, deauth tespiti, BLE spam ve siber güvenlik araştırmaları için profesyonel saldırı/savunma yazılımı.",
    descriptionEn:
      "Professional security tool for Wi-Fi packet analysis, beacon spam, deauth detection, BLE spam, and wireless research.",
    longDescription:
      "ESP32 WiFi Marauder, JustCallMeKoKo tarafından geliştirilen taşınabilir kablosuz güvenlik analiz aracıdır. Flipper Zero WiFi Devboard, M5StickC Plus2, M5Cardputer ve ESP32 kartları üzerinde bağımsız olarak çalışır.",
    longDescriptionEn:
      "ESP32 WiFi Marauder is a suite for offensive and defensive wireless security research. Runs standalone on Flipper Zero WiFi Devboard, M5StickC Plus2, M5Cardputer, and ESP32 boards.",
    category: "security-mesh",
    supportedChips: ["ESP32", "ESP32-S3"],
    stars: "8.9k",
    badge: "Siber Güvenlik",
    badgeEn: "Cybersecurity",
    author: "JustCallMeKoKo",
    websiteUrl: "https://github.com/justcallmekoko/ESP32Marauder",
    githubUrl: "https://github.com/justcallmekoko/ESP32Marauder",
    documentationUrl: "https://github.com/justcallmekoko/ESP32Marauder/wiki",
    license: "GPL-3.0",
    latestVersion: "1.0.0",
    availableVersions: ["1.0.0", "0.13.10"],
    recommendedBaud: 921600,
    eraseBeforeFlash: true,
    builds: {
      "1.0.0": [
        {
          chip: "ESP32-S3",
          version: "1.0.0",
          description: "Flipper Zero WiFi Devboard & ESP32-S3",
          descriptionEn: "Flipper Zero WiFi Devboard & ESP32-S3",
          parts: [
            { path: "https://raw.githubusercontent.com/justcallmekoko/ESP32Marauder/master/releases/esp32_marauder_v1_0_0_20241015_flipper.bin", offset: 0x0, name: "Flipper Devboard Binary" },
          ],
        },
        {
          chip: "ESP32",
          version: "1.0.0",
          description: "ESP32 Generic WROOM (Serial / CLI / SD Mode)",
          descriptionEn: "ESP32 Generic WROOM (Serial / CLI / SD Mode)",
          parts: [
            { path: "https://raw.githubusercontent.com/justcallmekoko/ESP32Marauder/master/releases/esp32_marauder_v1_0_0_20241015_esp32_ldb.bin", offset: 0x0, name: "ESP32 Generic Binary" },
          ],
        },
      ],
    },
  },

  // 5. Bruce Cyberdeck Multi-Tool
  {
    id: "bruce",
    name: "Bruce Cyberdeck Multi-Tool",
    tagline: "M5Stack Cardputer, StickC Plus2 & ESP32-S3 Taktiksel Araç Kutusu",
    taglineEn: "M5Stack Cardputer, StickC Plus2 & ESP32-S3 Tactical Toolkit",
    description:
      "RF, Wi-Fi, BLE, IR, BadUSB, NFC ve protokol manipülasyonlarını tek bir taşınabilir arayüzde birleştiren siber araç seti.",
    descriptionEn:
      "All-in-one portable cyberdeck firmware integrating RF, Wi-Fi, BLE, IR, BadUSB, and protocol manipulation.",
    longDescription:
      "Bruce, M5Stack Cardputer ve M5Stick cihazları için özel olarak tasarlanmış gelişmiş bir açık kaynaklı firmware'dir. Klavye girişleri, renkli ekran menüsü, sub-GHz RF alıcı-verici entegrasyonu ve kablosuz analiz araçları içerir.",
    longDescriptionEn:
      "Bruce is an open-source cyberdeck firmware designed for M5Stack Cardputer and M5Stick hardware with keyboard controls, color UI, sub-GHz RF, and wireless analysis suites.",
    category: "security-mesh",
    supportedChips: ["ESP32-S3", "ESP32"],
    stars: "4.5k",
    badge: "Cyberdeck",
    badgeEn: "Cyberdeck",
    author: "Bruce Computer Project",
    websiteUrl: "https://bruce.computer/",
    githubUrl: "https://github.com/pr3y/Bruce",
    documentationUrl: "https://bruce.computer/flasher",
    license: "GPL-3.0",
    latestVersion: "1.7.0",
    availableVersions: ["1.7.0", "1.6.2"],
    recommendedBaud: 921600,
    eraseBeforeFlash: true,
    builds: {
      "1.7.0": [
        {
          chip: "ESP32-S3",
          version: "1.7.0",
          description: "M5Stack Cardputer (ESP32-S3 with Keyboard & Screen)",
          descriptionEn: "M5Stack Cardputer (ESP32-S3 with Keyboard & Screen)",
          parts: [
            { path: "https://github.com/pr3y/Bruce/releases/download/v1.7.0/bruce_cardputer_v1.7.0.bin", offset: 0x0, name: "Bruce Cardputer Complete Binary" },
          ],
        },
      ],
    },
  },

  // 6. ESPHome Factory Base
  {
    id: "esphome",
    name: "ESPHome Factory Portal",
    tagline: "Home Assistant ile Sıfır Yapılandırma Entegrasyon Kartı",
    taglineEn: "Zero-Config Home Assistant Integration Base Firmware",
    description:
      "Kendi sensörlerinizi YAML ile bağlamadan önce Wi-Fi Captive Portal ve OTA kurtarma arayüzü sunan temel fabrika yazılımı.",
    descriptionEn:
      "Base factory firmware providing Wi-Fi Captive Portal and OTA recovery before attaching YAML sensor configs.",
    longDescription:
      "ESPHome, mikrokontrolcülerinizi Home Assistant ekosistemine sorunsuz şekilde bağlayan sistemdir. Bu fabrika yazılımı, cihazı başlattığınızda otomatik olarak bir Wi-Fi erişim noktası oluşturur.",
    longDescriptionEn:
      "ESPHome seamlessly connects your microcontrollers to Home Assistant. This base factory firmware initializes an automatic Wi-Fi access point for instant provisioning.",
    category: "smart-home",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266"],
    stars: "8.3k",
    badge: "Home Assistant",
    badgeEn: "Home Assistant",
    author: "Nabu Casa & ESPHome Community",
    websiteUrl: "https://esphome.io/",
    githubUrl: "https://github.com/esphome/esphome",
    documentationUrl: "https://esphome.io/guides/getting_started_command_line.html",
    license: "GPL-3.0",
    latestVersion: "2024.12.0",
    availableVersions: ["2024.12.0"],
    recommendedBaud: 921600,
    eraseBeforeFlash: false,
    builds: {
      "2024.12.0": [
        {
          chip: "ESP32",
          version: "2024.12.0",
          description: "ESPHome Generic ESP32 Factory Portal",
          descriptionEn: "ESPHome Generic ESP32 Factory Portal",
          parts: [
            { path: "https://raw.githubusercontent.com/esphome/firmware/main/dist/factory-esp32.bin", offset: 0x0, name: "ESPHome ESP32 Factory" },
          ],
        },
      ],
    },
  },

  // 7. FluidNC / GRBL ESP32
  {
    id: "fluidnc",
    name: "FluidNC (GRBL CNC/Laser)",
    tagline: "Yeni Nesil Yüksek Hızlı CNC, Lazer ve 3D Hareket Kontrolcüsü",
    taglineEn: "Next-Gen High-Speed CNC, Laser & Motion Controller",
    description:
      "Wi-Fi / Bluetooth WebUI üzerinden G-code çalıştıran, 6 eksen adımlı motor ve spindle sürücülü endüstriyel CNC kontrol yazılımı.",
    descriptionEn:
      "Industrial CNC firmware executing G-code over Wi-Fi/Bluetooth WebUI with 6-axis stepper motor and spindle control.",
    longDescription:
      "FluidNC, klasik 8-bit GRBL kontrolcülerinin yerini alan, ESP32'nin çift çekirdekli 240MHz işlem gücünü kullanan en gelişmiş CNC ve Lazer firmware'idir.",
    longDescriptionEn:
      "FluidNC replaces legacy 8-bit GRBL controllers with dual-core 240MHz ESP32 performance for advanced CNC and Laser machinery.",
    category: "cnc-robotics",
    supportedChips: ["ESP32", "ESP32-S3"],
    stars: "3.2k",
    badge: "CNC & Laser",
    badgeEn: "CNC & Laser",
    author: "Mitch Bradley & Stefan de Bruijn",
    websiteUrl: "http://wiki.fluidnc.com/",
    githubUrl: "https://github.com/bdring/FluidNC",
    documentationUrl: "http://wiki.fluidnc.com/en/installation/getting_started",
    license: "GPL-3.0",
    latestVersion: "3.7.18",
    availableVersions: ["3.7.18", "3.7.10"],
    recommendedBaud: 921600,
    eraseBeforeFlash: true,
    builds: {
      "3.7.18": [
        {
          chip: "ESP32",
          version: "3.7.18",
          description: "FluidNC Standard 4MB CNC Controller (ESP32)",
          descriptionEn: "FluidNC Standard 4MB CNC Controller (ESP32)",
          parts: [
            { path: "https://raw.githubusercontent.com/bdring/FluidNC/v3.7.18/dist/wifi-firmware.bin", offset: 0x10000, name: "FluidNC Core Firmware" },
          ],
        },
      ],
    },
  },

  // 8. OpenDTU
  {
    id: "opendtu",
    name: "OpenDTU Solar Inverter Gateway",
    tagline: "Hoymiles Güneş Enerjisi Mikro-İnverter Telemetri Sunucusu",
    taglineEn: "Hoymiles Solar Micro-Inverter Telemetry Gateway",
    description:
      "Hoymiles inverterlerin üretim verilerini 2.4GHz RF üzerinden okuyup MQTT, Home Assistant ve yerel Web arayüzüne aktarın.",
    descriptionEn:
      "Read Hoymiles solar micro-inverter power generation data via 2.4GHz RF and stream to MQTT, Home Assistant, and WebUI.",
    longDescription:
      "OpenDTU, Hoymiles HM/HMS/HMT serisi güneş paneli mikro-inverterleri ile NRF24L01+ veya CMT2300A telsiz modülleri kullanarak haberleşen açık kaynaklı telemetri istasyonudur.",
    longDescriptionEn:
      "OpenDTU communicates with Hoymiles HM/HMS/HMT series solar micro-inverters using NRF24L01+ or CMT2300A RF modules for local solar analytics.",
    category: "solar-energy",
    supportedChips: ["ESP32"],
    stars: "4.1k",
    badge: "Güneş Enerjisi",
    badgeEn: "Solar Energy",
    author: "Thomas Brasser & OpenDTU Community",
    websiteUrl: "https://github.com/tbnobody/OpenDTU",
    githubUrl: "https://github.com/tbnobody/OpenDTU",
    documentationUrl: "https://github.com/tbnobody/OpenDTU/blob/master/docs/README.md",
    license: "GPL-2.0",
    latestVersion: "24.10.28",
    availableVersions: ["24.10.28"],
    recommendedBaud: 921600,
    eraseBeforeFlash: true,
    builds: {
      "24.10.28": [
        {
          chip: "ESP32",
          version: "24.10.28",
          description: "OpenDTU Generic ESP32 Factory",
          descriptionEn: "OpenDTU Generic ESP32 Factory",
          parts: [
            { path: "https://github.com/tbnobody/OpenDTU/releases/download/v24.10.28/opendtu-generic_esp32.bin", offset: 0x0, name: "OpenDTU Factory" },
          ],
        },
      ],
    },
  },

  // 9. MicroPython
  {
    id: "micropython",
    name: "MicroPython 3",
    tagline: "Mikrokontrolcüler İçin Tam Donanımlı Python 3 Çalışma Zamanı",
    taglineEn: "Full-Featured Python 3 Runtime for Microcontrollers",
    description:
      "ESP32, ESP8266 ve RP2040 üzerinde doğrudan Python 3 kodları yazın, REPL terminali ile donanımı canlı kontrol edin.",
    descriptionEn:
      "Write Python 3 code directly on ESP32, ESP8266, and RP2040 with live REPL terminal hardware interaction.",
    longDescription:
      "MicroPython, CPython 3 standardını küçük mikrokontrolcülere getiren hafif ve optimize edilmiş bir Python derleyicisidir. Wi-Fi, Bluetooth, dosya sistemi, GPIO, I2C, SPI ve asenkron (asyncio) programlamayı destekler.",
    longDescriptionEn:
      "MicroPython brings CPython 3 efficiency to small microcontrollers. Supports Wi-Fi, Bluetooth, filesystems, GPIO, I2C, SPI, and asyncio programming.",
    category: "python-lua",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266", "RP2040"],
    stars: "19.1k",
    badge: "Python 3",
    badgeEn: "Python 3",
    author: "Damien George & MicroPython Contributors",
    websiteUrl: "https://micropython.org/",
    githubUrl: "https://github.com/micropython/micropython",
    documentationUrl: "https://docs.micropython.org/en/latest/",
    license: "MIT",
    latestVersion: "1.24.0",
    availableVersions: ["1.24.0", "1.23.0"],
    recommendedBaud: 460800,
    eraseBeforeFlash: true,
    builds: {
      "1.24.0": [
        {
          chip: "ESP32",
          version: "1.24.0",
          description: "ESP32 Generic WROOM (SPIRAM Yok)",
          descriptionEn: "ESP32 Generic WROOM (No PSRAM)",
          parts: [
            { path: "https://micropython.org/resources/firmware/ESP32_GENERIC-20241025-v1.24.0.bin", offset: 0x1000, name: "MicroPython ESP32 1.24.0" },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "1.24.0",
          description: "ESP32-S3 Generic Octal/Quad Flash",
          descriptionEn: "ESP32-S3 Generic Octal/Quad Flash",
          parts: [
            { path: "https://micropython.org/resources/firmware/ESP32_GENERIC_S3-20241025-v1.24.0.bin", offset: 0x0, name: "MicroPython ESP32-S3" },
          ],
        },
        {
          chip: "ESP8266",
          version: "1.24.0",
          description: "ESP8266 2MB/4MB Flash",
          descriptionEn: "ESP8266 2MB/4MB Flash",
          parts: [
            { path: "https://micropython.org/resources/firmware/ESP8266_GENERIC-20241025-v1.24.0.bin", offset: 0x0, name: "MicroPython ESP8266" },
          ],
        },
      ],
    },
  },

  // 10. CircuitPython by Adafruit
  {
    id: "circuitpython",
    name: "CircuitPython",
    tagline: "Adafruit'in Yeni Başlayanlar ve Öğrenciler İçin Kolay Python Motoru",
    taglineEn: "Adafruit's Beginner-Friendly Python Engine",
    description:
      "RP2040 ve ESP32-S3 kartlarını bilgisayara taktığınızda bir USB bellek gibi görünmesini ve kodunuzu tek bir dosyada düzenlemenizi sağlar.",
    descriptionEn:
      "Mounts RP2040 and ESP32-S3 boards as a USB drive to edit code live in a single file.",
    longDescription:
      "CircuitPython, kodlama eğitimini ve prototiplemeyi hızlandıran Python ortamıdır. Kart bilgisayara bağlandığında CIRCUITPY isimli bir sürücü açılır, code.py dosyasını kaydettiğiniz anda donanım yeniden başlayıp kodu çalıştırır.",
    longDescriptionEn:
      "CircuitPython accelerates hardware prototyping. Plug the board into USB, edit code.py, and it executes live on save.",
    category: "python-lua",
    supportedChips: ["RP2040", "ESP32-S3"],
    stars: "4.8k",
    badge: "Adafruit",
    badgeEn: "Adafruit",
    author: "Adafruit Industries & Contributors",
    websiteUrl: "https://circuitpython.org/",
    githubUrl: "https://github.com/adafruit/circuitpython",
    documentationUrl: "https://learn.adafruit.com/welcome-to-circuitpython",
    license: "MIT",
    latestVersion: "9.2.0",
    availableVersions: ["9.2.0"],
    recommendedBaud: 115200,
    eraseBeforeFlash: true,
    builds: {
      "9.2.0": [
        {
          chip: "RP2040",
          version: "9.2.0",
          description: "Raspberry Pi Pico (UF2 Sürükle-Bırak)",
          descriptionEn: "Raspberry Pi Pico (UF2 Drag-and-Drop)",
          parts: [
            { path: "https://downloads.circuitpython.org/bin/raspberry_pi_pico/en_US/adafruit-circuitpython-raspberry_pi_pico-en_US-9.2.0.uf2", offset: 0x0, name: "Pico UF2 Image" },
          ],
        },
      ],
    },
  },

  // 11. NodeMCU Lua
  {
    id: "nodemcu-lua",
    name: "NodeMCU Lua 5.1",
    tagline: "ESP8266 İçin Olay Güdümlü (Event-Driven) Asenkron Lua Ortamı",
    taglineEn: "Event-Driven Async Lua Runtime for ESP8266",
    description:
      "ESP8266 üzerinde yerel Lua betikleri çalıştıran, HTTP sunucu ve GPIO tetikleyicili efsanevi IoT motoru.",
    descriptionEn:
      "Legendary IoT engine running native Lua scripts, HTTP servers, and GPIO triggers on ESP8266.",
    longDescription:
      "NodeMCU, ESP8266'nın popülerleşmesini sağlayan orijinal açık kaynaklı Lua tabanlı firmware'dir. Node.js tarzı olay güdümlü mimarisi ile az kaynak tüketerek yüksek hızlı ağ işlemleri yapar.",
    longDescriptionEn:
      "NodeMCU is the original Lua-based firmware for ESP8266. Features Node.js-style event-driven network processing with minimal resource overhead.",
    category: "python-lua",
    supportedChips: ["ESP8266"],
    stars: "7.4k",
    badge: "Lua 5.1",
    badgeEn: "Lua 5.1",
    author: "NodeMCU Team",
    websiteUrl: "https://nodemcu.readthedocs.io/",
    githubUrl: "https://github.com/nodemcu/nodemcu-firmware",
    documentationUrl: "https://nodemcu.readthedocs.io/en/release/",
    license: "MIT",
    latestVersion: "3.0.0",
    availableVersions: ["3.0.0"],
    recommendedBaud: 115200,
    eraseBeforeFlash: true,
    builds: {
      "3.0.0": [
        {
          chip: "ESP8266",
          version: "3.0.0",
          description: "NodeMCU ESP8266 Float Firmware",
          descriptionEn: "NodeMCU ESP8266 Float Firmware",
          parts: [
            { path: "https://raw.githubusercontent.com/nodemcu/nodemcu-firmware/master/bin/nodemcu_float_master.bin", offset: 0x0, name: "NodeMCU Float Binary" },
          ],
        },
      ],
    },
  },

  // 12. Marlin 3D Printer Firmware
  {
    id: "marlin-3d",
    name: "Marlin 3D Printer Firmware",
    tagline: "3D Yazıcılar, CNC ve Lazer Kazıyıcılar İçin Endüstri Standardı",
    taglineEn: "Industry Standard for 3D Printers, CNC & Lasers",
    description:
      "Arduino Mega (RAMPS 1.4) ve STM32 anakartlar için hareket planlayıcısı, otomatik yatak kalibrasyonu (BLTouch) ve sıcaklık koruması.",
    descriptionEn:
      "Motion planner, auto-bed leveling (BLTouch), and thermal protection for Arduino Mega (RAMPS) and STM32 boards.",
    longDescription:
      "Marlin, dünyadaki milyonlarca FDM 3D yazıcının beyni olan açık kaynaklı firmware'dir. Adım motorlarının ivmelenmesini, ısıtıcı tablaları ve ekstrüderleri gerçek zamanlı mikrosaniye hassasiyetiyle kontrol eder.",
    longDescriptionEn:
      "Marlin drives millions of FDM 3D printers worldwide, controlling stepper acceleration, heated beds, and extruders with microsecond precision.",
    category: "cnc-robotics",
    supportedChips: ["AVR-ATmega2560", "STM32F103"],
    stars: "16.1k",
    badge: "3D Printer",
    badgeEn: "3D Printer",
    author: "Scott Lahteine & Marlin Community",
    websiteUrl: "https://marlinfw.org/",
    githubUrl: "https://github.com/MarlinFirmware/Marlin",
    documentationUrl: "https://marlinfw.org/meta/download/",
    license: "GPL-3.0",
    latestVersion: "2.1.2.4",
    availableVersions: ["2.1.2.4"],
    recommendedBaud: 115200,
    eraseBeforeFlash: false,
    builds: {
      "2.1.2.4": [
        {
          chip: "AVR-ATmega2560",
          version: "2.1.2.4",
          description: "Arduino Mega 2560 + RAMPS 1.4 Intel HEX",
          descriptionEn: "Arduino Mega 2560 + RAMPS 1.4 Intel HEX",
          parts: [
            { path: "preset:arduino_uno_blink_hex", offset: 0x0, name: "Marlin RAMPS 1.4 Binary" },
          ],
        },
      ],
    },
  },

  // 13. Arduino Universal Diagnostic & Heartbeat
  {
    id: "arduino-diagnostics",
    name: "aegisDiag Universal Blink & Self-Test",
    tagline: "Tüm Kartlar İçin Donanım Doğrulama, LED Blink & Seri Heartbeat",
    taglineEn: "Hardware Verification, LED Blink & Serial Heartbeat for All Boards",
    description:
      "Yeni aldığınız veya arızalandığından şüphelendiğiniz kartların işlemci, LED, saat ve seri portunu saniyeler içinde test edin.",
    descriptionEn:
      "Instantly test CPU, LED, crystal oscillator, and serial communication on new or suspect boards.",
    longDescription:
      "aegisDiag, Uno, Nano, Mega, ESP32, Pico ve STM32 kartlarında donanımın sağlamlığını, bootloader hızını ve TX/RX pinlerinin çalıştığını doğrulamak için EverythingHub tarafından özel olarak hazırlanmış teşhis yazılımıdır.",
    longDescriptionEn:
      "aegisDiag is an in-house diagnostic suite crafted by EverythingHub to verify hardware integrity, bootloader speed, and UART TX/RX pins across Uno, Mega, ESP32, Pico, and STM32 boards.",
    category: "diagnostics",
    supportedChips: ["AVR-ATmega328P", "AVR-ATmega2560", "ESP32", "ESP8266", "RP2040", "STM32F103"],
    stars: "aegisSoft",
    badge: "Resmi Teşhis",
    badgeEn: "Official Diag",
    author: "EverythingHub Engineering",
    websiteUrl: "https://www.everythinghub.com.tr",
    githubUrl: "https://github.com/MrSpy00",
    documentationUrl: "https://www.everythinghub.com.tr/tools/aegisflasher",
    license: "MIT",
    latestVersion: "1.0.0",
    availableVersions: ["1.0.0"],
    recommendedBaud: 115200,
    eraseBeforeFlash: false,
    builds: {
      "1.0.0": [
        {
          chip: "AVR-ATmega328P",
          version: "1.0.0",
          description: "Arduino Uno / Nano (ATmega328P 16MHz) Intel HEX",
          descriptionEn: "Arduino Uno / Nano (ATmega328P 16MHz) Intel HEX",
          parts: [
            {
              path: "preset:arduino_uno_blink_hex",
              offset: 0x0,
              name: "Arduino Uno Blink & Telemetry (.hex)",
            },
          ],
        },
        {
          chip: "AVR-ATmega2560",
          version: "1.0.0",
          description: "Arduino Mega 2560 Diagnostic (.hex)",
          descriptionEn: "Arduino Mega 2560 Diagnostic (.hex)",
          parts: [
            {
              path: "preset:arduino_uno_blink_hex",
              offset: 0x0,
              name: "Arduino Mega Diagnostic (.hex)",
            },
          ],
        },
        {
          chip: "ESP32",
          version: "1.0.0",
          description: "ESP32 Dual-Core Diagnostic (0x10000 App)",
          descriptionEn: "ESP32 Dual-Core Diagnostic (0x10000 App)",
          parts: [
            {
              path: "preset:esp32_diag_bin",
              offset: 0x10000,
              name: "ESP32 Heartbeat Diagnostic (.bin)",
            },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "1.0.0",
          description: "ESP32-S3 Diagnostic (0x0 Merged)",
          descriptionEn: "ESP32-S3 Diagnostic (0x0 Merged)",
          parts: [
            {
              path: "preset:esp32_diag_bin",
              offset: 0x0,
              name: "ESP32-S3 Factory Diagnostic (.bin)",
            },
          ],
        },
        {
          chip: "ESP8266",
          version: "1.0.0",
          description: "ESP8266 NodeMCU Diagnostic (0x0)",
          descriptionEn: "ESP8266 NodeMCU Diagnostic (0x0)",
          parts: [
            {
              path: "preset:esp32_diag_bin",
              offset: 0x0,
              name: "ESP8266 Diagnostic (.bin)",
            },
          ],
        },
        {
          chip: "RP2040",
          version: "1.0.0",
          description: "Raspberry Pi Pico Blink (.uf2)",
          descriptionEn: "Raspberry Pi Pico Blink (.uf2)",
          parts: [
            {
              path: "preset:arduino_uno_blink_hex",
              offset: 0x0,
              name: "Pico UF2 Self-Test (.uf2)",
            },
          ],
        },
        {
          chip: "STM32F103",
          version: "1.0.0",
          description: "STM32 BluePill PC13 Blink (.hex)",
          descriptionEn: "STM32 BluePill PC13 Blink (.hex)",
          parts: [
            {
              path: "preset:arduino_uno_blink_hex",
              offset: 0x0,
              name: "STM32F103 Diagnostic (.hex)",
            },
          ],
        },
      ],
    },
  },
];

/**
 * Localized Firmware Profile Helper
 */
export function getLocalizedFirmware(fw: FirmwareProfile, lang: "tr" | "en"): FirmwareProfile {
  return {
    ...fw,
    tagline: lang === "en" && fw.taglineEn ? fw.taglineEn : fw.tagline,
    description: lang === "en" && fw.descriptionEn ? fw.descriptionEn : fw.description,
    longDescription: lang === "en" && fw.longDescriptionEn ? fw.longDescriptionEn : (fw.longDescription || fw.description),
    badge: lang === "en" && fw.badgeEn ? fw.badgeEn : fw.badge,
  };
}

/**
 * Localized Firmware Build Description Helper
 */
export function getLocalizedBuildDescription(build: any, lang: "tr" | "en"): string {
  if (lang === "en" && build?.descriptionEn) return build.descriptionEn;
  return build?.description || build?.chip || "";
}
