"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Flame,
  Award,
  Gem,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FluidSlimeCard } from "@/components/creative/FluidSlimeCard";
import { StudioDropdown } from "@/components/shared/StudioDropdown";
import { copyToClipboard } from "@/lib/utils";

interface RatesMap {
  [key: string]: number;
}

export interface CurrencyItem {
  code: string;
  nameTr: string;
  nameEn: string;
  symbol: string;
  category: "fiat" | "metal" | "crypto";
  typeIcon?: string;
}

const ALL_CURRENCIES: CurrencyItem[] = [
  // --- PRECIOUS METALS & GOLD (Kıymetli Madenler & Altın) ---
  { code: "GRAM_ALTIN", nameTr: "Gram Altın (24 Ayar)", nameEn: "Gram Gold (24K)", symbol: "gr", category: "metal" },
  { code: "CEYREK", nameTr: "Çeyrek Altın (22 Ayar)", nameEn: "Quarter Gold", symbol: "çeyrek", category: "metal" },
  { code: "YARIM", nameTr: "Yarım Altın", nameEn: "Half Gold", symbol: "yarım", category: "metal" },
  { code: "TAM", nameTr: "Tam / Cumhuriyet Altını", nameEn: "Full Gold", symbol: "tam", category: "metal" },
  { code: "ATA", nameTr: "Ata Lira (Cumhuriyet)", nameEn: "Ata Lira", symbol: "ata", category: "metal" },
  { code: "XAU", nameTr: "Ons Altın (Troy Ounce)", nameEn: "Gold Ounce (XAU)", symbol: "oz Au", category: "metal" },
  { code: "GRAM_GUMUS", nameTr: "Gram Gümüş", nameEn: "Gram Silver", symbol: "gr Ag", category: "metal" },
  { code: "XAG", nameTr: "Ons Gümüş (Troy Ounce)", nameEn: "Silver Ounce (XAG)", symbol: "oz Ag", category: "metal" },
  { code: "XPT", nameTr: "Ons Platin", nameEn: "Platinum Ounce", symbol: "oz Pt", category: "metal" },
  { code: "XPD", nameTr: "Ons Paladyum", nameEn: "Palladium Ounce", symbol: "oz Pd", category: "metal" },

  // --- MAJOR FIAT CURRENCIES (Dünya Para Birimleri) ---
  { code: "USD", nameTr: "ABD Doları", nameEn: "US Dollar", symbol: "$", category: "fiat" },
  { code: "EUR", nameTr: "Euro", nameEn: "Euro", symbol: "€", category: "fiat" },
  { code: "TRY", nameTr: "Türk Lirası", nameEn: "Turkish Lira", symbol: "₺", category: "fiat" },
  { code: "GBP", nameTr: "İngiliz Sterlini", nameEn: "British Pound", symbol: "£", category: "fiat" },
  { code: "CHF", nameTr: "İsviçre Frangı", nameEn: "Swiss Franc", symbol: "CHF", category: "fiat" },
  { code: "JPY", nameTr: "Japon Yeni", nameEn: "Japanese Yen", symbol: "¥", category: "fiat" },
  { code: "CAD", nameTr: "Kanada Doları", nameEn: "Canadian Dollar", symbol: "CA$", category: "fiat" },
  { code: "AUD", nameTr: "Avustralya Doları", nameEn: "Australian Dollar", symbol: "A$", category: "fiat" },
  { code: "SAR", nameTr: "Suudi Arabistan Riyali", nameEn: "Saudi Riyal", symbol: "SR", category: "fiat" },
  { code: "AED", nameTr: "BAE Dirhemi", nameEn: "UAE Dirham", symbol: "AED", category: "fiat" },
  { code: "QAR", nameTr: "Katar Riyali", nameEn: "Qatari Riyal", symbol: "QR", category: "fiat" },
  { code: "KWD", nameTr: "Kuveyt Dinarı", nameEn: "Kuwaiti Dinar", symbol: "KD", category: "fiat" },
  { code: "CNY", nameTr: "Çin Yuanı", nameEn: "Chinese Yuan", symbol: "¥", category: "fiat" },
  { code: "AZN", nameTr: "Azerbaycan Manatı", nameEn: "Azerbaijani Manat", symbol: "₼", category: "fiat" },
  { code: "KZT", nameTr: "Kazakistan Tengesi", nameEn: "Kazakh Tenge", symbol: "₸", category: "fiat" },
  { code: "RUB", nameTr: "Rus Rublesi", nameEn: "Russian Ruble", symbol: "₽", category: "fiat" },
  { code: "INR", nameTr: "Hindistan Rupisi", nameEn: "Indian Rupee", symbol: "₹", category: "fiat" },
  { code: "BRL", nameTr: "Brezilya Reali", nameEn: "Brazilian Real", symbol: "R$", category: "fiat" },
  { code: "KRW", nameTr: "Güney Kore Wonu", nameEn: "South Korean Won", symbol: "₩", category: "fiat" },
  { code: "SEK", nameTr: "İsveç Kronu", nameEn: "Swedish Krona", symbol: "kr", category: "fiat" },
  { code: "NOK", nameTr: "Norveç Kronu", nameEn: "Norwegian Krone", symbol: "kr", category: "fiat" },
  { code: "DKK", nameTr: "Danimarka Kronu", nameEn: "Danish Krone", symbol: "kr", category: "fiat" },
  { code: "PLN", nameTr: "Polonya Zlotisi", nameEn: "Polish Zloty", symbol: "zł", category: "fiat" },
  { code: "SGD", nameTr: "Singapur Doları", nameEn: "Singapore Dollar", symbol: "S$", category: "fiat" },
  { code: "NZD", nameTr: "Yeni Zelanda Doları", nameEn: "New Zealand Dollar", symbol: "NZ$", category: "fiat" },

  // --- CRYPTOCURRENCIES (Kripto Varlıklar) ---
  { code: "BTC", nameTr: "Bitcoin", nameEn: "Bitcoin", symbol: "₿", category: "crypto" },
  { code: "ETH", nameTr: "Ethereum", nameEn: "Ethereum", symbol: "Ξ", category: "crypto" },
  { code: "SOL", nameTr: "Solana", nameEn: "Solana", symbol: "SOL", category: "crypto" },
  { code: "BNB", nameTr: "Binance Coin", nameEn: "BNB", symbol: "BNB", category: "crypto" },
  { code: "XRP", nameTr: "Ripple (XRP)", nameEn: "XRP", symbol: "XRP", category: "crypto" },
  { code: "DOGE", nameTr: "Dogecoin", nameEn: "Dogecoin", symbol: "DOGE", category: "crypto" },
  { code: "ADA", nameTr: "Cardano", nameEn: "Cardano", symbol: "ADA", category: "crypto" },
  { code: "AVAX", nameTr: "Avalanche", nameEn: "Avalanche", symbol: "AVAX", category: "crypto" },
  { code: "TON", nameTr: "Toncoin", nameEn: "Toncoin", symbol: "TON", category: "crypto" },
  { code: "TRX", nameTr: "TRON", nameEn: "TRON", symbol: "TRX", category: "crypto" },
  { code: "SUI", nameTr: "Sui", nameEn: "Sui", symbol: "SUI", category: "crypto" },
  { code: "LINK", nameTr: "Chainlink", nameEn: "Chainlink", symbol: "LINK", category: "crypto" },
  { code: "PEPE", nameTr: "Pepe", nameEn: "Pepe", symbol: "PEPE", category: "crypto" },
];

