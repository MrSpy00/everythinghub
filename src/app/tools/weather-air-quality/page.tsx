import type { Metadata } from "next";
import { WeatherAirQualityClient } from "./WeatherAirQualityClient";

export const metadata: Metadata = {
  title: "Canlı Hava Durumu & Hava Kalitesi Radarı — Open-Meteo Studio",
  description:
    "Dünya genelinde 7 günlük saatlik hava durumu, UV indeksi ve PM2.5/PM10 hava kalitesi indeksini (AQI) %100 ücretsiz ve canlı takip edin.",
  keywords: [
    "canlı hava durumu",
    "hava kalitesi aqi",
    "pm2.5 hava kirliliği",
    "uv indeksi",
    "open meteo hava durumu",
    "7 günlük hava tahmini",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/weather-air-quality",
  },
  openGraph: {
    title: "Canlı Hava Durumu & Hava Kalitesi Radarı — EverythingHub",
    description: "Saatlik sıcaklık grafikleri, yağış olasılığı ve canlı hava kalitesi analizleri.",
    url: "https://www.everythinghub.com.tr/tools/weather-air-quality",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canlı Hava Durumu & Hava Kalitesi Radarı — EverythingHub",
    description: "Saatlik sıcaklık grafikleri, yağış olasılığı ve canlı hava kalitesi analizleri.",
  },
};

export default function WeatherAirQualityPage() {
  return <WeatherAirQualityClient />;
}
