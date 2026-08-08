import type { Metadata } from "next";
import { BPMTapperClient } from "./BPMTapperClient";

export const metadata: Metadata = {
  title: "Hassas BPM Tapper & Akıllı Metronom — Müzik & Ritim Stüdyosu",
  description:
    "Klavyeden veya dokunarak anlık BPM hesaplayın, tutarlılık sapmasını görün ve Web Audio milisaniye zamanlayıcılı metronom ile ritim tutun.",
  keywords: [
    "bpm tapper",
    "tempo hesaplayıcı",
    "online metronom",
    "bpm sayacı",
    "müzik ritim stüdyosu",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/bpm-tapper",
  },
  openGraph: {
    title: "Hassas BPM Tapper & Akıllı Metronom — EverythingHub",
    description: "Milisaniye hassasiyetli BPM sayacı ve Web Audio destekli akıllı metronom.",
    url: "https://www.everythinghub.com.tr/tools/bpm-tapper",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hassas BPM Tapper & Akıllı Metronom — EverythingHub",
    description: "Milisaniye hassasiyetli BPM sayacı ve Web Audio destekli akıllı metronom.",
  },
};

export default function BPMTapperPage() {
  return <BPMTapperClient />;
}
