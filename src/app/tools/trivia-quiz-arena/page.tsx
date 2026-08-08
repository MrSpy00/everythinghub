import type { Metadata } from "next";
import { TriviaQuizClient } from "./TriviaQuizClient";

export const metadata: Metadata = {
  title: "İnteraktif Bilgi Yarışması & Trivia Arena — Open Trivia Studio",
  description:
    "Bilim, teknoloji, tarih ve genel kültür alanlarında binlerce soruyla bilginizi canlı test edin. İnteraktif skor ve kategori filtreli trivia arenası.",
  keywords: [
    "bilgi yarışması online",
    "trivia quiz oyunu",
    "open trivia db",
    "genel kültür testi",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/trivia-quiz-arena",
  },
  openGraph: {
    title: "İnteraktif Bilgi Yarışması & Trivia Arena — EverythingHub",
    description: "24 kategoride genel kültür, bilim ve teknoloji bilgi yarışması.",
    url: "https://www.everythinghub.com.tr/tools/trivia-quiz-arena",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İnteraktif Bilgi Yarışması & Trivia Arena — EverythingHub",
    description: "24 kategoride genel kültür, bilim ve teknoloji bilgi yarışması.",
  },
};

export default function TriviaQuizPage() {
  return <TriviaQuizClient />;
}
