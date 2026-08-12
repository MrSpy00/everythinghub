import type { Metadata } from "next";
import { HubSenseClient } from "./HubSenseClient";

export const metadata: Metadata = {
  title: "HubSense — Duyu Hafızası Oyun Arenası | Renk, Ses, Zaman, Şekil",
  description:
    "Renkler, sesler, süreler ve şekilleri sandığınızdan çok daha kötü hatırlıyorsunuz. Bilimsel CIELAB/ERB/IoU skorlama ile duyu hafızanızı test edin. Günlük meydan okuma, global skor tablosu ve paylaşım özelliği.",
  keywords: [
    "duyu hafızası oyunu",
    "renk hafızası testi",
    "ses frekansı testi",
    "zaman algısı oyunu",
    "şekil hafızası",
    "HubSense",
    "EverythingHub",
    "aegisSoft",
    "MrSpy00",
    "dialed.gg alternatifi",
    "bilimsel skorlama",
    "CIELAB Delta-E",
    "ERB psikokustik",
    "IoU şekil puanlama",
    "günlük meydan okuma",
    "skor tablosu",
    "hafıza testi",
    "perception game",
    "memory game",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/hub-sense",
  },
  openGraph: {
    title: "HubSense — Duyu Hafızası Oyun Arenası",
    description:
      "Renkler, sesler, süreler ve şekilleri sandığından çok daha kötü hatırlıyorsun. Dene, puanla, paylaş.",
    url: "https://www.everythinghub.com.tr/tools/hub-sense",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://www.everythinghub.com.tr/api/hub-sense/og",
        width: 1200,
        height: 630,
        alt: "HubSense — Duyu Hafızası Oyun Arenası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HubSense — Duyu Hafızası Oyun Arenası",
    description:
      "Renk, ses, zaman ve şekil hafızanı bilimsel olarak test et. EverythingHub'ın ücretsiz oyun arenası.",
    images: ["https://www.everythinghub.com.tr/api/hub-sense/og"],
  },
  other: {
    "application-name": "HubSense",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function HubSensePage() {
  return <HubSenseClient />;
}
