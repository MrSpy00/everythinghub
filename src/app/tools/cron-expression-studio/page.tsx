import type { Metadata } from "next";
import { CronStudioClient } from "./CronStudioClient";

export const metadata: Metadata = {
  title: "Cron İfadesi Üreteci & Açıklayıcı — Cron Schedule Studio",
  description:
    "Cron ifadelerini (Linux crontab) insani Türkçe açıklamalara dönüştürün, görsel olarak cron zamanlamaları üretin ve test edin.",
  keywords: [
    "cron ifadesi üreteci",
    "cron generator online",
    "crontab açıklayıcı",
    "cron zamanlayıcı",
    "cron expression parser",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/cron-expression-studio",
  },
  openGraph: {
    title: "Cron İfadesi Üreteci & Açıklayıcı — EverythingHub",
    description: "Cron ifadelerini görsel olarak oluşturun ve Türkçe insani açıklamasını görün.",
    url: "https://www.everythinghub.com.tr/tools/cron-expression-studio",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron İfadesi Üreteci & Açıklayıcı — EverythingHub",
    description: "Cron ifadelerini görsel olarak oluşturun ve Türkçe insani açıklamasını görün.",
  },
};

export default function CronStudioPage() {
  return <CronStudioClient />;
}
