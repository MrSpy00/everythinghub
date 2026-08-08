import type { Metadata } from "next";
import SpotifyPlaylistClient from "./SpotifyPlaylistClient";

export const metadata: Metadata = {
  title: "Spotify Playlist Analizör — Sonic DNA & Bot Control Studio",
  description:
    "Spotify playlist süresini, audio feature sonic radarını, bot tespiti ve kalite skorunu, tür galaksisini, BPM/Key çarkını ve HD kapak stüdyosunu ücretsiz analiz edin.",
};

export default function SpotifyPlaylistAnalyzerPage() {
  return <SpotifyPlaylistClient />;
}
