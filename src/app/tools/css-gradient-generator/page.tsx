import type { Metadata } from "next";
import { GradientClient } from "./GradientClient";

export const metadata: Metadata = {
  title: "CSS & Tailwind Gradient Üretici — Degrade Kod Oluşturucu",
  description:
    "Çok renkli doğrusal (linear) ve dairesel (radial) CSS & Tailwind CSS gradient kodları oluşturun, canlı önizleyin ve kopyalayın.",
  keywords: [
    "css gradient generator",
    "tailwind gradient üretici",
    "css degrade oluşturucu",
    "mesh gradient generator",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/css-gradient-generator",
  },
  openGraph: {
    title: "CSS & Tailwind Gradient Üretici — EverythingHub",
    description: "Modern CSS ve Tailwind CSS gradient kodları oluşturun ve tek tıkla kopyalayın.",
    url: "https://www.everythinghub.com.tr/tools/css-gradient-generator",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS & Tailwind Gradient Üretici — EverythingHub",
    description: "Modern CSS ve Tailwind CSS gradient kodları oluşturun ve tek tıkla kopyalayın.",
  },
};

export default function GradientPage() {
  return <GradientClient />;
}
