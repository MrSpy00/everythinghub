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
  CheckCircle2,
  AlertCircle,
  FileCode,
  Globe,
  Radio,
  ChevronDown,
  Info,
  Zap,
} from "lucide-react";
import { FIRMWARE_CATALOG, getLocalizedFirmware, getLocalizedBuildDescription } from "@/lib/flasher/firmware-catalog";
import { ChipFamily, ConnectionStatus, FirmwareProfile, FlashPartitionFile, MicrocontrollerCategory } from "@/lib/flasher/types";
import { SmartUrlFlasher } from "./SmartUrlFlasher";
import { FlasherSelect, FlasherSelectOption } from "./FlasherSelect";
import { Language, useTranslation } from "@/lib/flasher/i18n";

interface FirmwareCatalogTabProps {
  status: ConnectionStatus;
  onFlashFirmware: (profile: FirmwareProfile, selectedVersion: string, buildIndex: number) => void;
  onLoadCustomUrl: (url: string, offset: number) => void;
  onAddCustomPartition?: (partition: FlashPartitionFile) => void;
  lang?: Language;
}

export const FirmwareCatalogTab: React.FC<FirmwareCatalogTabProps> = ({
  status,
  onFlashFirmware,
  onLoadCustomUrl,
  onAddCustomPartition,
  lang = "tr",
}) => {
  const t = useTranslation(lang);
  const [selectedCategory, setSelectedCategory] = useState<MicrocontrollerCategory>("all");
  const [selectedChip, setSelectedChip] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [selectedBuildIndexes, setSelectedBuildIndexes] = useState<Record<string, number>>({});

  const filteredCatalog = useMemo(() => {
    return FIRMWARE_CATALOG.map((item) => getLocalizedFirmware(item, lang)).filter((item) => {
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
  }, [selectedCategory, selectedChip, searchQuery, lang]);

  const getOffsetBadgeInfo = (offsetVal: number | string) => {
    const num = typeof offsetVal === "number" ? offsetVal : parseInt(offsetVal, 16) || 0;
    if (num === 0x0) {
      return {
        label: t("offset_factory_badge"),
        desc: t("offset_factory_desc"),
        colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    }
    if (num === 0x1000) {
      return {
        label: t("offset_bootloader_badge"),
        desc: t("offset_bootloader_desc"),
        colorClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      };
    }
    if (num === 0x8000) {
      return {
        label: t("offset_partition_badge"),
        desc: t("offset_partition_desc"),
        colorClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      };
    }
    if (num === 0x10000) {
      return {
        label: t("offset_app_badge"),
        desc: t("offset_app_desc"),
        colorClass: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      };
    }
    if (num >= 0x200000) {
      return {
        label: `0x${num.toString(16)} (${t("offset_fs_badge")})`,
        desc: "LittleFS / SPIFFS",
        colorClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      };
    }
    return {
      label: `0x${num.toString(16)} (${t("offset_custom_badge")})`,
      desc: t("offset_custom_badge"),
      colorClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    };
  };

  const categoryTabs: { id: MicrocontrollerCategory; label: string }[] = [
    { id: "all", label: t("catalog_all_projects") },
    { id: "smart-home", label: t("catalog_smart_home") },
    { id: "security-mesh", label: t("catalog_security_mesh") },
    { id: "cnc-robotics", label: t("catalog_cnc_robotics") },
    { id: "solar-energy", label: t("catalog_solar_energy") },
    { id: "python-lua", label: t("catalog_python_lua") },
    { id: "diagnostics", label: t("catalog_diagnostics") },
  ];

  const chipFilterOptions: FlasherSelectOption[] = [
    { value: "all", label: t("all_chips") },
    { value: "ESP32", label: "ESP32" },
    { value: "ESP32-S3", label: "ESP32-S3" },
    { value: "ESP32-C3", label: "ESP32-C3" },
    { value: "ESP8266", label: "ESP8266" },
    { value: "AVR-ATmega328P", label: "Arduino Uno / Nano" },
    { value: "AVR-ATmega2560", label: "Arduino Mega" },
    { value: "RP2040", label: "RP2040 (Pico)" },
    { value: "STM32F103", label: "STM32 BluePill" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Filters Bar */}
      <div className="relative z-30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t("catalog_search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Custom Glassmorphic Chip Filter Dropdown */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <FlasherSelect
            options={chipFilterOptions}
            value={selectedChip}
            onChange={(val) => setSelectedChip(val)}
            ariaLabel="Mikrokontrolcü Çip Ailesi Filtresi"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryTabs.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat.id
                ? "bg-violet-600/25 text-violet-200 border border-violet-500/40 shadow-lg shadow-violet-500/10 scale-[1.02]"
                : "bg-zinc-900/60 text-zinc-400 border border-white/5 hover:bg-zinc-800/80 hover:text-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Smart Universal URL & GitHub Release Downloader */}
      <SmartUrlFlasher
        onLoadPartition={(part) => {
          if (onAddCustomPartition) {
            onAddCustomPartition(part);
          } else {
            onLoadCustomUrl(part.name, part.offset);
          }
        }}
        lang={lang}
      />

      {/* Firmware Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCatalog.map((fw) => {
          const activeVer = selectedVersions[fw.id] || fw.latestVersion;
          const buildsForVer = fw.builds[activeVer] || fw.builds[fw.latestVersion] || [];
          const activeBuildIdx = selectedBuildIndexes[fw.id] || 0;
          const currentBuild = buildsForVer[activeBuildIdx] || buildsForVer[0];

          const versionSelectOptions: FlasherSelectOption[] = fw.availableVersions.map((v) => ({
            value: v,
            label: `v${v}`,
            badge: v === fw.latestVersion ? (lang === "en" ? "Latest" : "Son Sürüm") : undefined,
          }));

          const buildSelectOptions: FlasherSelectOption[] = buildsForVer.map((b, idx) => ({
            value: idx,
            label: getLocalizedBuildDescription(b, lang),
            subtitle: b.minFlashSize ? `Min Flash: ${b.minFlashSize}` : undefined,
            badge: String(b.chip),
          }));

          return (
            <div
              key={fw.id}
              className="group flex flex-col justify-between p-6 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-violet-500/40 backdrop-blur-3xl transition-all duration-300 shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-4">
                {/* Header with Title & Category Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                      {fw.name}
                    </h3>
                    <p className="text-xs font-medium text-violet-400/90 mt-0.5 line-clamp-1">
                      {fw.tagline}
                    </p>
                  </div>
                  {fw.badge && (
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      {fw.badge}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300/90 leading-relaxed line-clamp-3 min-h-[48px]">
                  {fw.description}
                </p>

                {/* Supported Chips Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {fw.supportedChips.map((chip) => (
                    <span
                      key={chip}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 border border-white/10 text-zinc-300 shadow-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Custom Animated Glassmorphic Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                      <span>{t("version_label")}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">v{activeVer}</span>
                    </label>
                    <FlasherSelect
                      options={versionSelectOptions}
                      value={activeVer}
                      onChange={(val) => {
                        setSelectedVersions({ ...selectedVersions, [fw.id]: String(val) });
                        setSelectedBuildIndexes({ ...selectedBuildIndexes, [fw.id]: 0 });
                      }}
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                      <span>{t("target_model_label")}</span>
                      <span className="text-[10px] text-violet-300 font-mono">
                        {currentBuild?.chip || "Model"}
                      </span>
                    </label>
                    <FlasherSelect
                      options={buildSelectOptions}
                      value={activeBuildIdx}
                      onChange={(val) =>
                        setSelectedBuildIndexes({
                          ...selectedBuildIndexes,
                          [fw.id]: Number(val),
                        })
                      }
                      size="sm"
                    />
                  </div>
                </div>

                {/* Build Manifest Details & Offsets */}
                {currentBuild && (
                  <div className="p-3 rounded-2xl bg-zinc-900/70 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-violet-400" />
                        {t("flash_sections")} ({currentBuild.parts.length})
                      </span>
                      {currentBuild.minFlashSize && (
                        <span className="font-mono text-[10px] text-emerald-400">
                          Min: {currentBuild.minFlashSize}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {currentBuild.parts.map((p, pIdx) => {
                        const badgeInfo = getOffsetBadgeInfo(p.offset);
                        return (
                          <div
                            key={pIdx}
                            className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-zinc-950/60 border border-white/5"
                            title={badgeInfo.desc}
                          >
                            <span className="text-xs text-zinc-200 font-medium truncate flex-1" title={p.name || p.path}>
                              {p.name || `Part ${pIdx + 1}`}
                            </span>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badgeInfo.colorClass}`}
                            >
                              {badgeInfo.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2.5 mt-5 pt-3.5 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  {fw.githubUrl && (
                    <a
                      href={fw.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-sm"
                      title={t("source_code")}
                    >
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  {fw.websiteUrl && (
                    <a
                      href={fw.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-sm"
                      title={t("official_docs")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onFlashFirmware(fw, activeVer, activeBuildIdx)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 hover:border-violet-400 backdrop-blur-xl shadow-lg transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-violet-300" />
                  {t("one_click_flash")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
