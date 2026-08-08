import type { Metadata } from "next";
import { WordCounterClient } from "./WordCounterClient";

export const metadata: Metadata = {
  title: "Kelime ve Metin Sayacı — Character & Reading Time Counter",
  description:
    "Kelime, karakter (boşluklu/boşluksuz), cümle, paragraf ve tahmini okuma/konuşma süresini anlık olarak analiz edin.",
  keywords: [
    "kelime sayacı",
    "word counter online",
    "karakter sayacı",
    "metin okuma süresi hesaplama",
    "paragraf sayacı",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/word-counter",
  },
  openGraph: {
    title: "Kelime ve Metin Sayacı — EverythingHub",
    description: "Kelime, karakter, cümle ve tahmini okuma sürelerini canlı olarak analiz edin.",
    url: "https://www.everythinghub.com.tr/tools/word-counter",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kelime ve Metin Sayacı — EverythingHub",
    description: "Kelime, karakter, cümle ve tahmini okuma sürelerini canlı olarak analiz edin.",
  },
};

export default function WordCounterPage() {
  return <WordCounterClient />;
}
