import type { Metadata } from "next";
import { ColorPickerClient } from "./ColorPickerClient";

export const metadata: Metadata = {
  title: "Renk Paleti & Resimden Renk Çıkarıcı — Color Palette Extractor",
  description:
    "Yüklediğiniz fotoğraflardan ve görsellerden öne çıkan dominant renk paletini çıkarın. HEX, RGB ve HSL renk kodlarını anında kopyalayın.",
  keywords: [
    "renk paleti çıkarıcı",
    "resimden renk alma",
    "color palette extractor",
    "hex rgb hsl renk kodu alma",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/color-picker",
  },
  openGraph: {
    title: "Renk Paleti & Resimden Renk Çıkarıcı — EverythingHub",
    description: "Görsellerden öne çıkan dominant renk paletini çıkarın ve renk kodlarını kopyalayın.",
    url: "https://www.everythinghub.com.tr/tools/color-picker",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Renk Paleti & Resimden Renk Çıkarıcı — EverythingHub",
    description: "Görsellerden öne çıkan dominant renk paletini çıkarın ve renk kodlarını kopyalayın.",
  },
};

export default function ColorPickerPage() {
  return <ColorPickerClient />;
}
