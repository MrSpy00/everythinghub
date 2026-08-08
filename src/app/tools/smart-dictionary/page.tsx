import type { Metadata } from "next";
import { SmartDictionaryClient } from "./SmartDictionaryClient";

export const metadata: Metadata = {
  title: "İngilizce Akıllı Sözlük, Telaffuz & Kafiye Motoru — Dictionary Studio",
  description:
    "İngilizce kelimelerin fonetik telaffuz seslerini dinleyin, tanımları inceleyin, kafiyeli kelimeleri ve eşanlamlıları canlı keşfedin.",
  keywords: [
    "ingilizce sözlük online",
    "kelime telaffuz dinleme",
    "kafiye bulucu",
    "rhyme finder",
    "eş anlamlılar sözlüğü",
    "free dictionary api",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/smart-dictionary",
  },
  openGraph: {
    title: "İngilizce Akıllı Sözlük & Kafiye Motoru — EverythingHub",
    description: "Fonetik sesler, tanımlar, kafiyeler ve eşanlamlılar stüdyosu.",
    url: "https://www.everythinghub.com.tr/tools/smart-dictionary",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İngilizce Akıllı Sözlük & Kafiye Motoru — EverythingHub",
    description: "Fonetik sesler, tanımlar, kafiyeler ve eşanlamlılar stüdyosu.",
  },
};

export default function SmartDictionaryPage() {
  return <SmartDictionaryClient />;
}
