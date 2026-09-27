import type { Metadata } from "next";
import { AegisFlasherClient } from "./AegisFlasherClient";
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "aegisFlasher — Evrensel Web Mikrokontrolcü Flaşlayıcı & Seri Monitör",
  description:
    "ESP32, ESP32-S3, ESP32-C3, ESP8266, Arduino Uno/Nano, Raspberry Pi Pico ve STM32 için sıfır kurulumlu, tarayıcı tabanlı yüksek hızlı Web Serial firmware flaşlayıcı. WLED, Tasmota, Meshtastic 30+ hazır firmware kataloğu, bellek dökümü, ANSI terminal stüdyosu ve I2C sensör rehberi.",
  keywords: [
    "web flasher",
    "esp32 web flasher",
    "esp32 flasher online",
    "esptool js online",
    "arduino web flasher",
    "wled flasher",
    "tasmota web installer",
    "meshtastic flasher",
    "marauder web flasher",
    "web serial terminal",
    "esp8266 flasher",
    "pico uf2 flasher",
    "stm32 web flasher",
    "seri monitör online",
    "firmware flashing browser",
    "esp32 firmware update online",
    "arduino firmware upload browser",
    "micropython web repl",
    "web serial api flasher",
    "esptool web",
    "ch340 driver web flasher",
    "cp2102 esp32 online",
    "web serial oscilloscope",
    "esp32 flash dump online",
    "esp32 efuse reader",
    "arduino uno hex uploader web",
    "esp32-s3 web installer",
    "aegisFlasher",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/aegisflasher",
    languages: {
      "tr": "https://www.everythinghub.com.tr/tools/aegisflasher",
      "en": "https://www.everythinghub.com.tr/tools/aegisflasher",
      "x-default": "https://www.everythinghub.com.tr/tools/aegisflasher",
    },
  },
  openGraph: {
    title: "aegisFlasher — Evrensel Web Mikrokontrolcü Flaşlayıcı & Seri Monitör",
    description:
      "ESP32, ESP8266, Arduino ve STM32 cihazlarınızı doğrudan tarayıcınızdan flaşlayın, yedekleyin ve canlı seri port loglarını izleyin. Sıfır kurulum, Web Serial API destekli.",
    url: "https://www.everythinghub.com.tr/tools/aegisflasher",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://www.everythinghub.com.tr/opengraph-image",
        width: 1200,
        height: 630,
        alt: "aegisFlasher — Web Firmware Flasher & Serial Monitor Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "aegisFlasher — Web Firmware Flasher & Serial Studio",
    description:
      "Tarayıcınız üzerinden ESP32, Arduino ve RP2040 için sıfır kurulumlu profesyonel mikrokontrolcü stüdyosu. Web Serial API powered.",
    images: ["https://www.everythinghub.com.tr/opengraph-image"],
    creator: "@everythinghub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function AegisFlasherPage() {
  const jsonLdWebapp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "aegisFlasher",
    alternateName: [
      "aegisFlasher Web Hardware Studio",
      "EverythingHub Web Flasher",
      "aegisSoft Flasher",
    ],
    url: "https://www.everythinghub.com.tr/tools/aegisflasher",
    description:
      "ESP32, ESP8266, Arduino AVR, RP2040 ve STM32 için evrensel tarayıcı tabanlı Web Serial / WebUSB firmware flaşlama, telemetri, NVS yapılandırma ve ANSI seri terminal aracı.",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Firmware Flasher",
    operatingSystem: "Web Browser (Chromium / Edge / Chrome / Brave / Opera)",
    browserRequirements: "Requires Web Serial API support (Chrome 89+, Edge 89+)",
    softwareVersion: "2.0",
    inLanguage: ["tr", "en"],
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "ESP32 / ESP8266 / ESP32-S3 firmware flashing via Web Serial",
      "Arduino Intel HEX upload via STK500v1 protocol",
      "Raspberry Pi Pico UF2 bootloader instructions",
      "Real-time ANSI serial monitor with hex dump view",
      "Multi-channel serial data plotter / oscilloscope",
      "Full flash memory backup, dump and chip erase",
      "Silicon eFuse security audit (Secure Boot, Flash Encryption, JTAG)",
      "MicroPython REPL studio and code runner with sample snippets",
      "Improv Wi-Fi wireless provisioning",
      "NVS configuration image burner",
      "I2C sensor address database and pull-up calculator",
      "Visual partition table editor (CSV & binary)",
      "Hardware pinout reference guide",
      "USB driver installation guide (CH340, CP2102, FTDI)",
      "30+ curated open-source firmware catalog (WLED, Tasmota, Meshtastic, ESPHome)",
    ],
    screenshot: "https://www.everythinghub.com.tr/opengraph-image",
    author: {
      "@type": "Person",
      name: "MrSpy00",
      url: "https://github.com/MrSpy00",
    },
    creator: {
      "@type": "Organization",
      name: "aegisSoft / EverythingHub",
      url: "https://www.everythinghub.com.tr",
      sameAs: [
        "https://everythinghub.com.tr",
        "https://www.everythinghub.info",
        "https://everythinghub.info",
      ],
    },
    potentialAction: {
      "@type": "UseAction",
      target: "https://www.everythinghub.com.tr/tools/aegisflasher",
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Web Serial API nedir ve aegisFlasher hangi tarayıcılarda çalışır?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Web Serial API, web uygulamalarının USB seri portları (COM portları) üzerinden mikrokontrolcülerle doğrudan çift yönlü iletişim kurmasını sağlayan W3C standardıdır. Google Chrome (v89+), Microsoft Edge (v89+), Brave ve Opera tarayıcılarında herhangi bir sürücü eklentisi olmadan yerel olarak çalışır. Firefox ve Safari şu anda bu standardı desteklememektedir.",
        },
      },
      {
        "@type": "Question",
        name: "ESP32 karta bağlanırken 'Timed out waiting for packet header' hatası neden olur?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bu durum genellikle ESP32 çipinin otomatik bootloader moduna (GPIO0 LOW) geçememesinden veya USB kablosunun sadece şarj kablosu olmasından kaynaklanır. Çözüm: Bağlan butonuna tıkladıktan sonra kart üzerindeki 'BOOT' (veya IO0) butonuna basılı tutun ve bağlantı kurulduğunda butonu bırakın. Ayrıca tam veri hatlarına sahip kaliteli bir USB kablosu kullandığınızdan emin olun.",
        },
      },
      {
        "@type": "Question",
        name: "WLED, Tasmota veya Meshtastic firmware'ini tarayıcıdan nasıl kurarım?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Firmware Kataloğu sekmesinden istediğiniz projeyi (örneğin WLED veya Meshtastic) seçin, hedef çip modelinizi belirleyin ve 'Tek Tıkla Flaşla' butonuna basın. aegisFlasher gerekli ikili dosyaları ve ofset adreslerini otomatik olarak hazırlar. Ardından 'Flaşlamayı Başlat' düğmesine basarak saniyeler içinde kurulumu tamamlayabilirsiniz.",
        },
      },
      {
        "@type": "Question",
        name: "Arduino Uno veya Nano kartıma .hex dosyasını nasıl yüklerim?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "aegisFlasher, Arduino AVR ATmega328P ve ATmega2560 için yerleşik STK500v1 bootloader protokolünü destekler. Özel Flaşlama sekmesine derlenmiş .hex dosyanızı sürükleyin, porta bağlanın ve flaşlamayı başlatın. Otomatik DTR reset sinyali ile Arduino bootloader tetiklenir ve firmware doğrudan flash belleğe yazılır.",
        },
      },
      {
        "@type": "Question",
        name: "Firmware flaşlama güvenli midir? Kartım bozulabilir mi (brick olabilir mi)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet, tamamen güvenlidir. ESP32 ve ESP8266 işlemcilerinde birinci seviye ROM bootloader silikon çip içine kalıcı olarak yazılmıştır ve yazılımla silinemez veya bozulamaz. Yanlış veya bozuk bir firmware yüklense bile çip her zaman BOOT butonuyla tekrar flaşlama moduna alınabilir.",
        },
      },
      {
        "@type": "Question",
        name: "eFuse Güvenlik Denetimi ne işe yarar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "eFuse (Electronic Fuse), ESP32 işlemcisinde bir kez programlanabilen kalıcı donanım anahtarlarıdır. aegisFlasher eFuse denetleyicisi Secure Boot, Flash Encryption (AES şifreleme), JTAG hata ayıklama kilitleri ve SPI flash gerilim (VDD_SDIO) seviyelerini salt-okunur olarak denetler; kartınızın geliştirici modunda mı yoksa üretim modunda mı olduğunu raporlar.",
        },
      },
    ],
  };

  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Web Serial ile ESP32 Firmware Flaşlama",
    description: "Tarayıcı üzerinden ESP32 mikrokontrolcüsüne sıfır kurulumla firmware yükleme adımları.",
    step: [
      {
        "@type": "HowToStep",
        name: "Cihazı USB ile Bağlayın",
        text: "ESP32 kartınızı veri aktarımını destekleyen bir USB kablosu ile bilgisayarınıza bağlayın.",
      },
      {
        "@type": "HowToStep",
        name: "Seri Portu Seçin",
        text: "'Cihaz Seç & Bağlan' butonuna tıklayarak tarayıcı izin penceresinden USB seri portunuzu (CP2102/CH340) seçin.",
      },
      {
        "@type": "HowToStep",
        name: "Firmware Dosyalarını Belirleyin",
        text: "Hazır Firmware Kataloğundan seçim yapın veya .bin dosyalarınızı doğru ofset adresleriyle sürükleyip bırakın.",
      },
      {
        "@type": "HowToStep",
        name: "Flaşlamayı Başlatın",
        text: "'Flaşlamayı Başlat' düğmesine basarak yazım ve doğrulama işlemini canlı telemetri eşliğinde tamamlayın.",
      },
    ],
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://www.everythinghub.com.tr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Geliştirici Araçları",
        item: "https://www.everythinghub.com.tr/#developer",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "aegisFlasher",
        item: "https://www.everythinghub.com.tr/tools/aegisflasher",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebapp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div className="w-full flex flex-col">
        {/* Main Interactive Studio Client */}
        <AegisFlasherClient />

        {/* Server-Rendered Comprehensive SEO & Engineering Documentation Section */}
        <section className="w-full max-w-7xl mx-auto px-4 py-16 flex flex-col gap-12 mt-8 border-t border-white/10 text-zinc-300">
          {/* Section Header */}
          <div className="flex flex-col gap-3 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/10 text-zinc-300 w-fit backdrop-blur-xl">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              Teknik Kılavuz & Donanım Dokümantasyonu
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              aegisFlasher: Tarayıcı Tabanlı Evrensel Firmware Stüdyosu
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              aegisFlasher, gömülü sistem geliştiricileri ve IoT meraklıları için Python, esptool CLI, Arduino IDE veya ek sürücü kurulumu gerektirmeden çalışan yeni nesil Web Serial mikrokontrolcü geliştirme platformudur.
            </p>
          </div>

          {/* Compatibility & Architecture Matrix */}
          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              Desteklenen Mikrokontrolcü Aileleri ve Protokol Matrisi
            </h3>
            <p className="text-xs text-zinc-400">
              aegisFlasher donanım çekirdeği, Espressif ROM SLIP protokolü, AVR STK500v1 bootloader ve UF2 dosya sistemi standartlarını doğrudan tarayıcı belleğinde koşturur.
            </p>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-zinc-400 font-semibold font-mono">
                    <th className="py-3 px-4">Mikrokontrolcü</th>
                    <th className="py-3 px-4">İşlemci Mimarisi</th>
                    <th className="py-3 px-4">Flaş Protokolü</th>
                    <th className="py-3 px-4">Varsayılan Ofset</th>
                    <th className="py-3 px-4">Önerilen Baud</th>
                    <th className="py-3 px-4">Öne Çıkan Özellik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">ESP32 (WROOM/WROVER)</td>
                    <td className="py-3 px-4">Xtensa Dual-Core 240MHz</td>
                    <td className="py-3 px-4 text-violet-300">Espressif ROM / Stub</td>
                    <td className="py-3 px-4">0x1000 / 0x10000</td>
                    <td className="py-3 px-4 text-emerald-400">921,600</td>
                    <td className="py-3 px-4 font-sans">Wi-Fi + BLE 4.2, 4MB-16MB Flash</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">ESP32-S3</td>
                    <td className="py-3 px-4">Xtensa LX7 + Vector AI</td>
                    <td className="py-3 px-4 text-violet-300">Native USB-OTG / ROM</td>
                    <td className="py-3 px-4">0x0 (Bootloader)</td>
                    <td className="py-3 px-4 text-emerald-400">921,600 / 1.5M</td>
                    <td className="py-3 px-4 font-sans">AI Hızlandırıcı, Octal SPI PSRAM</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">ESP32-C3 / C6</td>
                    <td className="py-3 px-4">RISC-V 32-bit Core</td>
                    <td className="py-3 px-4 text-violet-300">Espressif ROM / Stub</td>
                    <td className="py-3 px-4">0x0</td>
                    <td className="py-3 px-4 text-emerald-400">460,800</td>
                    <td className="py-3 px-4 font-sans">Wi-Fi 6, Zigbee, Thread, Matter</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">ESP8266 (NodeMCU / D1)</td>
                    <td className="py-3 px-4">Tensilica L106 80/160MHz</td>
                    <td className="py-3 px-4 text-violet-300">Espressif ESP8266 ROM</td>
                    <td className="py-3 px-4">0x0 (Tek İmaj)</td>
                    <td className="py-3 px-4 text-emerald-400">115,200</td>
                    <td className="py-3 px-4 font-sans">Düşük maliyetli IoT & Tasmota</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">Arduino Uno / Nano</td>
                    <td className="py-3 px-4">AVR ATmega328P 16MHz</td>
                    <td className="py-3 px-4 text-cyan-300">STK500v1 DTR Reset</td>
                    <td className="py-3 px-4">0x0 (.hex)</td>
                    <td className="py-3 px-4 text-emerald-400">115,200</td>
                    <td className="py-3 px-4 font-sans">Doğrudan Intel HEX flaşlama</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">Raspberry Pi Pico</td>
                    <td className="py-3 px-4">RP2040 Dual ARM Cortex-M0+</td>
                    <td className="py-3 px-4 text-amber-300">UF2 Bootloader / REPL</td>
                    <td className="py-3 px-4">0x10000000</td>
                    <td className="py-3 px-4 text-emerald-400">115,200 (Seri)</td>
                    <td className="py-3 px-4 font-sans">Sürükle-bırak UF2 & MicroPython</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-sans">STM32 BluePill</td>
                    <td className="py-3 px-4">ARM Cortex-M3 (STM32F103)</td>
                    <td className="py-3 px-4 text-cyan-300">UART System Bootloader</td>
                    <td className="py-3 px-4">0x08000000</td>
                    <td className="py-3 px-4 text-emerald-400">115,200</td>
                    <td className="py-3 px-4 font-sans">BOOT0=1 donanım pini ile UART yükleme</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4-Step Flashing Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-3 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
              <span className="text-xs font-mono font-bold text-violet-400">ADIM 01</span>
              <h4 className="text-base font-bold text-white">USB Bağlantısı</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kartınızı kaliteli bir USB veri kablosu ile bilgisayarınıza takın. CH340, CP2102 veya FTDI köprü yongalarının işletim sisteminizde tanındığından emin olun.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
              <span className="text-xs font-mono font-bold text-violet-400">ADIM 02</span>
              <h4 className="text-base font-bold text-white">Tarayıcı İzni</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                &quot;Cihaz Seç &amp; Bağlan&quot; butonuna basarak tarayıcınızın açtığı güvenli donanım listesinden ilgili COM portunu seçip yetkilendirin.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
              <span className="text-xs font-mono font-bold text-violet-400">ADIM 03</span>
              <h4 className="text-base font-bold text-white">Firmware Seçimi</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                30+ popüler açık kaynaklı firmware profilinden (WLED, Tasmota, Meshtastic vb.) birini seçin veya kendi .bin/.hex dosyalarınızı yükleyin.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
              <span className="text-xs font-mono font-bold text-violet-400">ADIM 04</span>
              <h4 className="text-base font-bold text-white">Güvenli Flaşlama</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Flaşlamayı başlatın. Canlı aktarım hızı (KB/s), kalan süre ve CRC doğrulaması ile yazılım çipe aktarılır ve otomatik olarak yeniden başlatılır.
              </p>
            </div>
          </div>

          {/* Strapping Pins & Troubleshooting Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Donanım Bootloader & Strapping Pinleri
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ESP32 ve ESP8266 işlemciler güç verildiğinde belirli pinlerin voltaj seviyelerine (pull-up / pull-down) bakarak çalışma moduna karar verir:
              </p>
              <ul className="flex flex-col gap-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">GPIO 0 (Boot Pini):</strong> Flaşlama için sıfırlama anında LOW (GND) olmalıdır. Otomatik reset devresi başarısız olursa &quot;BOOT&quot; butonuna basılı tutarak bağlanın.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">GPIO 2 (Strapping Pini):</strong> Açılışta LOW olmalıdır veya boş bırakılmalıdır. Bazı kartlarda dahili mavi LED buraya bağlıdır.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">GPIO 12 (MTDI):</strong> Dahili SPI flash gerilimini (VDD_SDIO) belirler. Açılışta HIGH olursa flash 1.8V moduna geçip çökebilir; boş bırakılması önerilir.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">GPIO 15 (MTDO):</strong> Açılışta ROM loglarının UART0 üzerinden basılmasını kontrol eder (varsayılan HIGH).
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Gizlilik ve Güvenlik Garantisi
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                EverythingHub ve aegisSoft tasarım felsefesi uyarınca aegisFlasher yüzde yüz sıfır veri tutma (zero-retention) prensibiyle çalışır:
              </p>
              <ul className="flex flex-col gap-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">İstemci Taraflı İletişim:</strong> Seri port okuma, yazma ve komut gönderimleri doğrudan tarayıcınızın Web Serial API arabirimi üzerinden donanımınıza akar; üçüncü taraf sunuculara hiçbir veri gitmez.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Güvenli Binary Proxy:</strong> GitHub ve resmi depolardan indirilen firmware ikili dosyaları için SSRF korumalı, allowlist kısıtlamalı ve 64MB boyut limitli güvenli proxy kullanılır.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">eFuse Güvenlik Koruması:</strong> eFuse okuma modülleri kesinlikle salt-okunur (read-only) çalışır. Çipinizdeki kalıcı sigortalar kullanıcı rızası olmadan asla yazılmaz veya değiştirilmez.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-violet-400" />
              Sıkça Sorulan Sorular (SSS)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-white">
                  1. Linux veya ChromeOS üzerinde Web Serial izni hatası alıyorum, ne yapmalıyım?
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Linux sistemlerde seri portlara erişim genellikle <code className="text-violet-300">dialout</code> veya <code className="text-violet-300">uucp</code> kullanıcı grubuna bağlıdır. Terminalinizde <code className="text-zinc-200">sudo usermod -a -G dialout $USER</code> komutunu çalıştırıp oturumu kapatıp açarak port iznini kalıcı olarak tanımlayabilirsiniz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-white">
                  2. 921,600 baud hızında flaşlama başarısız oluyor, neden?
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Bazı ekonomik CH340G veya ucuz USB kabloları yüksek parazit nedeniyle 921,600 baud hızında paket kaybı yaşayabilir. Bu durumda hız seçicisinden 460,800 veya 115,200 baud hızını seçmek %100 kararlı aktarım sağlar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-white">
                  3. Flash dökümü (Memory Dump) dosyasını nasıl geri yüklerim?
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Çip Araçları sekmesinden indirdiğiniz 4MB veya 8MB tam flash dökümünü Özel Flaşlama sekmesine sürükleyin ve ofset değerini 0x0 olarak bırakın. Cihazınız yedeğin alındığı ana birebir dönecektir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-white">
                  4. Canlı Osiloskop / Plotter verileri nasıl formatlanmalıdır?
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Seri monitöre <code className="text-violet-300">temp:24.5 hum:60.2</code> gibi anahtar:değer ikilisi, standart JSON ya da virgülle ayrılmış sayılar (örnek: <code className="text-violet-300">102, 405, 890</code>) gönderdiğinizde aegisFlasher kanalları otomatik algılar ve 60 FPS grafik çizer.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
