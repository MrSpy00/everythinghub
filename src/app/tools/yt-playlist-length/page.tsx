import type { Metadata } from "next";
import { YTPlaylistClient } from "./YTPlaylistClient";

export const metadata: Metadata = {
  title: "YouTube Playlist Analyzer — Süre Hesaplayıcı",
  description:
    "YouTube playlist toplam süresini hesaplayın. Farklı hızlarda (1.25x - 3.0x) izleme sürelerini görün, HD thumbnail'ları indirin. %100 ücretsiz ve üyeliksiz.",
  keywords: [
    "youtube playlist analyzer",
    "youtube playlist süresi hesaplama",
    "youtube playlist uzunluğu",
    "youtube oynatma listesi süresi",
    "youtube playlist duration calculator",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/yt-playlist-length",
  },
  openGraph: {
    title: "YouTube Playlist Analyzer — EverythingHub",
    description: "YouTube playlist toplam süresini hesaplayın, farklı izleme hızları simülasyonunu inceleyin.",
    url: "https://www.everythinghub.com.tr/tools/yt-playlist-length",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Playlist Analyzer — EverythingHub",
    description: "YouTube playlist toplam süresini hesaplayın, farklı izleme hızları simülasyonunu inceleyin.",
  },
};

export default function YTPlaylistPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "YouTube Playlist Analyzer",
    "url": "https://www.everythinghub.com.tr/tools/yt-playlist-length",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript",
    "description": "YouTube playlist toplam süresini ve farklı izleme hızlarındaki simülasyonları hesaplama aracı.",
    "author": {
      "@type": "Organization",
      "name": "aegisSoft / EverythingHub",
      "url": "https://www.everythinghub.com.tr"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YTPlaylistClient />
    </>
  );
}

