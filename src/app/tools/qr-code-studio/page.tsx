import type { Metadata } from "next";
import { QRCodeStudioClient } from "./QRCodeStudioClient";

export const metadata: Metadata = {
  title: "QR Kod Stüdyosu Pro — Özel Vektörel SVG & HD PNG Üreteci",
  description:
    "WiFi şifre paylaşımı, vCard kartvizit, URL ve kripto cüzdanlar için özel renkli, logolu ve vektörel QR kodları %100 tarayıcıda ücretsiz üretin ve indirin.",
  keywords: [
    "qr kod üretici",
    "vektörel qr kod",
    "wifi qr kod oluşturucu",
    "vcard qr kod",
    "logolu qr kod",
    "svg qr code generator",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/qr-code-studio",
  },
  openGraph: {
    title: "QR Kod Stüdyosu Pro — EverythingHub",
    description: "WiFi, vCard ve URL'ler için logolu ve yüksek çözünürlüklü QR kodları üretin.",
    url: "https://www.everythinghub.com.tr/tools/qr-code-studio",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Kod Stüdyosu Pro — EverythingHub",
    description: "WiFi, vCard ve URL'ler için logolu ve yüksek çözünürlüklü QR kodları üretin.",
  },
};

export default function QRCodeStudioPage() {
  return <QRCodeStudioClient />;
}
