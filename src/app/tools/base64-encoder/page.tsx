import type { Metadata } from "next";
import { Base64Client } from "./Base64Client";

export const metadata: Metadata = {
  title: "Base64 Kodlayıcı & Çözücü — Encode & Decode Studio",
  description:
    "Metinleri ve verileri UTF-8 destekli Base64 formatına dönüştürün ve güvenle geri çözün. URL-safe format desteği sunar.",
  keywords: [
    "base64 kodlayıcı",
    "base64 çözücü",
    "base64 encoder online",
    "base64 decoder online",
    "utf8 base64 converter",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/base64-encoder",
  },
  openGraph: {
    title: "Base64 Kodlayıcı & Çözücü — EverythingHub",
    description: "Metin ve verileri Base64 formatına anında kodlayın ve güvenle çözün.",
    url: "https://www.everythinghub.com.tr/tools/base64-encoder",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64 Kodlayıcı & Çözücü — EverythingHub",
    description: "Metin ve verileri Base64 formatına anında kodlayın ve güvenle çözün.",
  },
};

export default function Base64Page() {
  return <Base64Client />;
}
