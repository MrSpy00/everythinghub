import type { Metadata } from "next";
import { AegisTypingClient } from "./AegisTypingClient";

export const metadata: Metadata = {
  title: "aegisTyping — Evrensel Yazma Hızı Testi & Eğitim Stüdyosu",
  description:
    "16+ dil, 8+ mod, adaptif öğrenme, anti-hile koruması ve local & global skor tablosu ile Monkeytype seviyesinde özelleştirilebilir yazma hızı testi. Kayıt gerektirmez, 100% tarayıcı taraflı.",
  keywords: [
    "yazma testi",
    "wpm testi",
    "typing test",
    "typing speed",
    "10fastfingers",
    "monkeytype",
    "keybr",
    "türkçe yazma testi",
    "yazma hızı ölçer",
    "klavye hız testi",
    "typing tutor",
    "typing practice",
    "aegisTyping",
    "aegisSoft",
    "MrSpy00",
    "EverythingHub",
    "fast fingers",
    "fastfingers",
    "on parmak",
    "touch typing",
    "blind typing",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/aegis-typing",
  },
  openGraph: {
    title: "aegisTyping — Evrensel Yazma Hızı Testi & Eğitim Stüdyosu",
    description:
      "16+ dil, 8+ mod, adaptif öğrenme, anti-hile ve global skor tablosu. Monkeytype düzeyi özelleştirme. Kayıt gerektirmez.",
    url: "https://www.everythinghub.com.tr/tools/aegis-typing",
    siteName: "EverythingHub",
    type: "website",
    images: [
      {
        url: "https://www.everythinghub.com.tr/og-aegis-typing.png",
        width: 1200,
        height: 630,
        alt: "aegisTyping — Evrensel Yazma Hızı Testi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "aegisTyping — Evrensel Yazma Hızı Testi & Eğitim Stüdyosu",
    description:
      "16+ dil, 8+ mod, adaptif öğrenme, anti-hile koruması. Monkeytype düzeyi özelleştirme. Ücretsiz, kayıt gerekmez.",
    images: ["https://www.everythinghub.com.tr/og-aegis-typing.png"],
  },
};

export default function AegisTypingPage() {
  return <AegisTypingClient />;
}
