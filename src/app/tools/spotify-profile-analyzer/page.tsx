import type { Metadata } from "next";
import SpotifyProfileClient from "./SpotifyProfileClient";

export const metadata: Metadata = {
  title: "Spotify Profil & Sanatçı Analizör — Curator & Discography Studio",
  description:
    "Spotify kullanıcı, küratör ve sanatçı profillerini inceleyin. Takipçi gücünü, halka açık listelerini, diskografisini, en popüler şarkılarını ve HD avatarlarını ücretsiz indirin.",
  keywords: [
    "spotify profil analizör",
    "spotify artist analyzer",
    "spotify curator analyzer",
    "spotify profil resmi indirici",
    "spotify diskografi analizi",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/spotify-profile-analyzer",
  },
  openGraph: {
    title: "Spotify Profil & Sanatçı Analizör — EverythingHub",
    description: "Spotify küratör ve sanatçı profillerini, takipçi gücünü ve diskografisini ücretsiz analiz edin.",
    url: "https://www.everythinghub.com.tr/tools/spotify-profile-analyzer",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotify Profil & Sanatçı Analizör — EverythingHub",
    description: "Spotify küratör ve sanatçı profillerini, takipçi gücünü ve diskografisini ücretsiz analiz edin.",
  },
};

export default function SpotifyProfileAnalyzerPage() {
  return <SpotifyProfileClient />;
}
