import type { Metadata } from "next";
import { ImageCompressorClient } from "./ImageCompressorClient";

export const metadata: Metadata = {
  title: "Görsel Sıkıştırıcı",
  description:
    "Görsellerinizi kalite kaybı olmadan tarayıcınızda %90'a varan oranda sıkıştırın ve boyutlandırın.",
  keywords: ["görsel sıkıştırma", "image compressor", "webp", "png", "jpeg", "boyut düşürme"],
};

export default function ImageCompressorPage() {
  return <ImageCompressorClient />;
}
