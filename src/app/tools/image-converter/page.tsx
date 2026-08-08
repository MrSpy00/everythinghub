import type { Metadata } from "next";
import { ImageConverterClient } from "./ImageConverterClient";

export const metadata: Metadata = {
  title: "Görsel Format Dönüştürücü",
  description:
    "PNG, JPEG ve WebP formatları arasında anında dönüştürme yapın.",
  keywords: ["görsel dönüştürücü", "png to webp", "jpeg to png", "format converter"],
};

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
