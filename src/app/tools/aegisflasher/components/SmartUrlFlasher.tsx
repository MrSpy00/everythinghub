"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Globe,
  Download,
  Search,
  GitBranch,
  FileCode,
  RefreshCw,
  Zap,
  Star,
  GitFork,
  ExternalLink,
  Layers,
  ArrowLeft,
  Sparkles,
  Tag,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { FlashPartitionFile } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";
import { downloadBinaryWithFallback } from "@/lib/flasher/binary-downloader";
import { FlasherSelect, FlasherSelectOption } from "./FlasherSelect";

export interface GitHubRepoItem {
  id: number;
  full_name: string;
  name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics?: string[];
  language?: string;
  updated_at: string;
}

export interface GitHubReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
  download_count: number;
  content_type: string;
}

export interface GitHubReleaseInfo {
  id: number;
  tag_name: string;
  name: string | null;
  published_at: string;
  body: string | null;
  prerelease: boolean;
  assets: GitHubReleaseAsset[];
}

export interface DetectedPartitionMeta {
  role: string;
  offsetHex: string;
  offsetNum: number;
  colorClass: string;
  isBootloader?: boolean;
  isPartitionTable?: boolean;
  isApp?: boolean;
}

interface SmartUrlFlasherProps {
  onLoadPartition: (partition: FlashPartitionFile) => void;
  onLoadPartitions?: (partitions: FlashPartitionFile[]) => void;
  lang?: Language;
  initialQuery?: string;
}

const POPULAR_FIRMWARE_PRESETS = [
  { label: "WLED", query: "Aircoookie/WLED", chip: "ESP32 / ESP8266" },
  { label: "Tasmota", query: "arendst/Tasmota", chip: "ESP32 / ESP8266" },
  { label: "Meshtastic", query: "meshtastic/firmware", chip: "ESP32 LoRa / nRF52" },
  { label: "ESPHome", query: "esphome/esphome", chip: "ESP32 / RP2040" },
  { label: "MicroPython", query: "micropython/micropython", chip: "ESP32 / Pico / STM32" },
  { label: "FluidNC", query: "bdring/FluidNC", chip: "ESP32 CNC" },
  { label: "ESP32 Marauder", query: "justcallmekoko/ESP32Marauder", chip: "ESP32 Security" },
  { label: "OpenIris", query: "openiris/openiris", chip: "ESP32 Biometrics" },
];

