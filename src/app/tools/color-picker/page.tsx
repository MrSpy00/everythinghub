import type { Metadata } from "next";
import { ColorPickerClient } from "./ColorPickerClient";

export const metadata: Metadata = {
  title: "Renk Paleti & Resimden Renk Çıkarıcı",
  description:
    "Yüklediğiniz görsellerden ana renk paletini çıkarın, HEX ve RGB değerlerini kopyalayın.",
  keywords: ["renk paleti", "color picker", "resimden renk alma", "hex", "rgb", "dominant colors"],
};

export default function ColorPickerPage() {
  return <ColorPickerClient />;
}
