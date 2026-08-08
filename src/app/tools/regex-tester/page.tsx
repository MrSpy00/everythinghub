import type { Metadata } from "next";
import { RegexTesterClient } from "./RegexTesterClient";

export const metadata: Metadata = {
  title: "İnteraktif Regex Tester — Regular Expression Live Studio",
  description:
    "Düzenli ifadeleri (Regular Expressions) canlı olarak test edin, eşleşmeleri ve grupları vurgulayın. Regex bayrak (flag) yönetimi ve canlı test desteği.",
  keywords: [
    "regex tester online",
    "regular expressions test",
    "düzenli ifade test aracı",
    "regex pattern test",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/regex-tester",
  },
  openGraph: {
    title: "İnteraktif Regex Tester — EverythingHub",
    description: "Düzenli ifadelerinizi canlı olarak test edin, eşleşmeleri ve yakalama gruplarını görün.",
    url: "https://www.everythinghub.com.tr/tools/regex-tester",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İnteraktif Regex Tester — EverythingHub",
    description: "Düzenli ifadelerinizi canlı olarak test edin, eşleşmeleri ve yakalama gruplarını görün.",
  },
};

export default function RegexTesterPage() {
  return <RegexTesterClient />;
}
