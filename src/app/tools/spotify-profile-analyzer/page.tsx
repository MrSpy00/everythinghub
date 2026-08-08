import type { Metadata } from "next";
import SpotifyProfileClient from "./SpotifyProfileClient";

export const metadata: Metadata = {
  title: "Spotify Profil & Sanatçı Analizör — Curator & Discography Studio",
  description:
    "Spotify kullanıcı, küratör ve sanatçı profillerini inceleyin. Takipçi gücünü, halka açık listelerini, diskografisini, en popüler şarkılarını ve HD avatarlarını ücretsiz indirin.",
};

export default function SpotifyProfileAnalyzerPage() {
  return <SpotifyProfileClient />;
}
