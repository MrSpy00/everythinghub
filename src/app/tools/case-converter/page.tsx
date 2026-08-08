import type { Metadata } from "next";
import { CaseConverterClient } from "./CaseConverterClient";

export const metadata: Metadata = {
  title: "Metin Kasa Dönüştürücü — camelCase, snake_case & Title Case",
  description:
    "camelCase, snake_case, kebab-case, Title Case, CONSTANT_CASE, BÜYÜK ve küçük harf dönüşümlerini anında yapın.",
  keywords: [
    "case converter online",
    "camelcase dönüştürücü",
    "snake_case dönüştürücü",
    "kebab-case dönüştürücü",
    "harf büyütme küçültme",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/case-converter",
  },
  openGraph: {
    title: "Metin Kasa Dönüştürücü — EverythingHub",
    description: "camelCase, snake_case, kebab-case ve harf kasa dönüşümlerini anında gerçekleştirin.",
    url: "https://www.everythinghub.com.tr/tools/case-converter",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metin Kasa Dönüştürücü — EverythingHub",
    description: "camelCase, snake_case, kebab-case ve harf kasa dönüşümlerini anında gerçekleştirin.",
  },
};

export default function CaseConverterPage() {
  return <CaseConverterClient />;
}