export const SmartUrlFlasher: React.FC<SmartUrlFlasherProps> = ({
  onLoadPartition,
  onLoadPartitions,
  lang = "tr",
  initialQuery = "",
}) => {
  const t = useTranslation(lang);

  // Tab mode: 'search' for GitHub Project Search, 'direct' for Direct URL / Repo Link
  const [activeMode, setActiveMode] = useState<"search" | "direct">("search");

  // GitHub Search State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GitHubRepoItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected Repo & Releases State
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoItem | null>(null);
  const [releases, setReleases] = useState<GitHubReleaseInfo[]>([]);
  const [selectedReleaseTag, setSelectedReleaseTag] = useState<string>("");
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const [assetFilter, setAssetFilter] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // Direct URL State
  const [urlInput, setUrlInput] = useState("");
  const [customOffsetHex, setCustomOffsetHex] = useState("0x0");
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  // Downloader & Analysis State
  const [downloadingAssetId, setDownloadingAssetId] = useState<number | string | null>(null);
  const [isDownloadingAllParts, setIsDownloadingAllParts] = useState(false);
  const [detectedFileInfo, setDetectedFileInfo] = useState<{
    name: string;
    sizeBytes: number;
    detectedType: string;
    suggestedOffsetHex: string;
    data: Uint8Array;
  } | null>(null);

  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Asset analyzer & offset detection
  const classifyAsset = (filename: string): DetectedPartitionMeta => {
    const lower = filename.toLowerCase();

    // Check Intel HEX
    if (lower.endsWith(".hex")) {
      return {
        role: "Intel HEX",
        offsetHex: "0x0",
        offsetNum: 0x0,
        colorClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      };
    }
    // Check UF2
    if (lower.endsWith(".uf2")) {
      return {
        role: "UF2 (Pico)",
        offsetHex: "0x0",
        offsetNum: 0x0,
        colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    }
    // Bootloader
    if (lower.includes("bootloader") || lower.includes("boot.bin")) {
      const isS3orC3 = lower.includes("s3") || lower.includes("c3");
      const offset = isS3orC3 ? 0x0 : 0x1000;
      return {
        role: "Bootloader",
        offsetHex: `0x${offset.toString(16)}`,
        offsetNum: offset,
        colorClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        isBootloader: true,
      };
    }
    // Partition Table
    if (lower.includes("partition") || lower.includes("part.bin")) {
      return {
        role: "Partition Table",
        offsetHex: "0x8000",
        offsetNum: 0x8000,
        colorClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        isPartitionTable: true,
      };
    }
    // Boot App0 / OTA Data
    if (lower.includes("boot_app0") || lower.includes("otadata")) {
      return {
        role: "Boot App0 (OTA)",
        offsetHex: "0xe000",
        offsetNum: 0xe000,
        colorClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      };
    }
    // Filesystem (LittleFS / SPIFFS)
    if (lower.includes("spiffs") || lower.includes("littlefs")) {
      return {
        role: "LittleFS / SPIFFS",
        offsetHex: "0x290000",
        offsetNum: 0x290000,
        colorClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      };
    }
    // Factory Merged / Full Binary
    if (
      lower.includes("factory") ||
      lower.includes("merged") ||
      lower.includes("full") ||
      lower.includes("all-in-one")
    ) {
      return {
        role: "Factory Merged",
        offsetHex: "0x0",
        offsetNum: 0x0,
        colorClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    }
    // Default App Binary
    return {
      role: "App Firmware",
      offsetHex: "0x10000",
      offsetNum: 0x10000,
      colorClass: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      isApp: true,
    };
  };

  // Inspect binary byte buffer
  const inspectBinaryBuffer = (filename: string, data: Uint8Array) => {
    let detectedType = lang === "tr" ? "Standart Binary (.bin)" : "Standard Binary (.bin)";
    let suggestedOffset = 0x0;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith(".hex") || (data.length > 0 && data[0] === 0x3a)) {
      detectedType = "Intel HEX (Arduino AVR / STK500)";
      suggestedOffset = 0x0;
    } else if (
      lowerName.endsWith(".uf2") ||
      (data.length >= 8 &&
        data[0] === 0x55 &&
        data[1] === 0x46 &&
        data[2] === 0x32 &&
        data[3] === 0x0a)
    ) {
      detectedType = "UF2 Firmware Image (RP2040 Pico)";
      suggestedOffset = 0x0;
    } else if (data.length > 4 && data[0] === 0xe9) {
      const spiMode = data[2];
      const spiSizeFreq = data[3];
      detectedType = `ESP Bootable ROM (Magic: 0xE9, SPI Mode: 0x${spiMode.toString(
        16
      )}, Speed: 0x${spiSizeFreq.toString(16)})`;

      const classified = classifyAsset(filename);
      suggestedOffset = classified.offsetNum;
    } else {
      const classified = classifyAsset(filename);
      suggestedOffset = classified.offsetNum;
      detectedType = classified.role;
    }

    const suggestedHex = `0x${suggestedOffset.toString(16)}`;
    setCustomOffsetHex(suggestedHex);
    setDetectedFileInfo({
      name: filename,
      sizeBytes: data.length,
      detectedType,
      suggestedOffsetHex: suggestedHex,
      data,
    });
  };

  // 1. Fetch Releases for Selected Repo
  const fetchReleasesForRepo = async (owner: string, repo: string) => {
    setIsLoadingReleases(true);
    setSelectedReleaseTag("");
    setAssetFilter("");
    setShowNotes(false);

    try {
      toast.info(
        lang === "tr"
          ? `${owner}/${repo} sürümleri taranıyor...`
          : `Fetching releases for ${owner}/${repo}...`
      );

      // Use dedicated internal API route for server-side caching & asset classification
      const localApiUrl = `/api/flasher/github?action=releases&owner=${encodeURIComponent(
        owner
      )}&repo=${encodeURIComponent(repo)}`;

      let resp = await fetch(localApiUrl);
      if (!resp.ok) {
        // Fallback to direct github API via proxy
        const fallbackUrl = `/api/flasher/proxy?url=${encodeURIComponent(
          `https://api.github.com/repos/${owner}/${repo}/releases?per_page=15`
        )}`;
        resp = await fetch(fallbackUrl);
      }

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const releasesData: GitHubReleaseInfo[] = data.releases || data;

      if (!Array.isArray(releasesData) || releasesData.length === 0) {
        toast.warning(
          lang === "tr"
            ? "Bu projede uygun firmware sürümü (.bin/.hex/.uf2) bulunamadı."
            : "No firmware assets (.bin/.hex/.uf2) found for this repository."
        );
        setReleases([]);
        return;
      }

      setReleases(releasesData);
      if (releasesData.length > 0) {
        setSelectedReleaseTag(releasesData[0].tag_name);
        const fwCount = releasesData[0].assets.length;
        toast.success(
          lang === "tr"
            ? `${releasesData[0].tag_name} için ${fwCount} firmware dosyası bulundu.`
            : `Found ${fwCount} firmware assets for ${releasesData[0].tag_name}.`
        );
      }
    } catch (err: any) {
      toast.error(`Releases hatası: ${err.message || err}`);
    } finally {
      setIsLoadingReleases(false);
    }
  };

  // 2. Search GitHub Repositories
  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) {
      toast.error(
        lang === "tr" ? "Lütfen aranacak bir kelime girin." : "Please enter a search query."
      );
      return;
    }

    // If query is an owner/repo path (e.g. "Aircoookie/WLED"), load repo releases directly!
    const directRepoMatch = q.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
    if (directRepoMatch) {
      const owner = directRepoMatch[1];
      const repo = directRepoMatch[2].replace(/\.git$/, "");
      setSelectedRepo({
        id: Date.now(),
        full_name: `${owner}/${repo}`,
        name: repo,
        owner: { login: owner, avatar_url: `https://github.com/${owner}.png` },
        description: null,
        stargazers_count: 0,
        forks_count: 0,
        html_url: `https://github.com/${owner}/${repo}`,
        updated_at: new Date().toISOString(),
      });
      fetchReleasesForRepo(owner, repo);
      return;
    }

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedRepo(null);
    setReleases([]);

    try {
      const searchUrl = `/api/flasher/github?action=search&q=${encodeURIComponent(q)}`;
      const resp = await fetch(searchUrl, { signal: abortController.signal });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const items: GitHubRepoItem[] = data.items || [];
      setSearchResults(items);

      if (items.length > 0) {
        toast.success(
          lang === "tr"
            ? `${items.length} GitHub projesi bulundu.`
            : `Found ${items.length} GitHub projects.`
        );
      } else {
        toast.info(t("github_search_no_results"));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(`GitHub arama hatası: ${err.message || err}`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // If initialQuery provided, auto-trigger search on mount/update
  const handleSearchRef = useRef(handleSearch);
  useEffect(() => {
    handleSearchRef.current = handleSearch;
  });

  const handledInitialQueryRef = useRef<string>("");
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && handledInitialQueryRef.current !== initialQuery.trim()) {
      handledInitialQueryRef.current = initialQuery.trim();
      setSearchQuery(initialQuery.trim());
      handleSearchRef.current(initialQuery.trim());
    }
  }, [initialQuery]);

  // Active Release Details
  const activeRelease = useMemo(() => {
    return releases.find((r) => r.tag_name === selectedReleaseTag) || releases[0] || null;
  }, [releases, selectedReleaseTag]);

  // Filtered Assets inside Active Release
  const filteredAssets = useMemo(() => {
    if (!activeRelease) return [];
    if (!assetFilter.trim()) return activeRelease.assets;
    const q = assetFilter.toLowerCase();
    return activeRelease.assets.filter((a) => a.name.toLowerCase().includes(q));
  }, [activeRelease, assetFilter]);

  // Detect Multi-Part Partition Set in Active Release
  const detectedMultiParts = useMemo(() => {
    if (!activeRelease || activeRelease.assets.length < 2) return null;

    let bootloaderAsset: GitHubReleaseAsset | null = null;
    let partitionTableAsset: GitHubReleaseAsset | null = null;
    let appAsset: GitHubReleaseAsset | null = null;
    let bootApp0Asset: GitHubReleaseAsset | null = null;

    for (const asset of activeRelease.assets) {
      const lower = asset.name.toLowerCase();
      if (!lower.endsWith(".bin")) continue;

      if (!bootloaderAsset && (lower.includes("bootloader") || lower.includes("boot.bin"))) {
        bootloaderAsset = asset;
      } else if (!partitionTableAsset && (lower.includes("partition") || lower.includes("part.bin"))) {
        partitionTableAsset = asset;
      } else if (!bootApp0Asset && (lower.includes("boot_app0") || lower.includes("otadata"))) {
        bootApp0Asset = asset;
      } else if (!appAsset && !lower.includes("spiffs") && !lower.includes("littlefs")) {
        appAsset = asset;
      }
    }

    if (bootloaderAsset && partitionTableAsset && appAsset) {
      return {
        bootloader: bootloaderAsset,
        partitionTable: partitionTableAsset,
        app: appAsset,
        bootApp0: bootApp0Asset,
      };
    }

    return null;
  }, [activeRelease]);

  // Download a single asset and add to flash list
  const handleDownloadAndAddAsset = async (asset: GitHubReleaseAsset) => {
    setDownloadingAssetId(asset.id);
    toast.info(lang === "tr" ? `'${asset.name}' indiriliyor...` : `Downloading '${asset.name}'...`);

    try {
      const data = await downloadBinaryWithFallback(asset.browser_download_url);
      const classified = classifyAsset(asset.name);

      const partition: FlashPartitionFile = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: asset.name,
        offset: classified.offsetNum,
        offsetHex: classified.offsetHex,
        data,
        sizeBytes: data.length,
        sourceType: "url",
        status: "ready",
        progressPercent: 0,
      };

      onLoadPartition(partition);
      inspectBinaryBuffer(asset.name, data);
      toast.success(
        lang === "tr"
          ? `'${asset.name}' (${classified.offsetHex}) flaşlama listesine eklendi!`
          : `'${asset.name}' (${classified.offsetHex}) added to flash list!`
      );
    } catch (err: any) {
      toast.error(`İndirme hatası: ${err.message || err}`);
    } finally {
      setDownloadingAssetId(null);
    }
  };

  // Download All Multi-Parts concurrently and add to flash list
  const handleLoadAllMultiParts = async () => {
    if (!detectedMultiParts) return;
    setIsDownloadingAllParts(true);

    try {
      toast.info(
        lang === "tr"
          ? "Tüm çok parçalı firmware dosyaları indiriliyor..."
          : "Downloading all multi-part firmware files..."
      );

      const partsToFetch: { asset: GitHubReleaseAsset; meta: DetectedPartitionMeta }[] = [
        {
          asset: detectedMultiParts.bootloader,
          meta: classifyAsset(detectedMultiParts.bootloader.name),
        },
        {
          asset: detectedMultiParts.partitionTable,
          meta: classifyAsset(detectedMultiParts.partitionTable.name),
        },
        { asset: detectedMultiParts.app, meta: classifyAsset(detectedMultiParts.app.name) },
      ];

      if (detectedMultiParts.bootApp0) {
        partsToFetch.push({
          asset: detectedMultiParts.bootApp0,
          meta: classifyAsset(detectedMultiParts.bootApp0.name),
        });
      }

      const downloadedParts: FlashPartitionFile[] = [];

      for (let i = 0; i < partsToFetch.length; i++) {
        const item = partsToFetch[i];
        toast.info(
          lang === "tr"
            ? `Parça ${i + 1}/${partsToFetch.length}: ${item.asset.name}`
            : `Part ${i + 1}/${partsToFetch.length}: ${item.asset.name}`
        );
        const data = await downloadBinaryWithFallback(item.asset.browser_download_url);

        downloadedParts.push({
          id: `${Date.now()}-${i}`,
          name: item.asset.name,
          offset: item.meta.offsetNum,
          offsetHex: item.meta.offsetHex,
          data,
          sizeBytes: data.length,
          sourceType: "url",
          status: "ready",
          progressPercent: 0,
        });
      }

      if (onLoadPartitions) {
        onLoadPartitions(downloadedParts);
      } else {
        downloadedParts.forEach((p) => onLoadPartition(p));
      }

      toast.success(
        lang === "tr"
          ? `${downloadedParts.length} parça başarıyla flaşlama tablosuna aktarıldı!`
          : `All ${downloadedParts.length} partition parts added to flash table!`
      );
    } catch (err: any) {
      toast.error(`Çok parçalı indirme hatası: ${err.message || err}`);
    } finally {
      setIsDownloadingAllParts(false);
    }
  };

  // Direct URL Resolve & Download
  const handleResolveDirectUrl = async () => {
    const raw = urlInput.trim();
    if (!raw) {
      toast.error(
        lang === "tr"
          ? "Lütfen geçerli bir URL veya GitHub adresi girin."
          : "Please enter a valid URL or GitHub address."
      );
      return;
    }

    setIsResolvingUrl(true);
    setDetectedFileInfo(null);

    try {
      // If it's a GitHub repo link, load into GitHub explorer mode!
      const ghMatch = raw.match(
        /github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)(?:\/releases|\/tree|\/blob)?/i
      );
      if (
        ghMatch &&
        !raw.includes("raw.githubusercontent.com") &&
        !raw.endsWith(".bin") &&
        !raw.endsWith(".hex") &&
        !raw.endsWith(".uf2")
      ) {
        const owner = ghMatch[1];
        const repo = ghMatch[2].replace(/\.git$/, "");
        setActiveMode("search");
        setSelectedRepo({
          id: Date.now(),
          full_name: `${owner}/${repo}`,
          name: repo,
          owner: { login: owner, avatar_url: `https://github.com/${owner}.png` },
          description: null,
          stargazers_count: 0,
          forks_count: 0,
          html_url: `https://github.com/${owner}/${repo}`,
          updated_at: new Date().toISOString(),
        });
        await fetchReleasesForRepo(owner, repo);
        return;
      }

      // Direct file download
      toast.info(lang === "tr" ? "Firmware indiriliyor..." : "Downloading binary...");
      const data = await downloadBinaryWithFallback(raw);
      const filename = raw.split("/").pop()?.split("?")[0] || "firmware.bin";

      inspectBinaryBuffer(filename, data);
      toast.success(
        lang === "tr"
          ? `Dosya hazır: ${filename} (${(data.length / 1024).toFixed(1)} KB)`
          : `Binary ready: ${filename} (${(data.length / 1024).toFixed(1)} KB)`
      );
    } catch (err: any) {
      toast.error(`URL hatası: ${err.message || err}`);
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleSendDetectedToFlasher = () => {
    if (!detectedFileInfo) return;
    const offset = parseInt(customOffsetHex, 16) || 0;

    const partition: FlashPartitionFile = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: detectedFileInfo.name,
      offset,
      offsetHex: customOffsetHex,
      data: detectedFileInfo.data,
      sizeBytes: detectedFileInfo.sizeBytes,
      sourceType: "url",
      status: "ready",
      progressPercent: 0,
    };

    onLoadPartition(partition);
    toast.success(
      lang === "tr"
        ? `'${detectedFileInfo.name}' (${customOffsetHex}) flaşlama listesine eklendi!`
        : `'${detectedFileInfo.name}' (${customOffsetHex}) added to flash list!`
    );
  };

  // Release Options for FlasherSelect
  const releaseSelectOptions: FlasherSelectOption[] = useMemo(() => {
    return releases.map((r) => {
      const dateStr = r.published_at ? new Date(r.published_at).toLocaleDateString() : "";
      return {
        value: r.tag_name,
        label: r.name ? `${r.tag_name} (${r.name})` : r.tag_name,
        subtitle: `${dateStr} • ${r.assets.length} Assets`,
        badge: r.prerelease
          ? "Pre-release"
          : r.tag_name === releases[0]?.tag_name
          ? lang === "en"
            ? "Latest"
            : "Son Sürüm"
          : undefined,
        icon: Tag,
      };
    });
  }, [releases, lang]);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl relative z-30 focus-within:z-50">
      {/* ══ Header: Title & Dual Mode Pills ═════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              {t("github_releases_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Live GitHub Engine
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === "tr"
                ? "GitHub projelerini arayın, son sürümleri tarayın, .bin dosyalarını ayrıştırıp tek tıkla flaşlayın."
                : "Search GitHub firmware repositories, browse releases, parse .bin files, and flash with 1-click."}
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-white/5 text-xs font-semibold self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeMode === "search"
                ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-violet-400" />
            <span>{t("github_tab_search")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("direct")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeMode === "direct"
                ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>{t("github_tab_direct")}</span>
          </button>
        </div>
      </div>

      {/* ══ Mode 1: GitHub Project Search ═══════════════════════════ */}
      {activeMode === "search" && (
        <div className="flex flex-col gap-3">
          {/* Search Input Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder={t("github_search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 hover:border-violet-400 transition-all shadow-lg active:scale-95 disabled:opacity-40"
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin text-violet-300" />
              ) : (
                <Search className="w-4 h-4 text-violet-300" />
              )}
              <span>{isSearching ? t("github_searching") : t("github_search_btn")}</span>
            </button>
          </div>

          {/* Popular Firmware Preset Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {t("github_popular_tags")}
            </span>
            {POPULAR_FIRMWARE_PRESETS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSearchQuery(item.query);
                  handleSearch(item.query);
                }}
                className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-zinc-900/90 hover:bg-violet-600/20 text-zinc-300 hover:text-violet-200 border border-white/5 hover:border-violet-500/30 transition-all shadow-sm flex items-center gap-1"
                title={`${item.chip} (${item.query})`}
              >
                <span>{item.label}</span>
                <span className="text-zinc-500 text-[9px] font-mono">({item.chip})</span>
              </button>
            ))}
          </div>

          {/* Search Results List (When not yet viewing a single repo) */}
          {!selectedRepo && hasSearched && (
            <div className="flex flex-col gap-2.5 mt-2">
              {searchResults.length === 0 && !isSearching && (
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 text-center text-xs text-zinc-400">
                  {t("github_search_no_results")}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-zinc-900/70 border border-white/5 hover:border-violet-500/40 hover:bg-zinc-850/80 transition-all group"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-300">
                            <GitBranch className="w-3 h-3" />
                          </div>
                          <span
                            className="text-xs font-bold text-zinc-100 group-hover:text-violet-300 transition-colors truncate"
                            title={repo.full_name}
                          >
                            {repo.full_name}
                          </span>
                        </div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all shrink-0"
                          title="GitHub Repo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {repo.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1 text-amber-400/90">
                          <Star className="w-3 h-3" />
                          {repo.stargazers_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <GitFork className="w-3 h-3" />
                          {repo.forks_count.toLocaleString()}
                        </span>
                        {repo.language && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {repo.language}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRepo(repo);
                        const [owner, name] = repo.full_name.split("/");
                        fetchReleasesForRepo(owner, name);
                      }}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-600/15 border border-violet-500/30 hover:bg-violet-600/25 transition-all"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                      <span>{t("github_explore_releases")}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ Releases & Binary Asset Browser (When Repo is Selected) ══ */}
          {selectedRepo && (
            <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 animate-in fade-in">
              {/* Repo Summary & Back Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedRepo(null)}
                    className="p-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all shrink-0"
                    title={t("github_back_to_search")}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-300">
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100 truncate">
                        {selectedRepo.full_name}
                      </span>
                      <a
                        href={selectedRepo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {selectedRepo.description && (
                      <p className="text-[10px] text-zinc-400 truncate max-w-md">
                        {selectedRepo.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Release Selector Dropdown with Smart Upward/Downward Positioning */}
                {isLoadingReleases ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                    <span>{lang === "tr" ? "Sürümler taranıyor..." : "Loading releases..."}</span>
                  </div>
                ) : (
                  releases.length > 0 && (
                    <div className="min-w-[200px] max-w-[280px]">
                      <FlasherSelect
                        options={releaseSelectOptions}
                        value={selectedReleaseTag}
                        onChange={(val) => setSelectedReleaseTag(String(val))}
                        size="sm"
                        placement="auto"
                        ariaLabel="GitHub Release Sürümü"
                      />
                    </div>
                  )
                )}
              </div>

              {/* Release Header & Changelog Preview */}
              {activeRelease && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-300 font-mono">
                        {activeRelease.tag_name}
                      </span>
                      {activeRelease.name && (
                        <span className="text-xs text-zinc-300 font-medium">
                          • {activeRelease.name}
                        </span>
                      )}
                      {activeRelease.prerelease && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pre-release
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>
                        {activeRelease.published_at
                          ? new Date(activeRelease.published_at).toLocaleDateString()
                          : ""}
                      </span>
                      {activeRelease.body && (
                        <button
                          type="button"
                          onClick={() => setShowNotes(!showNotes)}
                          className="text-[10px] text-violet-400 hover:underline ml-1"
                        >
                          {showNotes
                            ? lang === "tr"
                              ? "Notları Gizle"
                              : "Hide Notes"
                            : lang === "tr"
                            ? "Sürüm Notları"
                            : "Release Notes"}
                        </button>
                      )}
                    </div>
                  </div>

                  {showNotes && activeRelease.body && (
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-[11px] font-mono text-zinc-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-none">
                      {activeRelease.body}
                    </div>
                  )}

                  {/* ══ Multi-Part ESP-IDF Detection Highlight Banner ══ */}
                  {detectedMultiParts && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/40 backdrop-blur-xl">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-violet-200">
                            {t("github_multipart_detected")}
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {t("github_multipart_desc")} (Bootloader @0x1000, Partition Table
                            @0x8000, App @0x10000)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isDownloadingAllParts}
                        onClick={handleLoadAllMultiParts}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600/30 hover:bg-violet-600/40 border border-violet-500/50 hover:border-violet-400 shadow-lg transition-all shrink-0 active:scale-95 disabled:opacity-50"
                      >
                        {isDownloadingAllParts ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-300" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-violet-300" />
                        )}
                        <span>
                          {isDownloadingAllParts
                            ? t("github_loading_parts")
                            : t("github_load_all_parts")}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Asset Filter Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder={t("github_filter_assets")}
                        value={assetFilter}
                        onChange={(e) => setAssetFilter(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {filteredAssets.length} / {activeRelease.assets.length} Assets
                    </span>
                  </div>

                  {/* Asset Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {filteredAssets.length === 0 ? (
                      <div className="col-span-full p-4 rounded-xl bg-zinc-950/40 border border-white/5 text-center text-xs text-zinc-500">
                        {lang === "tr"
                          ? "Filtreyle eşleşen firmware dosyası bulunamadı."
                          : "No firmware assets matching this filter."}
                      </div>
                    ) : (
                      filteredAssets.map((asset) => {
                        const classified = classifyAsset(asset.name);
                        const isDownloading = downloadingAssetId === asset.id;

                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 hover:border-violet-500/30 transition-all"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span
                                className="text-xs font-bold text-zinc-200 truncate"
                                title={asset.name}
                              >
                                {asset.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${classified.colorClass}`}
                                >
                                  {classified.role} [{classified.offsetHex}]
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {(asset.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDownloadAndAddAsset(asset)}
                              disabled={isDownloading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-violet-300 bg-violet-600/15 border border-violet-500/30 hover:bg-violet-600/25 transition-all shrink-0 active:scale-95 disabled:opacity-50"
                            >
                              {isDownloading ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-violet-400" />
                              ) : (
                                <Download className="w-3 h-3 text-violet-400" />
                              )}
                              <span>
                                {isDownloading
                                  ? lang === "tr"
                                    ? "Yükleniyor..."
                                    : "Loading..."
                                  : t("github_add_to_flasher")}
                              </span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ Mode 2: Direct URL / Raw Binary Downloader ═══════════════ */}
      {activeMode === "direct" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder={t("smart_url_placeholder")}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleResolveDirectUrl();
                  }
                }}
                className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleResolveDirectUrl}
              disabled={isResolvingUrl || !urlInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 hover:border-violet-400 transition-all shadow-lg active:scale-95 disabled:opacity-40"
            >
              {isResolvingUrl ? (
                <RefreshCw className="w-4 h-4 animate-spin text-violet-300" />
              ) : (
                <Download className="w-4 h-4 text-violet-400" />
              )}
              <span>{isResolvingUrl ? t("analyzing") : t("resolve_and_download")}</span>
            </button>
          </div>
        </div>
      )}

      {/* ══ Binary Inspection & Custom Offset Card ═══════════════════ */}
      {detectedFileInfo && (
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-violet-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="text-xs font-bold text-zinc-100 truncate"
                title={detectedFileInfo.name}
              >
                {detectedFileInfo.name}
              </span>
              <span className="text-[11px] font-mono text-violet-300 mt-0.5">
                {detectedFileInfo.detectedType}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                {lang === "tr" ? "Boyut" : "Size"}:{" "}
                {(detectedFileInfo.sizeBytes / 1024).toFixed(1)} KB (
                {(detectedFileInfo.sizeBytes / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-mono">{t("offset_label")}</span>
              <input
                type="text"
                value={customOffsetHex}
                onChange={(e) => setCustomOffsetHex(e.target.value)}
                className="w-24 bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-center font-mono text-violet-300 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSendDetectedToFlasher}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 transition-all shadow-md active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-violet-300" />
              {t("add_to_flash_table")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
