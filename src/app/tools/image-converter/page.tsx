import type { Metadata } from "next";
import { ImageConverterClient } from "./ImageConverterClient";

export const metadata: Metadata = {
  title: "Görsel Format Dönüştürücü — PNG, JPG, WebP & AVIF Dönüştürme",
  description:
    "PNG, JPEG ve WebP formatları arasında anında kalite kaybı olmadan dönüştürme yapın. Sıfır sunucu yüklemesi ile %100 yerel tarayıcı dönüşümü.",
  keywords: [
    "görsel format dönüştürücü",
    "png to webp",
    "jpg to webp",
    "webp to png",
    "image converter online",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/image-converter",
  },
  openGraph: {
    title: "Görsel Format Dönüştürücü — EverythingHub",
    description: "PNG, JPEG ve WebP formatları arasında anında kalite kaybı olmadan dönüştürme yapın.",
    url: "https://www.everythinghub.com.tr/tools/image-converter",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Görsel Format Dönüştürücü — EverythingHub",
    description: "PNG, JPEG ve WebP formatları arasında anında kalite kaybı olmadan dönüştürme yapın.",
  },
};

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
