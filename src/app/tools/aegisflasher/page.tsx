import type { Metadata } from "next";
import { AegisFlasherClient } from "./AegisFlasherClient";

export const metadata: Metadata = {
  title: "aegisFlasher — Evrensel Web Mikrokontrolcü Flaşlayıcı & Seri Monitör",
  description:
    "ESP32, ESP32-S3, ESP8266, Arduino Uno/Nano, Raspberry Pi Pico ve STM32 için sıfır kurulumlu, tarayıcı tabanlı yüksek hızlı Web Serial firmware flaşlayıcı, 30+ popüler firmware kataloğu, bellek dökümü ve ANSI terminal stüdyosu.",
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
    "aegisFlasher",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/aegisflasher",
  },
  openGraph: {
    title: "aegisFlasher — Evrensel Web Mikrokontrolcü Flaşlayıcı & Seri Monitör",
    description:
      "ESP32, ESP8266, Arduino ve STM32 cihazlarınızı doğrudan tarayıcınızdan flaşlayın, yedekleyin ve canlı seri port loglarını izleyin.",
    url: "https://www.everythinghub.com.tr/tools/aegisflasher",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aegisFlasher — Web Firmware Flasher & Serial Studio",
    description:
      "Tarayıcınız üzerinden ESP32, Arduino ve RP2040 için sıfır kurulumlu profesyonel mikrokontrolcü stüdyosu.",
  },
};

export default function AegisFlasherPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "aegisFlasher",
    alternateName: ["aegisFlasher Web Hardware Studio", "EverythingHub Web Flasher"],
    url: "https://www.everythinghub.com.tr/tools/aegisflasher",
    description:
      "ESP32, ESP8266, Arduino AVR, RP2040 ve STM32 için evrensel tarayıcı tabanlı Web Serial / WebUSB firmware flaşlama, telemetri, NVS yapılandırma ve ANSI seri terminal aracı.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser (Chromium / Edge / Chrome / Brave / Opera)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "MrSpy00",
      url: "https://github.com/MrSpy00",
    },
    creator: {
      "@type": "Organization",
      name: "aegisSoft / EverythingHub",
      url: "https://www.everythinghub.com.tr",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AegisFlasherClient />
    </>
  );
}
