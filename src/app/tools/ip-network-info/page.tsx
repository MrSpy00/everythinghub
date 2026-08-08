import type { Metadata } from "next";
import { IPNetworkClient } from "./IPNetworkClient";

export const metadata: Metadata = {
  title: "IP, Geolocation & Ağ Latency Analizörü — Network Diagnostics Studio",
  description:
    "IP adresinizi, coğrafi konumunuzu, ISP sağlayıcınızı, TLS/HTTP protokol detaylarını ve CDN ping sürelerinizi %100 gizli ve ücretsiz analiz edin.",
  keywords: [
    "ip adresi sorgulama",
    "ip geolocation",
    "my ip address",
    "ping testi",
    "network latency test",
    "isp sorgulama",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/ip-network-info",
  },
  openGraph: {
    title: "IP, Geolocation & Ağ Latency Analizörü — EverythingHub",
    description: "IP adresi, coğrafi konum, ISP ve ağ gecikme sürelerini canlı analiz edin.",
    url: "https://www.everythinghub.com.tr/tools/ip-network-info",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP, Geolocation & Ağ Latency Analizörü — EverythingHub",
    description: "IP adresi, coğrafi konum, ISP ve ağ gecikme sürelerini canlı analiz edin.",
  },
};

export default function IPNetworkPage() {
  return <IPNetworkClient />;
}
