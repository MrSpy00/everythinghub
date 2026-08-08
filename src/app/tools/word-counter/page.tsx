import type { Metadata } from "next";
import { WordCounterClient } from "./WordCounterClient";

export const metadata: Metadata = {
  title: "Kelime ve Metin Sayacı",
  description:
    "Kelime, karakter, cümle, paragraf ve tahmini okuma süresini anlık hesaplayın.",
  keywords: ["kelime sayacı", "word counter", "karakter sayacı", "okuma süresi"],
};

export default function WordCounterPage() {
  return <WordCounterClient />;
}
