import type { Metadata } from "next";
import { YTPlaylistClient } from "./YTPlaylistClient";

export const metadata: Metadata = {
  title: "YouTube Playlist Analyzer",
  description:
    "YouTube playlist toplam süresini hesapla. Farklı hızlarda izleme sürelerini gör, thumbnail'ları indir. Login gerektirmez.",
  keywords: ["youtube", "playlist", "süre", "hesaplayıcı", "thumbnail"],
  openGraph: {
    title: "YouTube Playlist Analyzer — everythinghub",
    description:
      "Playlist süresini hesapla, farklı hızlarda izleme sürelerini gör.",
  },
};

export default function YTPlaylistPage() {
  return <YTPlaylistClient />;
}
