import type { Metadata } from "next";
import { APIPlaygroundClient } from "./APIPlaygroundClient";

export const metadata: Metadata = {
  title: "Canlı API Test Konsolu & Açık API Kataloğu — Free API Playground",
  description:
    "150+ ücretsiz ve zero-auth genel API'yi canlı test edin, özel HTTP GET/POST istekleri gönderin, yanıt süresi ve JSON yüklerini anında inceleyin.",
  keywords: [
    "api test aracı",
    "free api tester",
    "rest api playground",
    "public apis catalog",
    "http client online",
    "hoppscotch alternative",
    "freeapi",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/api-playground",
  },
  openGraph: {
    title: "Canlı API Test Konsolu & Açık API Kataloğu — EverythingHub",
    description: "Kayıt ve anahtar gerektirmeyen genel API'leri canlı test edin ve cURL kodlarını kopyalayın.",
    url: "https://www.everythinghub.com.tr/tools/api-playground",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canlı API Test Konsolu & Açık API Kataloğu — EverythingHub",
    description: "Kayıt ve anahtar gerektirmeyen genel API'leri canlı test edin ve cURL kodlarını kopyalayın.",
  },
};

export default function APIPlaygroundPage() {
  return <APIPlaygroundClient />;
}
