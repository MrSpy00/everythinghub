import type { Metadata } from "next";
import { UnitConverterClient } from "./UnitConverterClient";

export const metadata: Metadata = {
  title: "Çoklu Birim Dönüştürücü",
  description: "Uzunluk, kütle, sıcaklık, veri depolama ve hız birimlerini anında dönüştürün.",
  keywords: ["birim dönüştürücü", "unit converter", "metre mil", "kg lbs", "celsius fahrenheit"],
};

export default function UnitConverterPage() {
  return <UnitConverterClient />;
}
