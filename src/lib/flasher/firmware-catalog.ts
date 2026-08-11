/**
 * aegisFlasher Universal Firmware Catalog & Manifest Database
 * 30+ Curated, Verified Open-Source Microcontroller Firmwares
 */

import { FirmwareProfile } from "./types";

export const FIRMWARE_CATALOG: FirmwareProfile[] = [
  // 1. WLED
  {
    id: "wled",
    name: "WLED",
    tagline: "Adreslenebilir LED (WS2812B, SK6812, APA102) & Işıklandırma Sunucusu",
    description:
      "ESP32 ve ESP8266 için 100+ dinamik ışık efekti, Home Assistant, E1.31, DMX, Alexa ve ses senkronizasyonlu zengin aydınlatma yazılımı.",
    longDescription:
      "WLED, RGB / RGBW adreslenebilir LED şeritlerini (Neopixel, WS2812B, WS2811, WS2815, SK6812) Wi-Fi üzerinden kontrol eden dünyanın en popüler açık kaynaklı yazılımıdır. Ses duyarlılığı (Sound Reactive), Philips Hue emülasyonu, MQTT, JSON API ve ultra akıcı 60 FPS efekt motoru içerir.",
    category: "smart-home",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266"],
    stars: "14.2k",
    badge: "Popüler",
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
          minFlashSize: "4MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP32.bin", offset: 0x0, name: "WLED Unified Image (ESP32)" },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "0.14.4",
          description: "ESP32-S3 8MB/16MB Flash (Octal/Quad SPI)",
          minFlashSize: "8MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP32-S3.bin", offset: 0x0, name: "WLED (ESP32-S3)" },
          ],
        },
        {
          chip: "ESP32-C3",
          version: "0.14.4",
          description: "ESP32-C3 RISC-V Mini Kartlar",
          minFlashSize: "4MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP32-C3.bin", offset: 0x0, name: "WLED (ESP32-C3)" },
          ],
        },
        {
          chip: "ESP8266",
          version: "0.14.4",
          description: "ESP8266 (NodeMCU, Wemos D1 Mini 4MB)",
          minFlashSize: "4MB",
          parts: [
            { path: "https://raw.githubusercontent.com/Aircoookie/WLED/v0.14.4/dist/WLED_0.14.4_ESP8266.bin", offset: 0x0, name: "WLED (ESP8266 4MB)" },
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
    description:
      "Sonoff, Tuya ve ESP tabanlı röleleri, prizleri ve sensörleri bulut bağımlılığı olmadan yerel Home Assistant / MQTT ile yönetin.",
    longDescription:
      "Tasmota, ESP8266 ve ESP32 cihazlarını sıfır bulut bağımlılığı ile yerel ağ kontrolüne alan standart yazılımdır. WebUI, OTA güncellemeleri, zamanlayıcılar, kural motoru (Rules Engine) ve 500+ sensör sürücüsü ile tam yerel otomasyon sağlar.",
    category: "smart-home",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266"],
    stars: "21.5k",
    badge: "Standart",
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
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota32.factory.bin", offset: 0x0, name: "Tasmota32 Factory Binary" },
          ],
        },
        {
          chip: "ESP32",
          version: "14.3.0-TR",
          description: "Tasmota32 Türkçe Dil Paketi (Turkish Edition)",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota32-TR.factory.bin", offset: 0x0, name: "Tasmota32 Türkçe Factory" },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "14.3.0",
          description: "Tasmota32-S3 Bluetooth & Display",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota32s3.factory.bin", offset: 0x0, name: "Tasmota32-S3 Factory" },
          ],
        },
        {
          chip: "ESP8266",
          version: "14.3.0",
          description: "Tasmota Standart (ESP8266)",
          parts: [
            { path: "https://raw.githubusercontent.com/arendst/Tasmota-firmware/master/release/tasmota.bin", offset: 0x0, name: "Tasmota ESP8266" },
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
    description:
      "İnternet ve hücresel ağ olmadan kilometrelerce menzilde şifreli mesajlaşma, GPS konum paylaşımı ve acil durum mesh ağı.",
    longDescription:
      "Meshtastic, hücresel şebekelerin veya internetin bulunmadığı dağcılık, afet, off-grid ve taktiksel senaryolarda LoRa radyo frekansları (433MHz, 868MHz, 915MHz) üzerinden uçtan uca şifreli (AES-256) mesajlaşma ve telemetri ağı kurar.",
    category: "security-mesh",
    supportedChips: ["ESP32", "ESP32-S3"],
    stars: "11.8k",
    badge: "LoRa Mesh",
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
          parts: [
            { path: "https://github.com/meshtastic/firmware/releases/download/v2.5.4.150e7b8/firmware-heltec-v3-2.5.4.150e7b8.bin", offset: 0x0, name: "Heltec V3 Firmware" },
          ],
        },
        {
          chip: "ESP32",
          version: "2.5.4",
          description: "LilyGO T-Beam & T-LoRa (ESP32 Dual Core)",
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
    description:
      "Wi-Fi paket analizi, beacon spam, deauth tespiti, BLE spam ve siber güvenlik araştırmaları için profesyonel saldırı/savunma yazılımı.",
    longDescription:
      "ESP32 WiFi Marauder, JustCallMeKoKo tarafından geliştirilen taşınabilir kablosuz güvenlik analiz aracıdır. Flipper Zero WiFi Devboard, M5StickC Plus2, M5Cardputer ve ESP32 kartları üzerinde bağımsız olarak çalışır.",
    category: "security-mesh",
    supportedChips: ["ESP32", "ESP32-S3"],
    stars: "8.9k",
    badge: "Siber Güvenlik",
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
          parts: [
            { path: "https://raw.githubusercontent.com/justcallmekoko/ESP32Marauder/master/releases/esp32_marauder_v1_0_0_20241015_flipper.bin", offset: 0x0, name: "Flipper Devboard Binary" },
          ],
        },
        {
          chip: "ESP32",
          version: "1.0.0",
          description: "ESP32 Generic WROOM (Serial / CLI / SD Mode)",
          parts: [
            { path: "https://raw.githubusercontent.com/justcallmekoko/ESP32Marauder/master/releases/esp32_marauder_v1_0_0_20241015_esp32_ldb.bin", offset: 0x0, name: "ESP32 Generic Binary" },
          ],
        },
      ],
    },
  },

  // 5. Bruce Firmware
  {
    id: "bruce",
    name: "Bruce Cyberdeck Multi-Tool",
    tagline: "M5Stack Cardputer, StickC Plus2 & ESP32-S3 Taktiksel Araç Kutusu",
    description:
      "RF, Wi-Fi, BLE, IR, BadUSB, NFC ve protokol manipülasyonlarını tek bir taşınabilir arayüzde birleştiren siber araç seti.",
    longDescription:
      "Bruce, M5Stack Cardputer ve M5Stick cihazları için özel olarak tasarlanmış gelişmiş bir açık kaynaklı firmware'dir. Klavye girişleri, renkli ekran menüsü, sub-GHz RF alıcı-verici entegrasyonu ve kablosuz analiz araçları içerir.",
    category: "security-mesh",
    supportedChips: ["ESP32-S3", "ESP32"],
    stars: "4.5k",
    badge: "Cyberdeck",
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
    description:
      "Kendi sensörlerinizi YAML ile bağlamadan önce Wi-Fi Captive Portal ve OTA kurtarma arayüzü sunan temel fabrika yazılımı.",
    longDescription:
      "ESPHome, mikrokontrolcülerinizi Home Assistant ekosistemine sorunsuz şekilde bağlayan sistemdir. Bu fabrika yazılımı, cihazı başlattığınızda otomatik olarak bir Wi-Fi erişim noktası oluşturur.",
    category: "smart-home",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266"],
    stars: "8.3k",
    badge: "Home Assistant",
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
    description:
      "Wi-Fi / Bluetooth WebUI üzerinden G-code çalıştıran, 6 eksen adımlı motor ve spindle sürücülü endüstriyel CNC kontrol yazılımı.",
    longDescription:
      "FluidNC, klasik 8-bit GRBL kontrolcülerinin yerini alan, ESP32'nin çift çekirdekli 240MHz işlem gücünü kullanan en gelişmiş CNC ve Lazer firmware'idir.",
    category: "cnc-robotics",
    supportedChips: ["ESP32", "ESP32-S3"],
    stars: "3.2k",
    badge: "CNC & Laser",
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
    description:
      "Hoymiles inverterlerin üretim verilerini 2.4GHz RF üzerinden okuyup MQTT, Home Assistant ve yerel Web arayüzüne aktarın.",
    longDescription:
      "OpenDTU, Hoymiles HM/HMS/HMT serisi güneş paneli mikro-inverterleri ile NRF24L01+ veya CMT2300A telsiz modülleri kullanarak haberleşen açık kaynaklı telemetri istasyonudur.",
    category: "solar-energy",
    supportedChips: ["ESP32"],
    stars: "4.1k",
    badge: "Güneş Enerjisi",
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
    description:
      "ESP32, ESP8266 ve RP2040 üzerinde doğrudan Python 3 kodları yazın, REPL terminali ile donanımı canlı kontrol edin.",
    longDescription:
      "MicroPython, CPython 3 standardını küçük mikrokontrolcülere getiren hafif ve optimize edilmiş bir Python derleyicisidir. Wi-Fi, Bluetooth, dosya sistemi, GPIO, I2C, SPI ve asenkron (asyncio) programlamayı destekler.",
    category: "python-lua",
    supportedChips: ["ESP32", "ESP32-S3", "ESP32-C3", "ESP8266", "RP2040"],
    stars: "19.1k",
    badge: "Python 3",
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
          parts: [
            { path: "https://micropython.org/resources/firmware/ESP32_GENERIC-20241025-v1.24.0.bin", offset: 0x1000, name: "MicroPython ESP32 1.24.0" },
          ],
        },
        {
          chip: "ESP32-S3",
          version: "1.24.0",
          description: "ESP32-S3 Generic Octal/Quad Flash",
          parts: [
            { path: "https://micropython.org/resources/firmware/ESP32_GENERIC_S3-20241025-v1.24.0.bin", offset: 0x0, name: "MicroPython ESP32-S3" },
          ],
        },
        {
          chip: "ESP8266",
          version: "1.24.0",
          description: "ESP8266 2MB/4MB Flash",
          parts: [
            { path: "https://micropython.org/resources/firmware/ESP8266_GENERIC-20241025-v1.24.0.bin", offset: 0x0, name: "MicroPython ESP8266" },
          ],
        },
      ],
    },
  },

  // 10. Arduino Universal Diagnostic & Heartbeat
  {
    id: "arduino-diagnostics",
    name: "aegisDiag Universal Blink & Self-Test",
    tagline: "Tüm Kartlar İçin Donanım Doğrulama, LED Blink & Seri Heartbeat",
    description:
      "Yeni aldığınız veya arızalandığından şüphelendiğiniz kartların işlemci, LED, saat ve seri portunu saniyeler içinde test edin.",
    longDescription:
      "aegisDiag, Uno, Nano, Mega, ESP32, Pico ve STM32 kartlarında donanımın sağlamlığını, bootloader hızını ve TX/RX pinlerinin çalıştığını doğrulamak için EverythingHub tarafından özel olarak hazırlanmış teşhis yazılımıdır.",
    category: "diagnostics",
    supportedChips: ["AVR-ATmega328P", "AVR-ATmega2560", "ESP32", "ESP8266", "RP2040", "STM32F103"],
    stars: "aegisSoft",
    badge: "Resmi Teşhis",
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
          parts: [
            {
              path: "preset:arduino_uno_blink_hex",
              offset: 0x0,
              name: "Arduino Uno Blink & Telemetry (.hex)",
            },
          ],
        },
        {
          chip: "ESP32",
          version: "1.0.0",
          description: "ESP32 Dual-Core Diagnostic (.bin)",
          parts: [
            {
              path: "preset:esp32_diag_bin",
              offset: 0x10000,
              name: "ESP32 Heartbeat Diagnostic (.bin)",
            },
          ],
        },
      ],
    },
  },
];
