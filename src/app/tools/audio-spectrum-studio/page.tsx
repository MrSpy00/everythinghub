import type { Metadata } from "next";
import { AudioSpectrumClient } from "./AudioSpectrumClient";

export const metadata: Metadata = {
  title: "Web Audio Osiloskop & Spektrum Analizörü — Canlı Ses Stüdyosu",
  description:
    "Mikrofon veya ses dalgalarını Web Audio API ile gerçek zamanlı osiloskop ve FFT frekans spektrumu olarak analiz edin. Saf ton ve gürültü üreteci.",
  keywords: [
    "web audio osiloskop",
    "ses spektrum analizörü",
    "fft frekans analizi",
    "tone generator online",
    "white noise generator",
    "mikrofon test aracı",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/audio-spectrum-studio",
  },
  openGraph: {
    title: "Web Audio Osiloskop & Spektrum Analizörü — EverythingHub",
    description: "Canlı ses dalgalarını ve frekans dağılımlarını donanım hızlandırmalı analiz edin.",
    url: "https://www.everythinghub.com.tr/tools/audio-spectrum-studio",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Audio Osiloskop & Spektrum Analizörü — EverythingHub",
    description: "Canlı ses dalgalarını ve frekans dağılımlarını donanım hızlandırmalı analiz edin.",
  },
};

export default function AudioSpectrumPage() {
  return <AudioSpectrumClient />;
}
