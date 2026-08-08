import type { Metadata } from "next";
import { YTThumbnailClient } from "./YTThumbnailClient";

export const metadata: Metadata = {
  title: "YouTube Thumbnail İndirici",
  description:
    "YouTube videolarının HD, Full HD ve 4K kapak resimlerini ücretsiz indirin ve önizleyin.",
  keywords: ["youtube", "thumbnail", "kapak görseli", "hd indir", "4k"],
};

export default function YTThumbnailPage() {
  return <YTThumbnailClient />;
}
