import type { Metadata } from "next";
import { PercentageClient } from "./PercentageClient";

export const metadata: Metadata = {
  title: "Yüzde & İndirim Hesaplayıcı — Percentage & Discount Calculator",
  description:
    "Yüzde artış/azalış, oran hesaplama, indirimli fiyat ve KDV tutarlarını anında ve kolayca hesaplayın.",
  keywords: [
    "yüzde hesaplayıcı",
    "percentage calculator online",
    "indirim hesaplama",
    "kdv hesaplama aracı",
    "oran hesaplama",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/percentage-calculator",
  },
  openGraph: {
    title: "Yüzde & İndirim Hesaplayıcı — EverythingHub",
    description: "Yüzde oranları, indirimli fiyat ve KDV tutarlarını anında hesaplayın.",
    url: "https://www.everythinghub.com.tr/tools/percentage-calculator",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yüzde & İndirim Hesaplayıcı — EverythingHub",
    description: "Yüzde oranları, indirimli fiyat ve KDV tutarlarını anında hesaplayın.",
  },
};

export default function PercentagePage() {
  return <PercentageClient />;
}
