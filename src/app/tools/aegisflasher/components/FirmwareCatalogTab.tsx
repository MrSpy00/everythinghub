"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  GitBranch,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  FileCode,
  Globe,
  Radio,
} from "lucide-react";
import { FIRMWARE_CATALOG } from "@/lib/flasher/firmware-catalog";
import { ChipFamily, ConnectionStatus, FirmwareProfile, MicrocontrollerCategory } from "@/lib/flasher/types";

interface FirmwareCatalogTabProps {
  status: ConnectionStatus;
  onFlashFirmware: (profile: FirmwareProfile, selectedVersion: string, buildIndex: number) => void;
  onLoadCustomUrl: (url: string, offset: number) => void;
}

const CATEGORY_TABS: { id: MicrocontrollerCategory; label: string }[] = [
  { id: "all", label: "Tüm Projeler" },
  { id: "smart-home", label: "Akıllı Ev & Işık" },
  { id: "security-mesh", label: "Siber Güvenlik & LoRa" },
  { id: "cnc-robotics", label: "CNC & Robotik" },
  { id: "solar-energy", label: "Güneş & Telemetri" },
  { id: "python-lua", label: "Python & Lua" },
  { id: "diagnostics", label: "Donanım Teşhis" },
];

const CHIP_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "Tüm Çipler" },
  { id: "ESP32", label: "ESP32" },
  { id: "ESP32-S3", label: "ESP32-S3" },
  { id: "ESP32-C3", label: "ESP32-C3" },
  { id: "ESP8266", label: "ESP8266" },
  { id: "AVR-ATmega328P", label: "Arduino Uno / Nano" },
  { id: "RP2040", label: "RP2040 (Pico)" },
  { id: "STM32F103", label: "STM32 BluePill" },
];

export const FirmwareCatalogTab: React.FC<FirmwareCatalogTabProps> = ({
  status,
  onFlashFirmware,
  onLoadCustomUrl,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MicrocontrollerCategory>("all");
  const [selectedChip, setSelectedChip] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customBinUrl, setCustomBinUrl] = useState("");
  const [customOffsetHex, setCustomOffsetHex] = useState("0x0");
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [selectedBuildIndexes, setSelectedBuildIndexes] = useState<Record<string, number>>({});

  const filteredCatalog = useMemo(() => {
    return FIRMWARE_CATALOG.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchChip =
        selectedChip === "all" || item.supportedChips.includes(selectedChip as ChipFamily);
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchChip && matchSearch;
    });
  }, [selectedCategory, selectedChip, searchQuery]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-white/10 backdrop-blur-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Firmware, çip (ESP32, WLED, Tasmota, LoRa) veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Chip Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            aria-label="Mikrokontrolcü Çip Ailesi Filtresi"
            value={selectedChip}
            onChange={(e) => setSelectedChip(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            {CHIP_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-violet-500/20 text-violet-200 border border-violet-500/40 shadow-sm"
                : "bg-zinc-900/60 text-zinc-400 border border-white/5 hover:bg-zinc-800/80 hover:text-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Custom URL Flash Box */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-violet-500/20 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold whitespace-nowrap">
          <Globe className="w-4 h-4 text-violet-400" />
          Özel URL'den Flaşla:
        </div>
        <input
          type="text"
          placeholder="https://example.com/firmware.bin (GitHub Raw veya doğrudan .bin linki)"
          value={customBinUrl}
          onChange={(e) => setCustomBinUrl(e.target.value)}
          className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Offset:</span>
          <input
            type="text"
            value={customOffsetHex}
            onChange={(e) => setCustomOffsetHex(e.target.value)}
            className="w-20 bg-zinc-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-center font-mono text-zinc-100"
          />
          <button
            type="button"
            onClick={() => {
              if (customBinUrl.trim()) {
                const offset = parseInt(customOffsetHex, 16) || 0;
                onLoadCustomUrl(customBinUrl.trim(), offset);
              }
            }}
            disabled={!customBinUrl.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 transition-all disabled:opacity-40"
          >
            Yükle & Flaşla
          </button>
        </div>
      </div>

      {/* Firmware Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCatalog.map((fw) => {
          const activeVer = selectedVersions[fw.id] || fw.latestVersion;
          const buildsForVer = fw.builds[activeVer] || fw.builds[fw.latestVersion] || [];
          const activeBuildIdx = selectedBuildIndexes[fw.id] || 0;
          const currentBuild = buildsForVer[activeBuildIdx] || buildsForVer[0];

          return (
            <div
              key={fw.id}
              className="group flex flex-col justify-between p-5 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-violet-500/30 backdrop-blur-2xl transition-all duration-300 shadow-xl"
            >
              <div className="flex flex-col gap-3">
                {/* Header with Badge & Stars */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-violet-300 transition-colors">
                      {fw.name}
                    </h3>
                    <p className="text-xs font-medium text-violet-400/90 mt-0.5">{fw.tagline}</p>
                  </div>
                  {fw.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      {fw.badge}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                  {fw.description}
                </p>

                {/* Supported Chips Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {fw.supportedChips.map((chip) => (
                    <span
                      key={chip}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 border border-white/5 text-zinc-300"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Version & Build Selector */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Sürüm:</label>
                    <select
                      aria-label={`${fw.name} Firmware Sürüm Seçimi`}
                      value={activeVer}
                      onChange={(e) => {
                        setSelectedVersions({ ...selectedVersions, [fw.id]: e.target.value });
                        setSelectedBuildIndexes({ ...selectedBuildIndexes, [fw.id]: 0 });
                      }}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    >
                      {fw.availableVersions.map((v) => (
                        <option key={v} value={v}>
                          v{v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Hedef Model:</label>
                    <select
                      aria-label={`${fw.name} Hedef Kart ve Çip Modeli Seçimi`}
                      value={activeBuildIdx}
                      onChange={(e) =>
                        setSelectedBuildIndexes({
                          ...selectedBuildIndexes,
                          [fw.id]: Number(e.target.value),
                        })
                      }
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    >
                      {buildsForVer.map((b, idx) => (
                        <option key={idx} value={idx}>
                          {b.chip} ({b.description?.slice(0, 18)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Build Manifest Details */}
                {currentBuild && (
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-300">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span>Bölüm Yapısı:</span>
                      <span className="font-mono">{currentBuild.parts.length} Parça</span>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-[10px] text-zinc-400">
                      {currentBuild.parts.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-center justify-between">
                          <span className="truncate max-w-[170px]" title={p.name || p.path}>
                            {p.name || `Parça ${pIdx + 1}`}
                          </span>
                          <span className="text-violet-400">
                            {typeof p.offset === "number" ? `0x${p.offset.toString(16)}` : p.offset}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {fw.githubUrl && (
                    <a
                      href={fw.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                      title="GitHub Kaynak Kodu"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {fw.websiteUrl && (
                    <a
                      href={fw.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                      title="Resmi Dokümantasyon"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onFlashFirmware(fw, activeVer, activeBuildIdx)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 hover:border-violet-400 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-violet-400" />
                  Tek Tıkla Flaşla
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
