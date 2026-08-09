"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  MapPin,
  Users,
  Building2,
  DollarSign,
  Languages,
  Clock,
  Scale,
  ArrowRightLeft,
  ExternalLink,
  Sparkles,
  Compass,
  Download,
  Plus,
  X,
  Check,
  Copy,
  FileSpreadsheet,
  FileCode2,
  Car,
  Shield,
  Layers,
  ArrowLeft,
  Navigation,
  Maximize2,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAllCountries, type CountryData } from "@/lib/api-clients";
import { BUNDLED_COUNTRIES } from "@/lib/countries-dataset";
import { FluidSlimeCard } from "@/components/creative/FluidSlimeCard";
import { copyToClipboard } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function WorldCountriesExplorerClient() {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [countries, setCountries] = useState<CountryData[]>(BUNDLED_COUNTRIES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [unOnly, setUnOnly] = useState(false);
  const [landlockedOnly, setLandlockedOnly] = useState(false);
  const [driveSideFilter, setDriveSideFilter] = useState<"all" | "right" | "left">("all");
  const [sortBy, setSortBy] = useState<"name" | "pop_desc" | "area_desc">("name");

  // Selected Country for Single View
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(BUNDLED_COUNTRIES[0]);

  // Multi-Country Comparison Deck (can hold 2, 3, 4, 5+ countries)
  const [compareDeck, setCompareDeck] = useState<CountryData[]>([BUNDLED_COUNTRIES[0], BUNDLED_COUNTRIES[1]]);
  const [compareMode, setCompareMode] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  useEffect(() => {
    fetchAllCountries()
      .then((data) => {
        if (data && data.length > 0) {
          setCountries(data);
          const currentTr = data.find((c) => c.cca2 === "TR") || data[0];
          setSelectedCountry(currentTr);
          const currentDe = data.find((c) => c.cca2 === "DE") || data[1];
          const currentUs = data.find((c) => c.cca2 === "US") || data[2];
          setCompareDeck([currentTr, currentDe, currentUs]);
        }
      })
      .catch(() => {
        // Handled gracefully with bundled fallback
      });
  }, []);

  const regions = [
    { id: "all", label: isTurkish ? "Tüm Kıtalar" : "All Regions" },
    { id: "Europe", label: isTurkish ? "Avrupa" : "Europe" },
    { id: "Asia", label: isTurkish ? "Asya" : "Asia" },
    { id: "Americas", label: isTurkish ? "Amerika" : "Americas" },
    { id: "Africa", label: isTurkish ? "Afrika" : "Africa" },
    { id: "Oceania", label: isTurkish ? "Okyanusya" : "Oceania" },
  ];

  const filteredCountries = useMemo(() => {
    return countries
      .filter((c) => {
        const matchesRegion = regionFilter === "all" || c.region === regionFilter;
        const matchesUn = !unOnly || c.unMember;
        const matchesLandlocked = !landlockedOnly || c.landlocked;
        const matchesDrive = driveSideFilter === "all" || c.car?.side === driveSideFilter;

        const q = search.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.name.common.toLowerCase().includes(q) ||
          c.name.official.toLowerCase().includes(q) ||
          c.cca2.toLowerCase().includes(q) ||
          c.cca3.toLowerCase().includes(q) ||
          (c.capital && c.capital.some((cap) => cap.toLowerCase().includes(q))) ||
          (c.idd?.root && `${c.idd.root}${c.idd.suffixes?.[0] || ""}`.includes(q));

        return matchesRegion && matchesUn && matchesLandlocked && matchesDrive && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "pop_desc") return b.population - a.population;
        if (sortBy === "area_desc") return b.area - a.area;
        return a.name.common.localeCompare(b.name.common, isTurkish ? "tr" : "en");
      });
  }, [countries, regionFilter, unOnly, landlockedOnly, driveSideFilter, search, sortBy, isTurkish]);

  // Add/Remove from compare deck
  const toggleCompareCountry = (country: CountryData) => {
    const exists = compareDeck.some((c) => c.cca2 === country.cca2);
    if (exists) {
      if (compareDeck.length <= 1) {
        toast.error(isTurkish ? "Karşılaştırma için en az 1 ülke kalmalıdır." : "At least 1 country must remain in deck.");
        return;
      }
      setCompareDeck(compareDeck.filter((c) => c.cca2 !== country.cca2));
      toast.info(isTurkish ? `${country.name.common} güverteden çıkarıldı.` : `Removed ${country.name.common} from deck.`);
    } else {
      if (compareDeck.length >= 6) {
        toast.error(isTurkish ? "En fazla 6 ülke aynı anda karşılaştırılabilir." : "Maximum 6 countries can be compared at once.");
        return;
      }
      setCompareDeck([...compareDeck, country]);
      toast.success(isTurkish ? `${country.name.common} karşılaştırmaya eklendi!` : `Added ${country.name.common} to comparison!`);
    }
  };

  // Add Neighboring Countries to Comparison
  const addNeighborsToCompare = (target: CountryData) => {
    if (!target.borders || target.borders.length === 0) {
      toast.info(isTurkish ? "Bu ülkenin kara sınırı komşusu bulunmuyor." : "This country has no land borders.");
      return;
    }
    const neighbors = countries.filter((c) => target.borders?.includes(c.cca3));
    const newDeck = [...compareDeck];
    let addedCount = 0;
    neighbors.forEach((n) => {
      if (!newDeck.some((c) => c.cca2 === n.cca2) && newDeck.length < 6) {
        newDeck.push(n);
        addedCount++;
      }
    });
    setCompareDeck(newDeck);
    setCompareMode(true);
    toast.success(isTurkish ? `${addedCount} komşu ülke karşılaştırmaya eklendi!` : `Added ${addedCount} neighboring countries!`);
  };

  // CSV Export for Comparison Matrix
  const handleExportCsv = () => {
    const deck = compareMode ? compareDeck : [selectedCountry];
    let csv = "Country,Official Name,Capital,Region,Subregion,Population,Area (km2),Density (pop/km2),Currency,Languages,Driving Side,Calling Code,UN Member,Landlocked\n";
    deck.forEach((c) => {
      const langs = Object.values(c.languages || {}).join(" / ");
      const currs = Object.entries(c.currencies || {})
        .map(([code, cur]) => `${code} (${cur.name || ""})`)
        .join(" / ");
      const idd = `${c.idd?.root || ""}${c.idd?.suffixes?.[0] || ""}`;
      const density = Math.round(c.population / Math.max(1, c.area));
      csv += `"${c.name.common}","${c.name.official}","${(c.capital || []).join(", ")}","${c.region}","${c.subregion || ""}","${c.population}","${c.area}","${density}","${currs}","${langs}","${c.car?.side || "right"}","${idd}","${c.unMember ? "Yes" : "No"}","${c.landlocked ? "Yes" : "No"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `country_comparison_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "Karşılaştırma CSV raporu indirildi!" : "Comparison CSV report downloaded!");
  };

  // JSON Export
  const handleExportJson = async () => {
    const deck = compareMode ? compareDeck : selectedCountry;
    await copyToClipboard(JSON.stringify(deck, null, 2));
    toast.success(isTurkish ? "Ülke JSON verisi panoya kopyalandı!" : "Country JSON copied to clipboard!");
  };

  // Download Flag SVG / PNG
  const handleDownloadFlag = (c: CountryData) => {
    const a = document.createElement("a");
    a.href = c.flags.svg;
    a.download = `${c.cca2.toLowerCase()}_flag.svg`;
    a.target = "_blank";
    a.click();
    toast.success(isTurkish ? `${c.name.common} bayrağı indiriliyor...` : `Downloading ${c.name.common} flag...`);
  };

  // Download Coat of Arms SVG
  const handleDownloadCoat = (c: CountryData) => {
    if (!c.coatOfArms?.svg) {
      toast.error(isTurkish ? "Bu ülke için resmi arma bulunamadı." : "No coat of arms available for this country.");
      return;
    }
    const a = document.createElement("a");
    a.href = c.coatOfArms.svg;
    a.download = `${c.cca2.toLowerCase()}_coat_of_arms.svg`;
    a.target = "_blank";
    a.click();
    toast.success(isTurkish ? `${c.name.common} devlet arması indiriliyor...` : `Downloading coat of arms...`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isTurkish ? "CSV Raporu" : "CSV Export"}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{isTurkish ? "JSON Kopyala" : "JSON Data"}</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span>{isTurkish ? "250+ Dünya Ülkesi & Coğrafya Veritabanı" : "250+ Global Countries & Territories"}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {isTurkish ? "Dünya Ülkeleri & Coğrafya Karşılaştırma Stüdyosu" : "World Countries & Geography Explorer"}
        </h1>

        <p className="text-xs sm:text-sm text-white/70 max-w-2xl mx-auto leading-relaxed">
          {isTurkish
            ? "Dünyadaki tüm ülkelerin nüfus, yüzölçümü, dilleri, saat dilimleri, para birimleri, trafik yönleri ve komşuluk bağlarını derinlemesine inceleyin ve yan yana karşılaştırın."
            : "Explore official capitals, populations, surface areas, borders, driving sides, currencies, and compare multiple nations side-by-side."}
        </p>
      </div>

      {/* Mode Switcher & Highlight Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold transition-all shadow-xl cursor-pointer ${
            compareMode
              ? "bg-indigo-600 text-white border border-indigo-400 shadow-indigo-500/25 ring-2 ring-indigo-500/30"
              : "bg-white/[0.04] text-zinc-300 border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4 text-indigo-400" />
          <span>{compareMode ? (isTurkish ? "Çoklu Karşılaştırma Modu Açık" : "Comparison Mode Active") : isTurkish ? "Ülkeleri Yan Yana Karşılaştır" : "Compare Nations Side-by-Side"}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-white/20">
            {compareDeck.length}
          </span>
        </button>

        {compareMode && (
          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              highlightDifferences
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-white/[0.04] text-zinc-400 border border-white/10 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{highlightDifferences ? (isTurkish ? "Farklılıklar & Benzerlikler Vurgulanıyor" : "Highlights Active") : isTurkish ? "Vurgulamayı Aç" : "Enable Highlights"}</span>
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar (4 Cols): Directory & Filter Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#0d0e14]/90 backdrop-blur-3xl p-5 shadow-2xl flex flex-col h-[760px]">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder={isTurkish ? "Ülke, başkent, kod (+90, TR)..." : "Search country, capital, code..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:bg-white/[0.08] focus:outline-none transition-all"
              />
            </div>

            {/* Region Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setRegionFilter(reg.id)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    regionFilter === reg.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Sub-Filters: Landlocked, UN, Driving Side & Sort */}
            <div className="flex flex-wrap items-center gap-1.5 pb-3 mb-2 border-b border-white/5 text-[10px]">
              <button
                onClick={() => setUnOnly(!unOnly)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  unOnly ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-white/[0.02] text-zinc-400 border-white/5 hover:text-white"
                }`}
              >
                {isTurkish ? "BM Üyesi" : "UN Member"}
              </button>

              <button
                onClick={() => setLandlockedOnly(!landlockedOnly)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  landlockedOnly ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-white/[0.02] text-zinc-400 border-white/5 hover:text-white"
                }`}
              >
                {isTurkish ? "Karasal (Kıyısız)" : "Landlocked"}
              </button>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#12141c] border border-white/10 text-zinc-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none"
              >
                <option value="name">{isTurkish ? "Alfabetik" : "A-Z"}</option>
                <option value="pop_desc">{isTurkish ? "En Kalabalık" : "Highest Population"}</option>
                <option value="area_desc">{isTurkish ? "En Geniş Yüzölçümü" : "Largest Area"}</option>
              </select>
            </div>

            {/* Country List Directory */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry?.cca2 === c.cca2;
                const isInCompareDeck = compareDeck.some((d) => d.cca2 === c.cca2);

                return (
                  <div
                    key={c.cca2}
                    onClick={() => {
                      if (compareMode) {
                        toggleCompareCountry(c);
                      } else {
                        setSelectedCountry(c);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected && !compareMode
                        ? "bg-indigo-500/15 border-indigo-500/40 text-white shadow-lg"
                        : isInCompareDeck && compareMode
                        ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.flags.svg}
                        alt={c.name.common}
                        className="h-5 w-7 object-cover rounded shadow-sm shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span className={isSelected || isInCompareDeck ? "text-white" : "text-zinc-200"}>
                            {c.name.common}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500">{c.cca2}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {c.capital?.[0]} · {(c.population / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {compareMode ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompareCountry(c);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isInCompareDeck
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : "bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {isInCompareDeck ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompareCountry(c);
                            setCompareMode(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white transition-colors"
                          title={isTurkish ? "Karşılaştırmaya Ekle" : "Add to Comparison"}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/5 text-[10px] text-zinc-500 text-center">
              {filteredCountries.length} {isTurkish ? "ülke listelendi" : "countries listed"}
            </div>
          </div>
        </div>

        {/* Right Main Area (8 Cols): Single View or Multi-Country Comparison Deck */}
        <div className="lg:col-span-8 space-y-6">
          {compareMode ? (
            /* MULTI-COUNTRY COMPARISON MATRIX */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 sm:p-6 rounded-3xl bg-[#0d0e14]/90 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {isTurkish ? "Yan Yana Çoklu Ülke Karşılaştırması" : "Multi-Nation Comparison Deck"}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {compareDeck.length} {isTurkish ? "ülke karşılaştırılıyor (en fazla 6)" : "nations in deck (up to 6)"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCompareDeck([selectedCountry])}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    {isTurkish ? "Güverteyi Temizle" : "Clear Deck"}
                  </button>
                </div>

                {/* Horizontal Comparison Matrix with sticky columns */}
                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                  <div className="grid gap-4 min-w-[650px]" style={{ gridTemplateColumns: `repeat(${compareDeck.length}, minmax(220px, 1fr))` }}>
                    {compareDeck.map((c) => {
                      const density = Math.round(c.population / Math.max(1, c.area));
                      const currs = Object.entries(c.currencies || {}).map(([code, cur]) => `${code} (${cur.symbol || ""})`).join(", ");
                      const langs = Object.values(c.languages || {}).join(", ");
                      const idd = `${c.idd?.root || ""}${c.idd?.suffixes?.[0] || ""}`;

                      return (
                        <div
                          key={c.cca2}
                          className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col space-y-4 relative group"
                        >
                          <button
                            onClick={() => toggleCompareCountry(c)}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-zinc-400 hover:text-white hover:bg-rose-500/20 transition-colors"
                            title={isTurkish ? "Çıkar" : "Remove"}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Country Header */}
                          <div className="flex items-center gap-3">
                            <img src={c.flags.svg} alt={c.name.common} className="w-12 h-8 rounded object-cover border border-white/10 shadow" />
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-sm truncate">{c.name.common}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono">{c.cca3} · {c.region}</p>
                            </div>
                          </div>

                          {/* Metric Rows */}
                          <div className="space-y-2.5 text-xs divide-y divide-white/5">
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Başkent" : "Capital"}</span>
                              <span className="font-bold text-white">{c.capital?.[0]}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Nüfus" : "Population"}</span>
                              <span className="font-bold text-indigo-300 font-mono">{c.population.toLocaleString()}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Yüzölçümü" : "Area"}</span>
                              <span className="font-bold text-emerald-300 font-mono">{c.area.toLocaleString()} km²</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Yoğunluk" : "Density"}</span>
                              <span className="font-bold text-purple-300 font-mono">{density} kişi/km²</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Para Birimi" : "Currency"}</span>
                              <span className="font-bold text-amber-300 truncate max-w-[120px]">{currs || "N/A"}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Trafik Akışı" : "Driving Side"}</span>
                              <span className="font-bold text-white capitalize">{c.car?.side === "left" ? (isTurkish ? "Soldan 🚗" : "Left") : (isTurkish ? "Sağdan 🚗" : "Right")}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Telefon Kodu" : "Calling Code"}</span>
                              <span className="font-bold text-white font-mono">{idd || "N/A"}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "BM Üyesi" : "UN Member"}</span>
                              <span className={`font-bold ${c.unMember ? "text-emerald-400" : "text-zinc-400"}`}>
                                {c.unMember ? (isTurkish ? "Evet" : "Yes") : (isTurkish ? "Hayır" : "No")}
                              </span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-zinc-500 text-[11px]">{isTurkish ? "Denize Kıyı" : "Coastline"}</span>
                              <span className={`font-bold ${c.landlocked ? "text-amber-400" : "text-emerald-400"}`}>
                                {c.landlocked ? (isTurkish ? "Yok (Karasal)" : "Landlocked") : (isTurkish ? "Var (Kıyılı)" : "Coastal")}
                              </span>
                            </div>
                          </div>

                          {/* Action links */}
                          <div className="pt-2 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCountry(c);
                                setCompareMode(false);
                              }}
                              className="w-full py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all text-center cursor-pointer"
                            >
                              {isTurkish ? "Detayları İncele" : "View Details"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE COUNTRY DEEP-DIVE STUDIO */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Country Hero Glass Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0e14]/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* High Res Flag & Emblem */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <img
                      src={selectedCountry.flags.svg}
                      alt={selectedCountry.name.common}
                      className="w-36 h-24 sm:w-44 sm:h-28 object-cover rounded-2xl border border-white/20 shadow-2xl"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadFlag(selectedCountry)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-indigo-400" />
                        <span>Bayrak SVG</span>
                      </button>

                      {selectedCountry.coatOfArms?.svg && (
                        <button
                          onClick={() => handleDownloadCoat(selectedCountry)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                        >
                          <Shield className="w-3 h-3 text-amber-400" />
                          <span>Arma SVG</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Key Specs */}
                  <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {selectedCountry.region} · {selectedCountry.subregion}
                      </span>
                      {selectedCountry.unMember && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {isTurkish ? "BM Üyesi" : "UN Member"}
                        </span>
                      )}
                      {selectedCountry.landlocked && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {isTurkish ? "Denize Kıyısı Yok" : "Landlocked"}
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedCountry.name.common}</h2>
                    <p className="text-xs sm:text-sm text-zinc-400">{selectedCountry.name.official}</p>

                    {/* Quick Badges */}
                    <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start text-xs">
                      <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 font-mono">
                        ISO: {selectedCountry.cca2} / {selectedCountry.cca3}
                      </span>
                      {selectedCountry.tld?.[0] && (
                        <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 font-mono">
                          TLD: {selectedCountry.tld[0]}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300">
                        🚗 {selectedCountry.car?.side === "left" ? (isTurkish ? "Soldan Trafik" : "Left Traffic") : isTurkish ? "Sağdan Trafik" : "Right Traffic"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (!compareDeck.some((c) => c.cca2 === selectedCountry.cca2)) {
                          setCompareDeck([...compareDeck, selectedCountry]);
                        }
                        setCompareMode(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/25 active:scale-95 transition-all shadow-xl cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{isTurkish ? "Karşılaştırmaya Ekle" : "Add to Comparison"}</span>
                    </button>

                    {selectedCountry.borders && selectedCountry.borders.length > 0 && (
                      <button
                        onClick={() => addNeighborsToCompare(selectedCountry)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-semibold hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-purple-400" />
                        <span>{isTurkish ? "Komşuları Ekle" : "Add Neighbors"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FluidSlimeCard glowColor="rgba(99, 102, 241, 0.2)" className="p-5 space-y-1">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Nüfus" : "Population"}</span>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-indigo-400">{selectedCountry.population.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400">{isTurkish ? "Resmi kayıtlı nüfus" : "Registered census"}</p>
                </FluidSlimeCard>

                <FluidSlimeCard glowColor="rgba(16, 185, 129, 0.2)" className="p-5 space-y-1">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Yüzölçümü" : "Surface Area"}</span>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{selectedCountry.area.toLocaleString()} km²</p>
                  <p className="text-[10px] text-zinc-400">{Math.round(selectedCountry.area * 0.386102).toLocaleString()} sq mi</p>
                </FluidSlimeCard>

                <FluidSlimeCard glowColor="rgba(168, 85, 247, 0.2)" className="p-5 space-y-1">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Nüfus Yoğunluğu" : "Density"}</span>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
                    {Math.round(selectedCountry.population / Math.max(1, selectedCountry.area))}
                  </p>
                  <p className="text-[10px] text-zinc-400">{isTurkish ? "kişi başına düşen km²" : "people per km²"}</p>
                </FluidSlimeCard>

                <FluidSlimeCard glowColor="rgba(245, 158, 11, 0.2)" className="p-5 space-y-1">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Başkent" : "Capital"}</span>
                  <p className="text-2xl sm:text-3xl font-black text-amber-300 truncate">{selectedCountry.capital?.[0] || "N/A"}</p>
                  <p className="text-[10px] text-zinc-400">{selectedCountry.timezones?.[0] || "UTC"}</p>
                </FluidSlimeCard>
              </div>

              {/* Detailed Breakdown Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0d0e14]/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                  <span>{isTurkish ? "Detaylı Coğrafi, Kültürel & İdari Parametreler" : "Detailed Geographic & Cultural Specs"}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Languages className="w-4 h-4 text-purple-400" />
                        <span>{isTurkish ? "Resmi ve Yerel Diller" : "Official Languages"}</span>
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(selectedCountry.languages || {}).map(([code, name]) => (
                          <span key={code} className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200">
                            {name} <span className="text-zinc-500 font-mono">({code})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>{isTurkish ? "Para Birimi & Sembol" : "Currencies"}</span>
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(selectedCountry.currencies || {}).map(([code, cur]) => (
                          <span key={code} className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200">
                            {cur.name} <span className="text-amber-400 font-bold">({cur.symbol || code})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Compass className="w-4 h-4 text-indigo-400" />
                        <span>{isTurkish ? "Sınır Komşuları" : "Bordering Nations"}</span>
                      </span>
                      {selectedCountry.borders && selectedCountry.borders.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedCountry.borders.map((borderCode) => {
                            const bCountry = countries.find((c) => c.cca3 === borderCode);
                            return (
                              <button
                                key={borderCode}
                                onClick={() => bCountry && setSelectedCountry(bCountry)}
                                className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all font-mono cursor-pointer"
                              >
                                {bCountry ? bCountry.name.common : borderCode}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-zinc-500">{isTurkish ? "Bu ülkenin doğrudan kara sınırı komşusu yoktur (Ada/İzole)." : "No land borders."}</p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>{isTurkish ? "Saat Dilimleri" : "Timezones"}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedCountry.timezones.map((tz) => (
                          <span key={tz} className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 font-mono">
                            {tz}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Map Links */}
                <div className="pt-2 flex flex-wrap gap-3 border-t border-white/5">
                  <a
                    href={selectedCountry.maps.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/25 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>

                  <a
                    href={selectedCountry.maps.openStreetMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-semibold hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OpenStreetMap</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
