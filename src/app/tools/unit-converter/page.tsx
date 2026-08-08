import type { Metadata } from "next";
import { UnitConverterClient } from "./UnitConverterClient";

export const metadata: Metadata = {
  title: "Çoklu Birim Dönüştürücü — Length, Mass & Data Storage Converter",
  description:
    "Uzunluk, kütle, sıcaklık, veri depolama (Byte, KB, MB, GB, TB) ve hız birimlerini kesintisiz ve hassas dönüştürün.",
  keywords: [
    "birim dönüştürücü",
    "unit converter online",
    "veri boyutu dönüştürücü",
    "uzunluk kütle dönüştürücü",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/unit-converter",
  },
  openGraph: {
    title: "Çoklu Birim Dönüştürücü — EverythingHub",
    description: "Uzunluk, kütle, veri depolama ve sıcaklık birimlerini anında ve hassas dönüştürün.",
    url: "https://www.everythinghub.com.tr/tools/unit-converter",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Çoklu Birim Dönüştürücü — EverythingHub",
    description: "Uzunluk, kütle, veri depolama ve sıcaklık birimlerini anında ve hassas dönüştürün.",
  },
};

export default function UnitConverterPage() {
  return <UnitConverterClient />;
}
