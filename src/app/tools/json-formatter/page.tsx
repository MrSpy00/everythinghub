import type { Metadata } from "next";
import { JSONFormatterClient } from "./JSONFormatterClient";

export const metadata: Metadata = {
  title: "JSON Formatlayıcı & Validator — Beautify & Minify Studio",
  description:
    "JSON verisini anında formatlayın, sözdizimi hatalarını yakalayın, ağaç görünümünde inceleyin ve minify/beautify edin.",
  keywords: [
    "json formatlayıcı",
    "json validator online",
    "json beautifier",
    "json minify",
    "developer tools online",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/json-formatter",
  },
  openGraph: {
    title: "JSON Formatlayıcı & Validator — EverythingHub",
    description: "JSON verilerinizi anında doğrulayın, güzelleştirin (beautify) ve küçültün (minify).",
    url: "https://www.everythinghub.com.tr/tools/json-formatter",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatlayıcı & Validator — EverythingHub",
    description: "JSON verilerinizi anında doğrulayın, güzelleştirin (beautify) ve küçültün (minify).",
  },
};

export default function JSONFormatterPage() {
  return <JSONFormatterClient />;
}
