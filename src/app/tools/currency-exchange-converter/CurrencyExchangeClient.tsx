"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  DollarSign,
  Globe,
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
];

export function CurrencyExchangeClient() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("TRY");
  const [rates, setRates] = useState<RatesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchRates = async () => {
    setLoading(true);
    try {
      // 1. Fetch Frankfurter FX rates base USD
      const res = await fetch("https://api.frankfurter.app/latest?from=USD");
      const data = await res.json();
      const loadedRates: RatesMap = { USD: 1, ...data.rates };

      // 2. Fetch fallback/extra crypto rates if possible
      try {
        const cryptoRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
        const cryptoData = await cryptoRes.json();
        if (cryptoData.bitcoin?.usd) loadedRates.BTC = 1 / cryptoData.bitcoin.usd;
        if (cryptoData.ethereum?.usd) loadedRates.ETH = 1 / cryptoData.ethereum.usd;
      } catch (err) {
        console.warn("Crypto rates fallback", err);
      }

      setRates(loadedRates);
      setLastUpdated(new Date().toLocaleTimeString("tr-TR"));
      toast.success("Güncel kurlar yüklendi!");
    } catch (err) {
      console.error(err);
      toast.error("Döviz kurları alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const calculateConvertedAmount = (): number => {
    if (!rates[fromCurr] || !rates[toCurr]) return 0;
    // convert from base (USD)
    const amountInUSD = amount / rates[fromCurr];
    return amountInUSD * rates[toCurr];
  };

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const convertedValue = calculateConvertedAmount();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <Coins className="h-3.5 w-3.5 text-emerald-400" />
          <span>Zero-Auth Live Rates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Canlı Döviz & Kripto Dönüştürücü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          150+ itibari para birimi ve kripto varlık arasında canlı piyasa verileriyle anında dönüşüm hesaplayın.
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl mb-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Anlık Hesaplama Stüdyosu</h2>
          </div>
          {lastUpdated && (
            <span className="text-xs text-zinc-500">Son Güncelleme: {lastUpdated}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* Input Amount & From */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Tutar & Kaynak Birim</label>
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

          {/* Result & To */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Dönüştürülen Tutar & Hedef</label>
            <div className="flex rounded-xl border border-emerald-500/30 bg-emerald-500/10 overflow-hidden">
              <div className="w-full px-4 py-3 text-lg font-black text-emerald-300 flex items-center">
                {loading ? "Hesaplamada..." : convertedValue.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-[#181920] px-3 py-3 text-xs font-bold text-emerald-300 border-l border-emerald-500/30 focus:outline-none cursor-pointer"
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
      </div>

      {/* Quick Rate Matrix */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" /> Popüler Çapraz Kurlar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { from: "USD", to: "TRY", name: "1 USD / TRY" },
            { from: "EUR", to: "TRY", name: "1 EUR / TRY" },
            { from: "GBP", to: "TRY", name: "1 GBP / TRY" },
          ].map((item) => {
            const val = (1 / (rates[item.from] || 1)) * (rates[item.to] || 1);
            return (
              <div
                key={item.name}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex justify-between items-center"
              >
                <span className="text-xs font-bold text-zinc-300">{item.name}</span>
                <span className="text-sm font-mono font-extrabold text-emerald-400">
                  {loading ? "..." : `${val.toFixed(4)} ₺`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
