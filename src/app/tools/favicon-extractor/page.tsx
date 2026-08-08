import type { Metadata } from "next";
import { FaviconExtractorClient } from "./FaviconExtractorClient";

export const metadata: Metadata = {
  title: "Site Favicon & Logo İndirici — High-Res Favicon Extractor",
  description:
    "Herhangi bir web sitesinin HD favicon, Apple touch icon ve SVG logosunu anında yüksek çözünürlükte çıkarın ve indirin.",
  keywords: [
    "favicon indirici",
    "website logo extractor",
    "favicon grabber online",
    "hd favicon downloader",
    "apple touch icon extractor",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/favicon-extractor",
  },
  openGraph: {
    title: "Site Favicon & Logo İndirici — EverythingHub",
    description: "Web sitelerinin HD favicon ve logolarını anında çıkarın ve indirin.",
    url: "https://www.everythinghub.com.tr/tools/favicon-extractor",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Favicon & Logo İndirici — EverythingHub",
    description: "Web sitelerinin HD favicon ve logolarını anında çıkarın ve indirin.",
  },
};

export default function FaviconExtractorPage() {
  return <FaviconExtractorClient />;
}
