import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// In-memory cache for ultra-fast response times (revalidates every 120s)
let cachedData: { rates: Record<string, number>; timestamp: number; source: string } | null = null;
const CACHE_TTL_MS = 120 * 1000;

const DEFAULT_USD_RATES: Record<string, number> = {
  USD: 1,
  TRY: 47.85,
  EUR: 0.925,
  GBP: 0.782,
  CHF: 0.865,
  JPY: 154.5,
  CAD: 1.365,
  AUD: 1.512,
  SAR: 3.75,
  AED: 3.67,
  QAR: 3.64,
  KWD: 0.307,
  CNY: 7.23,
  AZN: 1.70,
  KZT: 485.0,
  RUB: 91.5,
  INR: 83.9,
  BRL: 5.45,
  KRW: 1370.0,
  SEK: 10.45,
  NOK: 10.75,
  DKK: 6.90,
  PLN: 3.95,
  SGD: 1.34,
  NZD: 1.64,
};

export async function GET(request: NextRequest) {
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      rates: cachedData.rates,
      lastUpdated: new Date(cachedData.timestamp).toISOString(),
      source: cachedData.source + " (cached)",
    });
  }

  const rates: Record<string, number> = { ...DEFAULT_USD_RATES };
  let primarySource = "Frankfurter + CoinGecko";

  // 1. Fetch Fiat Currency Rates
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        Object.assign(rates, data.rates);
      }
    } else {
      throw new Error("Frankfurter non-200 response");
    }
  } catch {
    try {
      const erRes = await fetch("https://open.er-api.com/v6/latest/USD", {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      });
      if (erRes.ok) {
        const erData = await erRes.json();
        if (erData.rates) {
          Object.assign(rates, erData.rates);
          primarySource = "Open-ER + CoinGecko";
        }
      }
    } catch {}
  }

  // 2. Fetch Gold & Precious Metal Rates (Spot Ounce Prices)
  let ounceGoldUsd = 2750; // Current spot baseline
  let ounceSilverUsd = 32.5;
  let ouncePlatUsd = 980;
  let ouncePallUsd = 1020;

  try {
    const cgGoldRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,tether-gold&vs_currencies=usd",
      { signal: AbortSignal.timeout(4000) }
    );
    if (cgGoldRes.ok) {
      const json = await cgGoldRes.json();
      const oz = json["pax-gold"]?.usd || json["tether-gold"]?.usd;
      if (oz && oz > 1500 && oz < 10000) {
        ounceGoldUsd = oz;
      }
    }
  } catch {}

  const gramGoldUsd = ounceGoldUsd / 31.1034768;
  const gramSilverUsd = ounceSilverUsd / 31.1034768;

  rates["XAU"] = 1 / ounceGoldUsd;
  rates["GRAM_ALTIN"] = 1 / gramGoldUsd;
  rates["CEYREK"] = 1 / (gramGoldUsd * 1.63);
  rates["YARIM"] = 1 / (gramGoldUsd * 3.26);
  rates["TAM"] = 1 / (gramGoldUsd * 6.52);
  rates["ATA"] = 1 / (gramGoldUsd * 6.61);

  rates["XAG"] = 1 / ounceSilverUsd;
  rates["GRAM_GUMUS"] = 1 / gramSilverUsd;
  rates["XPT"] = 1 / ouncePlatUsd;
  rates["XPD"] = 1 / ouncePallUsd;

  // 3. Fetch Top Cryptocurrencies
  try {
    const cgRes = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=40&page=1&sparkline=false",
      { signal: AbortSignal.timeout(5000) }
    );
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      (cgData || []).forEach((c: any) => {
        const sym = (c.symbol || "").toUpperCase();
        const price = parseFloat(c.current_price);
        if (sym && price > 0) {
          rates[sym] = 1 / price;
        }
      });
    } else {
      throw new Error("CoinGecko failed");
    }
  } catch {
    try {
      const binanceRes = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
        signal: AbortSignal.timeout(5000),
      });
      if (binanceRes.ok) {
        const binanceList = await binanceRes.json();
        binanceList.forEach((item: any) => {
          if (item.symbol.endsWith("USDT")) {
            const sym = item.symbol.replace("USDT", "");
            const price = parseFloat(item.lastPrice);
            if (price > 0) rates[sym] = 1 / price;
          }
        });
        primarySource += " (Binance Fallback)";
      }
    } catch {}
  }

  cachedData = {
    rates,
    timestamp: now,
    source: primarySource,
  };

  return NextResponse.json({
    success: true,
    rates,
    lastUpdated: new Date(now).toISOString(),
    source: primarySource,
  });
}
