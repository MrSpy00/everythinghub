import type { Metadata } from "next";
import { CurlToCodeClient } from "./CurlToCodeClient";

export const metadata: Metadata = {
  title: "cURL'den Çoklu Dil Kod Üreticisi — Fetch, Axios, Python & Go Studio",
  description:
    "cURL komutlarını anında JavaScript fetch, Axios, Python requests, Go ve PHP kodlarına dönüştürün.",
  keywords: [
    "curl to fetch",
    "curl to python",
    "curl to axios",
    "curl to go",
    "api code generator",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/curl-to-code",
  },
  openGraph: {
    title: "cURL'den Çoklu Dil Kod Üreticisi — EverythingHub",
    description: "cURL komutlarını JavaScript, Python, Go ve PHP kodlarına anında dönüştürün.",
    url: "https://www.everythinghub.com.tr/tools/curl-to-code",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cURL'den Çoklu Dil Kod Üreticisi — EverythingHub",
    description: "cURL komutlarını JavaScript, Python, Go ve PHP kodlarına anında dönüştürün.",
  },
};

export default function CurlToCodePage() {
  return <CurlToCodeClient />;
}
