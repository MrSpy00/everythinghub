import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EverythingHub — Dijital Araçlar Stüdyosu",
    short_name: "EverythingHub",
    description:
      "Ultra hızlı, ücretsiz, üyeliksiz ve %100 gizli dijital araçlar stüdyosu. YouTube, Spotify, Görsel, JSON, QR Kod ve Geliştirici Araçları.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["utilities", "developer", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
