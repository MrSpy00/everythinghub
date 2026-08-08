import type { Metadata } from "next";
import { ImageCompressorClient } from "./ImageCompressorClient";

export const metadata: Metadata = {
  title: "Görsel Sıkıştırıcı — Kayıpsız Görsel & Fotoğraf Boyutu Düşürme",
  description:
    "Görsellerinizi kalite kaybı olmadan tarayıcınızda %90'a varan oranda sıkıştırın ve WebP formatında indirin. %100 gizli ve tarayıcı taraflı çalışır.",
  keywords: [
    "görsel sıkıştırma",
    "image compressor online",
    "fotoğraf boyutu küçültme",
    "png sıkıştırma",
    "jpeg sıkıştırma",
    "webp sıkıştırma",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/image-compressor",
  },
  openGraph: {
    title: "Görsel Sıkıştırıcı — EverythingHub",
    description: "Görsellerinizi kalite kaybı olmadan tarayıcınızda %90'a varan oranda sıkıştırın.",
    url: "https://www.everythinghub.com.tr/tools/image-compressor",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Görsel Sıkıştırıcı — EverythingHub",
    description: "Görsellerinizi kalite kaybı olmadan tarayıcınızda %90'a varan oranda sıkıştırın.",
  },
};

export default function ImageCompressorPage() {
  return <ImageCompressorClient />;
}
