import type { Metadata } from "next";
import { YTTimestampClient } from "./YTTimestampClient";

export const metadata: Metadata = {
  title: "YouTube Zaman Damgası Üretici",
  description:
    "Videolar için özel başlama süreli YouTube bağlantıları ve zaman damgası listeleri oluşturun.",
  keywords: ["youtube", "timestamp", "zaman damgası", "link üretici", "dakika saniye"],
};

export default function YTTimestampPage() {
  return <YTTimestampClient />;
}
