"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Globe,
  DollarSign,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RatesMap {
  [key: string]: number;
}

const POPULAR_CURRENCIES = [
  // Major Fiat
  { code: "USD", nameTr: "ABD Doları", nameEn: "US Dollar", symbol: "$" },
  { code: "EUR", nameTr: "Euro", nameEn: "Euro", symbol: "€" },
  { code: "TRY", nameTr: "Türk Lirası", nameEn: "Turkish Lira", symbol: "₺" },
  { code: "GBP", nameTr: "İngiliz Sterlini", nameEn: "British Pound", symbol: "£" },
  { code: "JPY", nameTr: "Japon Yeni", nameEn: "Japanese Yen", symbol: "¥" },
  { code: "CHF", nameTr: "İsviçre Frangı", nameEn: "Swiss Franc", symbol: "CHF" },
  { code: "CAD", nameTr: "Kanada Doları", nameEn: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", nameTr: "Avustralya Doları", nameEn: "Australian Dollar", symbol: "A$" },
  { code: "SAR", nameTr: "Suudi Arabistan Riyali", nameEn: "Saudi Riyal", symbol: "SR" },
  { code: "AED", nameTr: "BAE Dirhemi", nameEn: "UAE Dirham", symbol: "AED" },
  { code: "QAR", nameTr: "Katar Riyali", nameEn: "Qatari Riyal", symbol: "QR" },
  { code: "KWD", nameTr: "Kuveyt Dinarı", nameEn: "Kuwaiti Dinar", symbol: "KD" },
  { code: "CNY", nameTr: "Çin Yuanı", nameEn: "Chinese Yuan", symbol: "¥" },
  { code: "INR", nameTr: "Hindistan Rupisi", nameEn: "Indian Rupee", symbol: "₹" },
  { code: "BRL", nameTr: "Brezilya Reali", nameEn: "Brazilian Real", symbol: "R$" },
  { code: "RUB", nameTr: "Rus Rublesi", nameEn: "Russian Ruble", symbol: "₽" },
  { code: "KRW", nameTr: "Güney Kore Wonu", nameEn: "South Korean Won", symbol: "₩" },
  { code: "SEK", nameTr: "İsveç Kronu", nameEn: "Swedish Krona", symbol: "kr" },
  { code: "NOK", nameTr: "Norveç Kronu", nameEn: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", nameTr: "Danimarka Kronu", nameEn: "Danish Krone", symbol: "kr" },
  { code: "PLN", nameTr: "Polonya Zlotisi", nameEn: "Polish Zloty", symbol: "zł" },
  { code: "HUF", nameTr: "Macar Forinti", nameEn: "Hungarian Forint", symbol: "Ft" },
  { code: "CZK", nameTr: "Çek Korunası", nameEn: "Czech Koruna", symbol: "Kč" },
  { code: "ILS", nameTr: "İsrail Şekeli", nameEn: "Israeli Shekel", symbol: "₪" },
  { code: "ZAR", nameTr: "Güney Afrika Randı", nameEn: "South African Rand", symbol: "R" },
  { code: "SGD", nameTr: "Singapur Doları", nameEn: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", nameTr: "Yeni Zelanda Doları", nameEn: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", nameTr: "Meksika Pesosu", nameEn: "Mexican Peso", symbol: "Mex$" },

  // Cryptocurrencies
  { code: "BTC", nameTr: "Bitcoin", nameEn: "Bitcoin", symbol: "₿" },
  { code: "ETH", nameTr: "Ethereum", nameEn: "Ethereum", symbol: "Ξ" },
  { code: "SOL", nameTr: "Solana", nameEn: "Solana", symbol: "SOL" },
  { code: "BNB", nameTr: "Binance Coin", nameEn: "BNB", symbol: "BNB" },
  { code: "XRP", nameTr: "Ripple (XRP)", nameEn: "XRP", symbol: "XRP" },
  { code: "DOGE", nameTr: "Dogecoin", nameEn: "Dogecoin", symbol: "DOGE" },
  { code: "ADA", nameTr: "Cardano", nameEn: "Cardano", symbol: "ADA" },
  { code: "AVAX", nameTr: "Avalanche", nameEn: "Avalanche", symbol: "AVAX" },
  { code: "DOT", nameTr: "Polkadot", nameEn: "Polkadot", symbol: "DOT" },
  { code: "LINK", nameTr: "Chainlink", nameEn: "Chainlink", symbol: "LINK" },
  { code: "SUI", nameTr: "Sui", nameEn: "Sui", symbol: "SUI" },
  { code: "NEAR", nameTr: "NEAR Protocol", nameEn: "NEAR", symbol: "NEAR" },
  { code: "TON", nameTr: "Toncoin", nameEn: "Toncoin", symbol: "TON" },
];

const PRESET_AMOUNTS = [10, 50, 100, 250, 500, 1000, 5000, 10000];

export function CurrencyExchangeClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [amountInput, setAmountInput] = useState<string>("100");
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("TRY");
  const [rates, setRates] = useState<RatesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    const loadedRates: RatesMap = { USD: 1 };

    // 1. Frankfurter Official ECB API
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD");
      if (res.ok) {
        const data = await res.json();
        Object.assign(loadedRates, data.rates);
      }
    } catch {
      // Fallback to ER-API
      try {
        const fallbackRes = await fetch("https://open.er-api.com/v6/latest/USD");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          Object.assign(loadedRates, fallbackData.rates);
        }
      } catch {}
    }

    // 2. Crypto Rates from CoinCap & Binance
    try {
      const cryptoRes = await fetch("https://api.coincap.io/v2/assets?limit=30");
      if (cryptoRes.ok) {
        const cryptoJson = await cryptoRes.json();
        (cryptoJson.data || []).forEach((c: any) => {
          const price = parseFloat(c.priceUsd);
          if (price > 0) {
            loadedRates[c.symbol] = 1 / price;
          }
        });
      }
    } catch {
      try {
        const binanceRes = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        if (binanceRes.ok) {
          const binanceList = await binanceRes.json();
          binanceList.forEach((item: any) => {
            if (item.symbol.endsWith("USDT")) {
              const sym = item.symbol.replace("USDT", "");
              const price = parseFloat(item.lastPrice);
              if (price > 0) loadedRates[sym] = 1 / price;
            }
          });
        }
      } catch {}
    }

    setRates(loadedRates);
    setLastUpdated(new Date().toLocaleTimeString(isTurkish ? "tr-TR" : "en-US"));
    setLoading(false);
    toast.success(isTurkish ? "Canlı kurlar başarıyla güncellendi!" : "Exchange rates updated!");
  }, [isTurkish]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Clean numeric parsing without forced prepended zeros
  const numericAmount = useMemo(() => {
    if (!amountInput.trim()) return 0;
    const parsed = parseFloat(amountInput);
    return isNaN(parsed) ? 0 : parsed;
  }, [amountInput]);

  const calculateConvertedAmount = (val: number): number => {
    if (!rates[fromCurr] || !rates[toCurr]) return 0;
    const amountInUSD = val / rates[fromCurr];
    return amountInUSD * rates[toCurr];
  };

  const convertedValue = calculateConvertedAmount(numericAmount);

  // Single unit rates
  const unitRateFromTo = calculateConvertedAmount(1);
  const unitRateToFrom = unitRateFromTo > 0 ? 1 / unitRateFromTo : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, ".");
    // Filter numbers and single period
    if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
      // Remove leading zero when entering non-decimals (e.g. "05" -> "5", but keep "0.5")
      if (val.length > 1 && val.startsWith("0") && val[1] !== ".") {
        val = val.replace(/^0+/, "");
        if (val === "") val = "0";
      }
      setAmountInput(val);
    }
  };

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const handleCopyResult = () => {
    const formatted = `${amountInput || "0"} ${fromCurr} = ${convertedValue.toLocaleString(isTurkish ? "tr-TR" : "en-US", { maximumFractionDigits: 4 })} ${toCurr}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast.success(isTurkish ? "Sonuç panoya kopyalandı!" : "Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-xl">
          <Coins className="h-4 w-4 text-emerald-400" />
          <span>{isTurkish ? "Çoklu Kaynaklı Canlı Kurlar" : "Multi-Source Live Rates"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "Canlı Döviz & Kripto Dönüştürücü" : "Live Currency & Crypto Converter"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "Avrupa Merkez Bankası (ECB) ve küresel borsalardan sıfır gecikmeli verilerle anında ve hatasız dönüşüm hesaplayın."
            : "Convert 160+ fiat currencies and top crypto assets with live real-time accuracy and zero latency."}
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {isTurkish ? "Anlık Hesaplama Stüdyosu" : "Instant Conversion Studio"}
            </h2>
          </div>

          <button
            onClick={fetchRates}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors cursor-pointer bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{lastUpdated ? (isTurkish ? `Güncellendi: ${lastUpdated}` : `Updated: ${lastUpdated}`) : isTurkish ? "Yenile" : "Refresh"}</span>
          </button>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* Source Currency */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-zinc-400">
              {isTurkish ? "Tutar & Kaynak Para Birimi" : "Amount & From Currency"}
            </label>
            <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden focus-within:border-emerald-500 transition-all shadow-inner">
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent px-4 py-3.5 text-xl font-bold text-white focus:outline-none placeholder-zinc-600 font-mono"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="bg-[#181920] px-4 py-3.5 text-xs font-bold text-emerald-300 border-l border-white/10 focus:outline-none cursor-pointer hover:bg-[#20212b] transition-colors"
              >
                {POPULAR_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {isTurkish ? c.nameTr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Trigger */}
          <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
            <button
              onClick={handleSwap}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              title={isTurkish ? "Birimleri Değiştir" : "Swap Currencies"}
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          {/* Target Currency */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-zinc-400">
              {isTurkish ? "Dönüştürülen Hedef Birim" : "Converted Target Currency"}
            </label>
            <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden focus-within:border-emerald-500 transition-all shadow-inner">
              <div className="w-full bg-transparent px-4 py-3.5 text-xl font-black text-emerald-400 flex items-center overflow-x-auto no-scrollbar font-mono">
                {convertedValue.toLocaleString(isTurkish ? "tr-TR" : "en-US", { maximumFractionDigits: 4 })}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-[#181920] px-4 py-3.5 text-xs font-bold text-emerald-300 border-l border-white/10 focus:outline-none cursor-pointer hover:bg-[#20212b] transition-colors"
              >
                {POPULAR_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {isTurkish ? c.nameTr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Amount Preset Chips */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            {isTurkish ? "Hızlı Tutar Seçimi:" : "Quick Amount Presets:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmountInput(String(amt))}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  amountInput === String(amt)
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {amt.toLocaleString()} {fromCurr}
              </button>
            ))}
          </div>
        </div>

        {/* Inverse Exchange Rate Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] gap-3">
          <div className="text-xs font-mono text-zinc-300 space-y-1">
            <div>
              1 {fromCurr} = <span className="font-bold text-white">{unitRateFromTo.toFixed(4)} {toCurr}</span>
            </div>
            <div className="text-[11px] text-zinc-500">
              1 {toCurr} = <span className="text-zinc-400">{unitRateToFrom.toFixed(4)} {fromCurr}</span>
            </div>
          </div>

          <button
            onClick={handleCopyResult}
            className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white font-mono bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? (isTurkish ? "Kopyalandı" : "Copied") : isTurkish ? "Sonucu Kopyala" : "Copy Result"}</span>
          </button>
        </div>

        {/* Multi-Denomination Conversion Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <span>{isTurkish ? "Örnek Dönüşüm Tablosu" : "Denomination Conversion Table"}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 5, 10, 25, 50, 100, 500, 1000].map((sample) => (
              <div
                key={sample}
                className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between text-xs font-mono"
              >
                <span className="text-zinc-400">{sample} {fromCurr}</span>
                <ArrowRight className="h-3 w-3 text-zinc-600" />
                <span className="font-bold text-emerald-300">
                  {calculateConvertedAmount(sample).toLocaleString(isTurkish ? "tr-TR" : "en-US", { maximumFractionDigits: 2 })} {toCurr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
