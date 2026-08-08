"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { fetchAllCountries, type CountryData } from "@/lib/api-clients";

export function WorldCountriesExplorerClient() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  // Comparison State
  const [compareMode, setCompareMode] = useState(false);
  const [compareCountry, setCompareCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    fetchAllCountries()
      .then((data) => {
        setCountries(data);
        const turkey = data.find((c) => c.cca2 === "TR") || data[0];
        setSelectedCountry(turkey);
        const germany = data.find((c) => c.cca2 === "DE") || data[1];
        setCompareCountry(germany);
      })
      .catch(() => toast.error("Ülke verileri yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  const regions = [
    { id: "all", label: "Tüm Bölgeler" },
    { id: "Europe", label: "Avrupa" },
    { id: "Asia", label: "Asya" },
    { id: "Americas", label: "Amerika" },
    { id: "Africa", label: "Afrika" },
    { id: "Oceania", label: "Okyanusya" },
  ];

  const filteredCountries = countries.filter((c) => {
    const matchesRegion = regionFilter === "all" || c.region === regionFilter;
    const matchesQuery =
      c.name.common.toLowerCase().includes(search.toLowerCase()) ||
      c.name.official.toLowerCase().includes(search.toLowerCase()) ||
      (c.capital && c.capital.some((cap) => cap.toLowerCase().includes(search.toLowerCase())));
    return matchesRegion && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span>REST Countries Global Database</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Dünya Ülkeleri & Coğrafya Karşılaştırma Stüdyosu
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          250+ dünya ülkesinin bayrakları, nüfusu, başkentleri, dilleri ve para birimlerini canlı keşfedin ve ülkeleri yan yana karşılaştırın.
        </p>
      </div>

      {/* Comparison Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            compareMode
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
              : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
          }`}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>{compareMode ? "Karşılaştırma Modu Açık" : "İki Ülkeyi Karşılaştır"}</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 4 Cols: Country Directory List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-5 shadow-2xl flex flex-col h-[700px]">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Ülke veya başkent ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Region Filter Buttons */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setRegionFilter(reg.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    regionFilter === reg.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Countries Scroll List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry?.cca2 === c.cca2;
                return (
                  <div
                    key={c.cca2}
                    onClick={() => setSelectedCountry(c)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                        : "bg-white/[0.02] border-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.flags.svg || c.flags.png}
                        alt={c.name.common}
                        className="h-4 w-6 object-cover rounded shadow shrink-0"
                      />
                      <span className="text-xs font-semibold truncate">{c.name.common}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">{c.region}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Country Showcase or Side-by-Side Comparison */}
        <div className="lg:col-span-8 space-y-6">
          {!compareMode ? (
            /* Single Country Card */
            selectedCountry && (
              <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-7 shadow-2xl space-y-6">
                {/* Hero Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedCountry.flags.svg || selectedCountry.flags.png}
                      alt={selectedCountry.name.common}
                      className="h-16 w-24 object-cover rounded-xl shadow-2xl border border-white/10"
                    />
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">{selectedCountry.name.common}</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">{selectedCountry.name.official}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                    {selectedCountry.cca2} / {selectedCountry.cca3}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                      <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Başkent</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {selectedCountry.capital?.join(", ") || "Bilinmiyor"}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                      <Users className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Nüfus</span>
                    </div>
                    <div className="text-sm font-semibold text-white font-mono">
                      {selectedCountry.population.toLocaleString("tr-TR")}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                      <Scale className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Yüzölçümü</span>
                    </div>
                    <div className="text-sm font-semibold text-white font-mono">
                      {selectedCountry.area.toLocaleString("tr-TR")} km²
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                      <span>Para Birimi</span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {selectedCountry.currencies
                        ? Object.values(selectedCountry.currencies)
                            .map((c) => `${c.name} (${c.symbol})`)
                            .join(", ")
                        : "Bilinmiyor"}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Resmi Diller</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCountry.languages &&
                        Object.values(selectedCountry.languages).map((l) => (
                          <span
                            key={l}
                            className="text-xs rounded-lg bg-white/[0.04] border border-white/5 px-2.5 py-1 text-zinc-300"
                          >
                            {l}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Zaman Dilimleri</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCountry.timezones.slice(0, 4).map((tz) => (
                        <span
                          key={tz}
                          className="text-[11px] font-mono rounded-lg bg-white/[0.04] border border-white/5 px-2.5 py-1 text-zinc-400"
                        >
                          {tz}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Side by Side Comparison */
            selectedCountry &&
            compareCountry && (
              <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
                <h3 className="text-sm font-bold text-white text-center">Ülke Karşılaştırma Matrisi</h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Country 1 */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedCountry.flags.svg}
                      alt={selectedCountry.name.common}
                      className="h-12 w-20 object-cover mx-auto rounded shadow"
                    />
                    <h4 className="text-base font-bold text-white">{selectedCountry.name.common}</h4>
                    <div className="text-xs text-zinc-400">Nüfus: {selectedCountry.population.toLocaleString("tr-TR")}</div>
                    <div className="text-xs text-zinc-400">Alan: {selectedCountry.area.toLocaleString("tr-TR")} km²</div>
                  </div>

                  {/* Country 2 */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={compareCountry.flags.svg}
                      alt={compareCountry.name.common}
                      className="h-12 w-20 object-cover mx-auto rounded shadow"
                    />
                    <h4 className="text-base font-bold text-white">{compareCountry.name.common}</h4>
                    <div className="text-xs text-zinc-400">Nüfus: {compareCountry.population.toLocaleString("tr-TR")}</div>
                    <div className="text-xs text-zinc-400">Alan: {compareCountry.area.toLocaleString("tr-TR")} km²</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
