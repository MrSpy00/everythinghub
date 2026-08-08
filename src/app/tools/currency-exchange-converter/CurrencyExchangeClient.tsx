"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  DollarSign,
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface RatesMap {
  [key: string]: number;
}

const POPULAR_CURRENCIES = [
  { code: "USD", name: "ABD Doları", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "TRY", name: "Türk Lirası", symbol: "₺" },
  { code: "GBP", name: "İngiliz Sterlini", symbol: "£" },
  { code: "JPY", name: "Japon Yeni", symbol: "¥" },
  { code: "CHF", name: "İsviçre Frangı", symbol: "CHF" },
  { code: "CAD", name: "Kanada Doları", symbol: "CA$" },
  { code: "AUD", name: "Avustralya Doları", symbol: "A$" },
  { code: "SAR", name: "Suudi Arabistan Riyali", symbol: "SR" },
  { code: "AED", name: "BAE Dirhemi", symbol: "AED" },
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ" },
  { code: "SOL", name: "Solana", symbol: "SOL" },
];

export function CurrencyExchangeClient() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("TRY");
  const [rates, setRates] = useState<RatesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchRates = async () => {
    setLoading(true);
    const loadedRates: RatesMap = { USD: 1 };

    // 1. Try Frankfurter Official ECB API
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD");
      if (res.ok) {
        const data = await res.json();
        Object.assign(loadedRates, data.rates);
      }
    } catch {
      // 2. Fallback to Open Exchange Rates (ER-API)
      try {
        const fallbackRes = await fetch("https://open.er-api.com/v6/latest/USD");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          Object.assign(loadedRates, fallbackData.rates);
        }
      } catch {}
    }

    // 3. Fetch Live Crypto Rates (CoinCap / Binance)
    try {
      const cryptoRes = await fetch("https://api.coincap.io/v2/assets?limit=20");
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
            if (item.symbol === "BTCUSDT") loadedRates.BTC = 1 / parseFloat(item.lastPrice);
            if (item.symbol === "ETHUSDT") loadedRates.ETH = 1 / parseFloat(item.lastPrice);
            if (item.symbol === "SOLUSDT") loadedRates.SOL = 1 / parseFloat(item.lastPrice);
          });
        }
      } catch {}
    }

    setRates(loadedRates);
    setLastUpdated(new Date().toLocaleTimeString("tr-TR"));
    setLoading(false);
    toast.success("Canlı kurlar başarıyla güncellendi!");
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const calculateConvertedAmount = (): number => {
    if (!rates[fromCurr] || !rates[toCurr]) return 0;
    const amountInUSD = amount / rates[fromCurr];
    return amountInUSD * rates[toCurr];
  };

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const convertedValue = calculateConvertedAmount();

  const handleCopyResult = () => {
    navigator.clipboard.writeText(`${amount} ${fromCurr} = ${convertedValue.toLocaleString("tr-TR", { maximumFractionDigits: 4 })} ${toCurr}`);
    setCopied(true);
    toast.success("Sonuç panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <Coins className="h-3.5 w-3.5 text-emerald-400" />
          <span>Zero-Auth Multi-Source Live Rates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Canlı Döviz & Kripto Dönüştürücü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Avrupa Merkez Bankası (ECB) ve küresel kripto borsalarından anlık verilerle canlı dönüşüm hesaplayın.
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl mb-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Anlık Hesaplama Stüdyosu</h2>
          </div>
          <button
            onClick={fetchRates}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{lastUpdated ? `Güncelleme: ${lastUpdated}` : "Yenile"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* Input Amount & From */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Tutar & Kaynak Para Birimi</label>
            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden focus-within:border-emerald-500 transition-all">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent px-4 py-3 text-lg font-bold text-white focus:outline-none"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="bg-[#181920] px-3 py-3 text-xs font-bold text-emerald-300 border-l border-white/10 focus:outline-none cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-4 md:pt-6">
            <button
              onClick={handleSwap}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-md active:scale-95"
              title="Para Birimlerini Değiştir"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          {/* Target Amount & To */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Dönüştürülen Hedef Birim</label>
            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden focus-within:border-emerald-500 transition-all">
              <div className="w-full bg-transparent px-4 py-3 text-lg font-black text-emerald-400 flex items-center">
                {convertedValue.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-[#181920] px-3 py-3 text-xs font-bold text-emerald-300 border-l border-white/10 focus:outline-none cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live conversion summary banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] gap-3">
          <div className="text-xs font-mono text-zinc-300">
            1 {fromCurr} = {(convertedValue / (amount || 1)).toFixed(4)} {toCurr}
          </div>
          <button
            onClick={handleCopyResult}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Kopyalandı" : "Sonucu Kopyala"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
