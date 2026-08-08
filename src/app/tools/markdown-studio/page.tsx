import type { Metadata } from "next";
import { MarkdownStudioClient } from "./MarkdownStudioClient";

export const metadata: Metadata = {
  title: "Markdown Studio — Canlı Önizleme & Editör",
  description:
    "Markdown belgelerinizi canlı önizleyin, kelime/okuma süresi metriklerini görün, HTML veya .md dosyası olarak anında indirin.",
  keywords: [
    "markdown editör",
    "markdown online preview",
    "markdown canlı önizleme",
    "markdown to html converter",
    "markdown studio",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/markdown-studio",
  },
  openGraph: {
    title: "Markdown Studio — EverythingHub",
    description: "Markdown belgelerinizi canlı önizleyin ve anında dönüştürün.",
    url: "https://www.everythinghub.com.tr/tools/markdown-studio",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Studio — EverythingHub",
    description: "Markdown belgelerinizi canlı önizleyin ve anında dönüştürün.",
  },
};

export default function MarkdownStudioPage() {
  return <MarkdownStudioClient />;
}
