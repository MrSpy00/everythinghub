import type { Metadata } from "next";
import { Suspense } from "react";
import SpotifyPlaylistClient from "./SpotifyPlaylistClient";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const metadata: Metadata = {
  title: "Spotify Playlist Analizör — Sonic DNA & Bot Control Studio",
  description:
    "Spotify playlist süresini, audio feature sonic radarını, bot tespiti ve kalite skorunu, tür galaksisini, BPM/Key çarkını ve HD kapak stüdyosunu ücretsiz analiz edin.",
  keywords: [
    "spotify playlist analizör",
    "spotify bot tespiti",
    "spotify bot detector",
    "spotify playlist analyzer",
    "chosic alternatif",
    "artist tools alternatif",
    "submithub alternatif",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/spotify-playlist-analyzer",
  },
  openGraph: {
    title: "Spotify Playlist Analizör — EverythingHub",
    description: "Spotify çalma listelerinizi bot tespiti, Sonic DNA radarı ve BPM/Key analizi ile ücretsiz inceleyin.",
    url: "https://www.everythinghub.com.tr/tools/spotify-playlist-analyzer",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotify Playlist Analizör — EverythingHub",
    description: "Spotify çalma listelerinizi bot tespiti, Sonic DNA radarı ve BPM/Key analizi ile ücretsiz inceleyin.",
  },
};

export default function SpotifyPlaylistAnalyzerPage() {
  return (
    <ErrorBoundary
      fallbackTitle="Spotify Playlist Analizör Yüklenemedi"
      fallbackMessage="Çalma listesi analizi yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
    >
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <SpotifyPlaylistClient />
      </Suspense>
    </ErrorBoundary>
  );
}
