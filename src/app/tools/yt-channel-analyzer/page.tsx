import type { Metadata } from "next";
import YTChannelClient from "./YTChannelClient";

export const metadata: Metadata = {
  title: "YouTube Kanal & Profil Analizörü Pro | Abone, Gelir & HD Banner İndirici",
  description:
    "YouTube kanallarının ve profillerinin abone sayısını, tahmini aylık/yıllık gelirlerini, performans skorunu, 2560x1440 HD banner ve avatar görsellerini ücretsiz analiz edin ve indirin. aegisSoft & MrSpy00 güvencesiyle.",
  keywords: [
    "youtube kanal analiz",
    "youtube profil analizörü",
    "youtube abone hesaplama",
    "youtube gelir hesaplama",
    "youtube banner indirici",
    "youtube avatar indirici",
    "youtube kanal bulucu",
    "youtube channel analyzer",
    "youtube earnings calculator",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/yt-channel-analyzer",
  },
  openGraph: {
    title: "YouTube Kanal & Profil Analizörü Pro | EverythingHub",
    description:
      "YouTube kanal ve profil analizi: Abone sayıları, tahmini gelir hesaplayıcı, HD avatar/banner indirici ve son video kataloğu.",
    url: "https://www.everythinghub.com.tr/tools/yt-channel-analyzer",
    siteName: "EverythingHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Kanal & Profil Analizörü Pro | EverythingHub",
    description:
      "YouTube kanal ve profil analizi: Abone sayıları, tahmini gelir hesaplayıcı, HD avatar/banner indirici ve son video kataloğu.",
  },
};

export default function YTChannelAnalyzerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YouTube Channel & Profile Analyzer Pro",
    url: "https://www.everythinghub.com.tr/tools/yt-channel-analyzer",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
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
      name: "aegisSoft",
      url: "https://www.everythinghub.com.tr",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YTChannelClient />
    </>
  );
}
