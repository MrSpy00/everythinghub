import type { Metadata } from "next";
import { EXIFPurgerClient } from "./EXIFPurgerClient";

export const metadata: Metadata = {
  title: "EXIF Metaveri İnceleyici & Gizlilik Temizleyici — Fotoğraf Güvenlik Stüdyosu",
  description:
    "Fotoğraflarınızdaki GPS konum koordinatlarını, kamera modelini ve çekim metaverilerini inceleyin ve paylaşmadan önce %100 tarayıcıda temizleyin.",
  keywords: [
    "exif temizleyici",
    "fotoğraftan gps silme",
    "exif viewer online",
    "metadata remover",
    "fotoğraf gizlilik koruma",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/exif-purger",
  },
  openGraph: {
    title: "EXIF Metaveri İnceleyici & Gizlilik Temizleyici — EverythingHub",
    description: "GPS ve kamera metaverilerini fotoğraflardan güvenle temizleyin.",
    url: "https://www.everythinghub.com.tr/tools/exif-purger",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EXIF Metaveri İnceleyici & Gizlilik Temizleyici — EverythingHub",
    description: "GPS ve kamera metaverilerini fotoğraflardan güvenle temizleyin.",
  },
};

export default function EXIFPurgerPage() {
  return <EXIFPurgerClient />;
}
