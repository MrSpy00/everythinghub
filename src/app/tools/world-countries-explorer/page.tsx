import type { Metadata } from "next";
import { WorldCountriesExplorerClient } from "./WorldCountriesExplorerClient";

export const metadata: Metadata = {
  title: "Dünya Ülkeleri & Coğrafya Karşılaştırma Stüdyosu — REST Countries",
  description:
    "250+ dünya ülkesinin bayrakları, nüfusu, başkenti, dilleri ve para birimlerini canlı keşfedin ve ülkeleri yan yana karşılaştırın.",
  keywords: [
    "ülkeler veritabanı",
    "dünya ülkeleri karşılaştırma",
    "rest countries api",
    "ülke bayrakları svg",
    "ülke nüfusları",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/world-countries-explorer",
  },
  openGraph: {
    title: "Dünya Ülkeleri & Coğrafya Karşılaştırma Stüdyosu — EverythingHub",
    description: "250+ ülkenin bayrakları, başkentleri ve coğrafi verilerini canlı inceleyin.",
    url: "https://www.everythinghub.com.tr/tools/world-countries-explorer",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dünya Ülkeleri & Coğrafya Karşılaştırma Stüdyosu — EverythingHub",
    description: "250+ ülkenin bayrakları, başkentleri ve coğrafi verilerini canlı inceleyin.",
  },
};

export default function WorldCountriesPage() {
  return <WorldCountriesExplorerClient />;
}
