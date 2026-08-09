import type { Metadata } from "next";
import { HexColorStudioClient } from "./HexColorStudioClient";

export const metadata: Metadata = {
  title: "Kapsamlı HEX Kodu, Renk Dönüştürücü & Renk Mimarisi Stüdyosu — Hex Color Studio Pro",
  description:
    "HEX, RGB, HSL, HSV, CMYK, LAB ve OKLCH formatlarında anlık renk dönüşümü, WCAG 2.1 kontrast analizi, renk körlüğü simülatörü, renk uyumları ve Tailwind 50-950 palet mimarisi.",
  keywords: [
    "hex renk kodu",
    "renk dönüştürücü",
    "hex to rgb",
    "rgb to hsl",
    "cmyk renk dönüştürücü",
    "oklch converter",
    "wcag kontrast kontrolü",
    "renk körlüğü simülasyonu",
    "tailwind renk paleti üretici",
    "renk uyumu hesaplayıcı",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/hex-color-studio",
  },
  openGraph: {
    title: "Kapsamlı HEX Kodu & Renk Mimarisi Stüdyosu — EverythingHub",
    description:
      "HEX, RGB, HSL, CMYK, OKLCH dönüşümleri, WCAG kontrast testi, renk körlüğü simülasyonu ve Tailwind palet üretici.",
    url: "https://www.everythinghub.com.tr/tools/hex-color-studio",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kapsamlı HEX Kodu & Renk Mimarisi Stüdyosu — EverythingHub",
    description:
      "HEX, RGB, HSL, CMYK, OKLCH dönüşümleri, WCAG kontrast testi, renk körlüğü simülasyonu ve Tailwind palet üretici.",
  },
};

export default function HexColorStudioPage() {
  return <HexColorStudioClient />;
}
