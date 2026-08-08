import type { Metadata } from "next";
import { JSONFormatterClient } from "./JSONFormatterClient";

export const metadata: Metadata = {
  title: "JSON Formatlayıcı & Validator",
  description:
    "JSON verisini anında formatlayın, sözdizimi hatalarını yakalayın ve minify/beautify edin.",
  keywords: ["json formatlayıcı", "json validator", "json beautifier", "json minify", "developer tools"],
};

export default function JSONFormatterPage() {
  return <JSONFormatterClient />;
}
