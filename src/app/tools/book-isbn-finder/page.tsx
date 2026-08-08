import type { Metadata } from "next";
import { BookISBNFinderClient } from "./BookISBNFinderClient";

export const metadata: Metadata = {
  title: "Açık Kitaplık & ISBN Arama Motoru — Open Library Studio",
  description:
    "20M+ kitap, yazar ve ISBN numarası üzerinden kitap kapağı, yayıncı, sayfa sayısı ve basım yılı bilgilerini canlı arayın.",
  keywords: [
    "isbn arama motoru",
    "open library kitap arama",
    "kitap kapağı bulucu",
    "kitap detayları sorgulama",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/book-isbn-finder",
  },
  openGraph: {
    title: "Açık Kitaplık & ISBN Arama Motoru — EverythingHub",
    description: "20M+ kitap, yazar ve ISBN kütüphanesini canlı keşfedin.",
    url: "https://www.everythinghub.com.tr/tools/book-isbn-finder",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Açık Kitaplık & ISBN Arama Motoru — EverythingHub",
    description: "20M+ kitap, yazar ve ISBN kütüphanesini canlı keşfedin.",
  },
};

export default function BookISBNFinderPage() {
  return <BookISBNFinderClient />;
}
