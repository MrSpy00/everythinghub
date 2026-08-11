import type { Metadata } from "next";
import { YTThumbnailClient } from "./YTThumbnailClient";

export const metadata: Metadata = {
  title: "YouTube Thumbnail İndirici — 4K & HD Kapak Görseli İndir",
  description:
    "YouTube videolarının HD, Full HD ve 4K kapak resimlerini ücretsiz indirin ve önizleyin. Filigransız ve tam kalitede kapak resmi kaydetme aracı.",
  keywords: [
    "youtube thumbnail indirici",
    "youtube kapak resmi indir",
    "youtube thumbnail downloader 4k",
    "youtube video kapağı kaydet",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/yt-thumbnail-downloader",
  },
  openGraph: {
    title: "YouTube Thumbnail İndirici — EverythingHub",
    description: "YouTube videolarının HD, Full HD ve 4K kapak resimlerini ücretsiz indirin.",
    url: "https://www.everythinghub.com.tr/tools/yt-thumbnail-downloader",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Thumbnail İndirici — EverythingHub",
    description: "YouTube videolarının HD, Full HD ve 4K kapak resimlerini ücretsiz indirin.",
  },
};

export default function YTThumbnailPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "YouTube Thumbnail Downloader",
    "url": "https://www.everythinghub.com.tr/tools/yt-thumbnail-downloader",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript",
    "description": "YouTube videolarının HD ve 4K kapak resimlerini ücretsiz indirme ve önizleme aracı.",
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
      <YTThumbnailClient />
    </>
  );
}

