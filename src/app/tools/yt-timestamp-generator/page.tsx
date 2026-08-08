import type { Metadata } from "next";
import { YTTimestampClient } from "./YTTimestampClient";

export const metadata: Metadata = {
  title: "YouTube Zaman Damgası Üretici — Timestamp Link Studio",
  description:
    "Videolar için özel başlama süreli YouTube bağlantıları (timestamp link) ve açıklama zaman damgası listeleri oluşturun.",
  keywords: [
    "youtube zaman damgası üretici",
    "youtube timestamp generator",
    "youtube saniyeli link oluşturma",
    "youtube zamanlı bağlantı üretici",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/yt-timestamp-generator",
  },
  openGraph: {
    title: "YouTube Zaman Damgası Üretici — EverythingHub",
    description: "YouTube videolarınız için özel başlama süreli zaman damgası bağlantıları oluşturun.",
    url: "https://www.everythinghub.com.tr/tools/yt-timestamp-generator",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Zaman Damgası Üretici — EverythingHub",
    description: "YouTube videolarınız için özel başlama süreli zaman damgası bağlantıları oluşturun.",
  },
};

export default function YTTimestampPage() {
  return <YTTimestampClient />;
}
