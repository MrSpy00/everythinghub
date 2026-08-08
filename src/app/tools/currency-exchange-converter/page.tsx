import type { Metadata } from "next";
import { CurrencyExchangeClient } from "./CurrencyExchangeClient";

export const metadata: Metadata = {
  title: "Canlı Canlı Döviz & Kripto Dönüştürücü — Live FX & Crypto Calculator",
  description:
    "150+ itibarî para birimi ve popüler kripto varlıklar arasında canlı döviz kurlarıyla anında hesaplama ve dönüşüm yapın.",
  keywords: [
    "döviz dönüştürücü",
    "canlı döviz kurları",
    "dolar tl çevirici",
    "euro tl dönüştürücü",
    "kripto para hesaplama",
    "currency converter online",
    "everythinghub",
    "aegisSoft",
    "MrSpy00",
    "everythinghub.com.tr",
    "everythinghub.info",
  ],
  alternates: {
    canonical: "https://www.everythinghub.com.tr/tools/currency-exchange-converter",
  },
  openGraph: {
    title: "Canlı Canlı Döviz & Kripto Dönüştürücü — EverythingHub",
    description: "150+ para birimi ve kripto varlık arasında canlı dönüşüm yapın.",
    url: "https://www.everythinghub.com.tr/tools/currency-exchange-converter",
    siteName: "EverythingHub",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canlı Canlı Döviz & Kripto Dönüştürücü — EverythingHub",
    description: "150+ para birimi ve kripto varlık arasında canlı dönüşüm yapın.",
  },
};

export default function CurrencyExchangePage() {
  return <CurrencyExchangeClient />;
}
