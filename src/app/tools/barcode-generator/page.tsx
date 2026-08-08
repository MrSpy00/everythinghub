import type { Metadata } from "next";
import { BarcodeGeneratorClient } from "./BarcodeGeneratorClient";

export const metadata: Metadata = {
  title: "Vektörel Barkod Üreteci — EAN-13, UPC, Code 128 & SVG İndirici",
  description:
    "EAN-13, UPC-A, Code 128 ve Code 39 barkod standartlarında baskıya hazır vektörel SVG ve yüksek çözünürlüklü PNG barkodları ücretsiz üretin.",
  keywords: [
    "barkod üretici",
    "ean13 barcode generator",
    "code 128 barkod oluşturucu",
    "upc barkod",
    "vektörel barkod svg",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/barcode-generator",
  },
  openGraph: {
    title: "Vektörel Barkod Üreteci — EverythingHub",
    description: "EAN-13, Code 128 ve UPC barkodları baskıya hazır SVG ve PNG olarak anında oluşturun.",
    url: "https://www.everythinghub.com.tr/tools/barcode-generator",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vektörel Barkod Üreteci — EverythingHub",
    description: "EAN-13, Code 128 ve UPC barkodları baskıya hazır SVG ve PNG olarak anında oluşturun.",
  },
};

export default function BarcodeGeneratorPage() {
  return <BarcodeGeneratorClient />;
}
