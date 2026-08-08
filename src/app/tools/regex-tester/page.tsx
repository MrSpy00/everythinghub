import type { Metadata } from "next";
import { RegexTesterClient } from "./RegexTesterClient";

export const metadata: Metadata = {
  title: "İnteraktif Regex Tester",
  description:
    "Düzenli ifadeleri (Regular Expressions) canlı olarak test edin, eşleşmeleri ve grupları görün.",
  keywords: ["regex tester", "regular expressions", "pattern test", "regex online"],
};

export default function RegexTesterPage() {
  return <RegexTesterClient />;
}
