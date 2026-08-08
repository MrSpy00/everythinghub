import type { Metadata } from "next";
import { MockDataGeneratorClient } from "./MockDataGeneratorClient";

export const metadata: Metadata = {
  title: "Geliştiriciler İçin Akıllı Mock Veri & Kimlik Üreteci — Test Data Studio",
  description:
    "Testler ve prototipler için Türkçe ve uluslararası sahte kimlikler, adresler, telefon numaraları, şirket bilgileri ve JSON/CSV mock verileri üretin.",
  keywords: [
    "mock veri üretici",
    "sahte kimlik oluşturucu",
    "test verisi generator",
    "random user json",
    "csv mock data",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/mock-data-generator",
  },
  openGraph: {
    title: "Geliştiriciler İçin Mock Veri Üreteci — EverythingHub",
    description: "JSON ve CSV formatında test verileri ve rastgele kimlikler oluşturun.",
    url: "https://www.everythinghub.com.tr/tools/mock-data-generator",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Geliştiriciler İçin Mock Veri Üreteci — EverythingHub",
    description: "JSON ve CSV formatında test verileri ve rastgele kimlikler oluşturun.",
  },
};

export default function MockDataPage() {
  return <MockDataGeneratorClient />;
}
