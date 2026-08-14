import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ResultShareClient } from "./ResultShareClient";

export const metadata: Metadata = {
  title: "aegisTyping Sonucu — Doğrulanmış Yazma Hızı Sertifikası",
  description:
    "aegisTyping Studio üzerinde tamamlanan doğrulanmış WPM yazma hızı testi skoru. Sen de yazma hızını ve doğruluğunu ücretsiz test et.",
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/aegis-typing",
  },
  openGraph: {
    title: "aegisTyping Sonucu — Doğrulanmış Yazma Hızı Sertifikası",
    description: "aegisTyping Studio üzerinde tamamlanan doğrulanmış WPM yazma hızı testi skoru.",
    url: "https://www.everythinghub.com.tr/tools/aegis-typing",
    siteName: "EverythingHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aegisTyping Sonucu — Doğrulanmış Yazma Hızı Sertifikası",
    description: "aegisTyping Studio üzerinde tamamlanan doğrulanmış WPM yazma hızı testi skoru.",
  },
};

export default function AegisTypingResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResultShareClient />
    </Suspense>
  );
}