const PRESET_AMOUNTS = [10, 50, 100, 250, 500, 1000, 5000, 10000];

export function CurrencyExchangeClient() {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [amountInput, setAmountInput] = useState<string>("100");
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("TRY");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | "fiat" | "metal" | "crypto">("all");
  const [rates, setRates] = useState<RatesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    const loadedRates: RatesMap = { USD: 1 };

    // 1. Frankfurter ECB Official Rates
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD");
      if (res.ok) {
        const data = await res.json();
        Object.assign(loadedRates, data.rates);
      }
    } catch {
      try {
        const fallbackRes = await fetch("https://open.er-api.com/v6/latest/USD");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          Object.assign(loadedRates, fallbackData.rates);
        }
      } catch {}
    }

    // Default USD/TRY if missing
    if (!loadedRates.TRY) loadedRates.TRY = 38.5;
    if (!loadedRates.EUR) loadedRates.EUR = 0.92;
    if (!loadedRates.GBP) loadedRates.GBP = 0.78;

    // 2. Gold & Precious Metals Rates (from CoinGecko PAXG / XAUT which track 1 troy oz of Gold exactly)
    let ounceGoldUsd = 2420;
    let ounceSilverUsd = 29.5;
    let ouncePlatUsd = 980;
    let ouncePallUsd = 960;

    try {
      const goldRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,tether-gold&vs_currencies=usd");
      if (goldRes.ok) {
        const goldJson = await goldRes.json();
        const oz = goldJson["pax-gold"]?.usd || goldJson["tether-gold"]?.usd;
        if (oz && oz > 1000) ounceGoldUsd = oz;
      }
    } catch {}

    // 1 Troy Ounce = 31.1034768 grams
    const gramGoldUsd = ounceGoldUsd / 31.1034768;
    const gramSilverUsd = ounceSilverUsd / 31.1034768;

    // Relative to USD base (1 unit of currency in USD)
    // Rate in loadedRates represents: How many units of X equal 1 USD -> rate = 1 / price_in_usd
    loadedRates["XAU"] = 1 / ounceGoldUsd;
    loadedRates["GRAM_ALTIN"] = 1 / gramGoldUsd;
    loadedRates["CEYREK"] = 1 / (gramGoldUsd * 1.63);
    loadedRates["YARIM"] = 1 / (gramGoldUsd * 3.26);
    loadedRates["TAM"] = 1 / (gramGoldUsd * 6.52);
    loadedRates["ATA"] = 1 / (gramGoldUsd * 6.61);

    loadedRates["XAG"] = 1 / ounceSilverUsd;
    loadedRates["GRAM_GUMUS"] = 1 / gramSilverUsd;
    loadedRates["XPT"] = 1 / ouncePlatUsd;
    loadedRates["XPD"] = 1 / ouncePallUsd;

    // 3. Crypto Rates
    try {
      const cryptoRes = await fetch("https://api.coincap.io/v2/assets?limit=40");
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
  }, [isTurkish]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const numericAmount = useMemo(() => {
    if (!amountInput.trim()) return 0;
    const parsed = parseFloat(amountInput);
    return isNaN(parsed) ? 0 : parsed;
  }, [amountInput]);

  // Conversion Calculation
  const convertedResult = useMemo(() => {
    if (!rates[fromCurr] || !rates[toCurr] || numericAmount <= 0) return 0;
    const amountInUsd = numericAmount / rates[fromCurr];
    return amountInUsd * rates[toCurr];
  }, [rates, fromCurr, toCurr, numericAmount]);

  const singleUnitRate = useMemo(() => {
    if (!rates[fromCurr] || !rates[toCurr]) return 0;
    const oneUnitInUsd = 1 / rates[fromCurr];
    return oneUnitInUsd * rates[toCurr];
  }, [rates, fromCurr, toCurr]);

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const handleCopyResult = async () => {
    const formatted = `${numericAmount} ${fromCurr} = ${convertedResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toCurr}`;
    await copyToClipboard(formatted);
    setCopied(true);
    toast.success(isTurkish ? "Dönüşüm sonucu kopyalandı!" : "Conversion result copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCurrencies = useMemo(() => {
    if (activeCategoryFilter === "all") return ALL_CURRENCIES;
    return ALL_CURRENCIES.filter((c) => c.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Quick Watchlist items to show in live matrix
  const watchlistCodes = ["GRAM_ALTIN", "CEYREK", "XAU", "USD", "EUR", "TRY", "GBP", "BTC", "ETH", "GRAM_GUMUS"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </Link>

        <button
          onClick={() => {
            fetchRates();
            toast.success(isTurkish ? "Canlı kurlar yenilendi." : "Rates refreshed.");
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-300 hover:bg-amber-500/20 backdrop-blur-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{lastUpdated ? `${isTurkish ? "Güncel" : "Updated"}: ${lastUpdated}` : isTurkish ? "Yenile" : "Refresh"}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xl">
          <Coins className="h-3.5 w-3.5 text-amber-400" />
          <span>{isTurkish ? "Döviz, Altın & Kripto Laboratuvarı" : "Currency, Gold & Crypto Exchange"}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {isTurkish ? "Canlı Döviz, Altın & Kripto Dönüştürücü" : "Live Currency, Gold & Crypto Converter"}
        </h1>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          {isTurkish
            ? "Gram altın, çeyrek altın, ons altın, gümüş, küresel döviz kurları ve popüler kripto paralar arasında anlık canlı dönüşüm yapın."
            : "Convert live rates between Gram Gold, Quarter Gold, Silver, global fiat currencies, and top cryptocurrencies."}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
        {[
          { id: "all", label: isTurkish ? "Tümü" : "All", icon: Globe },
          { id: "metal", label: isTurkish ? "Kıymetli Maden & Altın" : "Gold & Metals", icon: Gem },
          { id: "fiat", label: isTurkish ? "Dünya Dövizleri" : "Fiat Currencies", icon: DollarSign },
          { id: "crypto", label: isTurkish ? "Kripto Paralar" : "Crypto", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategoryFilter === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg"
                  : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0d0e14]/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-6 max-w-3xl mx-auto">
        {/* Amount Input & Preset Chips */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {isTurkish ? "Dönüştürülecek Miktar" : "Amount to Convert"}
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="100"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-2xl sm:text-3xl font-mono font-black text-white placeholder-zinc-600 focus:border-amber-500/50 focus:bg-white/[0.08] focus:outline-none transition-all"
            />
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_AMOUNTS.map((p) => (
              <button
                key={p}
                onClick={() => setAmountInput(String(p))}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] font-mono font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-amber-500/30 transition-all cursor-pointer"
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Selectors & Swap */}
        <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3">
          {/* FROM CURRENCY */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase">
              {isTurkish ? "Kaynak Varlık (Verilen)" : "From"}
            </label>
            <StudioDropdown
              value={fromCurr}
              onChange={(v) => setFromCurr(v)}
              options={filteredCurrencies.map((c) => ({
                value: c.code,
                label: `${c.code} - ${isTurkish ? c.nameTr : c.nameEn} (${c.symbol})`,
                badge: c.category.toUpperCase(),
              }))}
              className="w-full"
              buttonClassName="py-3 bg-[#12141c] border-white/10 text-xs sm:text-sm font-bold"
            />
          </div>

          {/* SWAP BUTTON */}
          <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-5">
            <button
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 active:scale-90 transition-all shadow-lg cursor-pointer"
              title={isTurkish ? "Varlıkları Değiştir" : "Swap Currencies"}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* TO CURRENCY */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase">
              {isTurkish ? "Hedef Varlık (Alınan)" : "To"}
            </label>
            <StudioDropdown
              value={toCurr}
              onChange={(v) => setToCurr(v)}
              options={filteredCurrencies.map((c) => ({
                value: c.code,
                label: `${c.code} - ${isTurkish ? c.nameTr : c.nameEn} (${c.symbol})`,
                badge: c.category.toUpperCase(),
              }))}
              className="w-full"
              buttonClassName="py-3 bg-[#12141c] border-white/10 text-xs sm:text-sm font-bold"
            />
          </div>
        </div>

        {/* Live Result Display Box */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/5 p-5 sm:p-6 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs text-zinc-400 font-mono">
              {numericAmount.toLocaleString()} {fromCurr} =
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight">
              {convertedResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} <span className="text-lg text-white font-normal">{toCurr}</span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-0.5">
              1 {fromCurr} = {singleUnitRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCurr}
            </p>
          </div>

          <button
            onClick={handleCopyResult}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (isTurkish ? "Kopyalandı!" : "Copied!") : isTurkish ? "Sonucu Kopyala" : "Copy Result"}</span>
          </button>
        </div>
      </div>

      {/* Multi-Target Live Matrix (Instant Multi-Conversion Table) */}
      <div className="rounded-3xl border border-white/10 bg-[#0d0e14]/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {numericAmount.toLocaleString()} {fromCurr} {isTurkish ? "Karşılığı Popüler Varlıklar" : "Equivalent in Popular Assets"}
              </h3>
              <p className="text-xs text-zinc-400">
                {isTurkish ? "Seçili miktar için anlık altın, döviz ve kripto karşılıkları" : "Instant conversion matrix across gold, currencies, and crypto"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {watchlistCodes.map((code) => {
            const item = ALL_CURRENCIES.find((c) => c.code === code);
            if (!item || !rates[fromCurr] || !rates[code]) return null;

            const val = (numericAmount / rates[fromCurr]) * rates[code];

            return (
              <FluidSlimeCard
                key={code}
                glowColor={item.category === "metal" ? "rgba(245, 158, 11, 0.25)" : item.category === "crypto" ? "rgba(168, 85, 247, 0.25)" : "rgba(16, 185, 129, 0.25)"}
                className="p-3.5 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300 truncate">{isTurkish ? item.nameTr : item.nameEn}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">{item.symbol}</span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-lg font-black font-mono text-white truncate">
                    {val.toLocaleString(undefined, { maximumFractionDigits: val < 1 ? 4 : 2 })}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-mono">
                    1 {fromCurr} = {((1 / rates[fromCurr]) * rates[code]).toLocaleString(undefined, { maximumFractionDigits: 4 })} {item.code}
                  </p>
                </div>
              </FluidSlimeCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
