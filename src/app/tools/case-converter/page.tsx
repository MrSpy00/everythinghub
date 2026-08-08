import type { Metadata } from "next";
import { CaseConverterClient } from "./CaseConverterClient";

export const metadata: Metadata = {
  title: "Metin Kasa Dönüştürücü",
  description:
    "camelCase, snake_case, kebab-case, Title Case, UPPERCASE ve lowercase dönüşümlerini yapın.",
  keywords: ["case converter", "camelcase", "snakecase", "kebab-case", "title case"],
};

export default function CaseConverterPage() {
  return <CaseConverterClient />;
}
