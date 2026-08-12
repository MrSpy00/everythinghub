import type { Metadata } from "next";
import { HubSenseClient } from "./HubSenseClient";

export const metadata: Metadata = {
  title: "HubSense — Duyu Hafızası Oyun Arenası | Renk, Ses, Zaman, Şekil, Dizi",
  description:
    "Renkler, sesler, süreler, şekiller ve harmonik ses dizilerini sandığınızdan çok daha zor hatırlarsınız. Bilimsel CIELAB, ERB ve IoU skorlama ile bilişsel duyu algınızı test edin.",
  keywords: [
    "duyu hafızası oyunu",
    "renk hafızası testi",
    "ses frekansı testi",
    "zaman algısı oyunu",
    "şekil hafızası",
    "dizi hafızası",
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
    title: "HubSense — Bilişsel Duyu Hafızası Oyun Arenası",
    description:
      "Renk, ses, zaman, şekil ve dizi hafızanızı bilimsel algoritmalarla test edin. Günlük küresel meydan okuma ve anlık skor tablosu.",
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
    title: "HubSense — Bilişsel Duyu Hafızası Oyun Arenası",
    description:
      "Renk, ses, zaman, şekil ve dizi hafızanı bilimsel olarak test et. EverythingHub'ın ücretsiz oyun arenası.",
    images: ["https://www.everythinghub.com.tr/api/hub-sense/og"],
  },
  other: {
    "application-name": "HubSense",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HubSense",
  alternateName: "HubSense Cognitive Perception Arena",
  url: "https://www.everythinghub.com.tr/tools/hub-sense",
  applicationCategory: "GameApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Scientific cognitive sensory memory and perception benchmark arena testing Color (CIELAB Delta-E), Sound (ERB scale), Time (Weber-Fechner), Shape (IoU), and Sequence working memory.",
  author: {
    "@type": "Organization",
    name: "aegisSoft",
    url: "https://www.everythinghub.com.tr",
  },
  creator: {
    "@type": "Person",
    name: "MrSpy00",
  },
  sameAs: [
    "https://everythinghub.com.tr/tools/hub-sense",
    "https://www.everythinghub.info/tools/hub-sense",
    "https://everythinghub.info/tools/hub-sense",
  ],
};

export default function HubSensePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HubSenseClient />
    </>
  );
}
