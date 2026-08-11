"use client";

import React, { useState } from "react";
import {
  Globe,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  FileCode,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { FlashPartitionFile } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";
import { downloadBinaryWithFallback } from "@/lib/flasher/binary-downloader";

interface GitHubReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
  download_count: number;
  content_type: string;
}

interface GitHubReleaseInfo {
  tag_name: string;
  name: string;
  body: string;
  assets: GitHubReleaseAsset[];
}

interface SmartUrlFlasherProps {
  onLoadPartition: (partition: FlashPartitionFile) => void;
  lang?: Language;
}

export const SmartUrlFlasher: React.FC<SmartUrlFlasherProps> = ({
  onLoadPartition,
  lang = "tr",
}) => {
  const t = useTranslation(lang);
  const [urlInput, setUrlInput] = useState("");
  const [customOffsetHex, setCustomOffsetHex] = useState("0x0");
  const [isLoading, setIsLoading] = useState(false);
  const [gitHubReleases, setGitHubReleases] = useState<GitHubReleaseInfo | null>(null);
  const [detectedFileInfo, setDetectedFileInfo] = useState<{
    name: string;
    sizeBytes: number;
    detectedType: string;
    suggestedOffsetHex: string;
    data: Uint8Array;
  } | null>(null);

  // Auto-detect & suggest offset based on binary inspection
  const analyzeBinary = (filename: string, data: Uint8Array) => {
    let detectedType = lang === "tr" ? "Bilinmeyen Binary (.bin)" : "Generic Binary Image (.bin)";
    let suggestedOffset = 0x0;
    const lowerName = filename.toLowerCase();

    // Check Intel HEX
    if (lowerName.endsWith(".hex") || (data.length > 0 && data[0] === 0x3a)) {
      detectedType = "Intel HEX (Arduino / AVR / STK500)";
      suggestedOffset = 0x0;
    }
    // Check UF2
    else if (
      lowerName.endsWith(".uf2") ||
      (data.length >= 8 &&
        data[0] === 0x55 &&
        data[1] === 0x46 &&
        data[2] === 0x32 &&
        data[3] === 0x0a)
    ) {
      detectedType = lang === "tr" ? "UF2 Paket İmajı (RP2040 Pico)" : "UF2 Firmware Image (RP2040 Pico)";
      suggestedOffset = 0x0;
    }
    // Check ESP ROM magic byte 0xE9
    else if (data.length > 4 && data[0] === 0xe9) {
      const spiMode = data[2];
      const spiSizeFreq = data[3];
      detectedType = `ESP Bootable ROM (SPI: 0x${spiMode.toString(16)}, Flash: 0x${spiSizeFreq.toString(16)})`;

      if (lowerName.includes("bootloader")) {
        suggestedOffset = lowerName.includes("s3") || lowerName.includes("c3") ? 0x0 : 0x1000;
      } else if (lowerName.includes("partition") || lowerName.includes("part")) {
        suggestedOffset = 0x8000;
      } else if (lowerName.includes("factory") || lowerName.includes("merged") || lowerName.includes("all")) {
        suggestedOffset = 0x0;
      } else {
        suggestedOffset = 0x10000;
      }
    } else {
      if (lowerName.includes("spiffs") || lowerName.includes("littlefs")) {
        detectedType = "LittleFS / SPIFFS Filesystem";
        suggestedOffset = 0x290000;
      } else if (lowerName.includes("factory") || lowerName.includes("full")) {
        detectedType = lang === "tr" ? "Birleşik Fabrika İmajı (Factory Image)" : "Unified Factory Image";
        suggestedOffset = 0x0;
      } else {
        suggestedOffset = 0x10000;
      }
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

  const handleResolveAndDownload = async () => {
    const rawUrl = urlInput.trim();
    if (!rawUrl) {
      toast.error(lang === "tr" ? "Lütfen geçerli bir URL veya GitHub repo linki girin." : "Enter a valid URL or GitHub repo link.");
      return;
    }

    setIsLoading(true);
    setGitHubReleases(null);
    setDetectedFileInfo(null);

    try {
      // 1. Check if GitHub Repository URL (e.g. github.com/owner/repo)
      const githubMatch = rawUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/releases|\/tree|\/blob)?/i);
      if (githubMatch && !rawUrl.includes("raw.githubusercontent.com") && !rawUrl.endsWith(".bin") && !rawUrl.endsWith(".hex") && !rawUrl.endsWith(".uf2")) {
        const owner = githubMatch[1];
        const repo = githubMatch[2].replace(/\.git$/, "");

        toast.info(lang === "tr" ? `GitHub Releases taranıyor: ${owner}/${repo}...` : `Scanning GitHub Releases: ${owner}/${repo}...`);
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const resp = await fetch(apiUrl);
        if (!resp.ok) {
          throw new Error(`GitHub API ${resp.status} - Release not found.`);
        }
        const releaseData: GitHubReleaseInfo = await resp.json();

        // Filter firmware assets (.bin, .hex, .uf2, .zip)
        const fwAssets = releaseData.assets.filter(
          (a) =>
            a.name.endsWith(".bin") ||
            a.name.endsWith(".hex") ||
            a.name.endsWith(".uf2") ||
            a.name.endsWith(".zip")
        );

        setGitHubReleases({
          ...releaseData,
          assets: fwAssets.length > 0 ? fwAssets : releaseData.assets,
        });
        toast.success(lang === "tr" ? `${releaseData.tag_name} için ${fwAssets.length} firmware dosyası bulundu!` : `Found ${fwAssets.length} firmware assets for ${releaseData.tag_name}!`);
        setIsLoading(false);
        return;
      }

      // 2. Direct URL Download
      let targetUrl = rawUrl;
      if (targetUrl.includes("github.com") && targetUrl.includes("/blob/")) {
        targetUrl = targetUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
      }

      toast.info(lang === "tr" ? "Firmware dosyası indiriliyor..." : "Downloading firmware binary...");
      const data = await downloadBinaryWithFallback(targetUrl);
      const filename = targetUrl.split("/").pop()?.split("?")[0] || "downloaded_firmware.bin";

      analyzeBinary(filename, data);
      toast.success(lang === "tr" ? `Dosya analiz edildi: ${filename} (${(data.length / 1024).toFixed(1)} KB)` : `Binary analyzed: ${filename} (${(data.length / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      toast.error(lang === "tr" ? `URL yükleme hatası: ${err.message || err}` : `URL load error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAsset = async (asset: GitHubReleaseAsset) => {
    setIsLoading(true);
    toast.info(`${asset.name}...`);
    try {
      const data = await downloadBinaryWithFallback(asset.browser_download_url);
      analyzeBinary(asset.name, data);
      toast.success(`${asset.name} ✓`);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToFlasher = () => {
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
    toast.success(lang === "tr" ? `'${detectedFileInfo.name}' (${customOffsetHex}) flaşlama listesine eklendi!` : `'${detectedFileInfo.name}' (${customOffsetHex}) added to flash list!`);
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              {t("smart_url_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                {t("smart_url_badge")}
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t("smart_url_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t("smart_url_placeholder")}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleResolveAndDownload();
              }
            }}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleResolveAndDownload}
          disabled={isLoading || !urlInput.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 hover:border-violet-400 transition-all shadow-lg active:scale-95 disabled:opacity-40"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-violet-300" />
          ) : (
            <Download className="w-4 h-4 text-violet-400" />
          )}
          <span>{isLoading ? t("analyzing") : t("resolve_and_download")}</span>
        </button>
      </div>

      {/* GitHub Releases Browser */}
      {gitHubReleases && (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-violet-400" />
              {t("github_latest_release")} <code className="text-violet-300">{gitHubReleases.tag_name}</code>
            </span>
            <span className="text-[11px] text-zinc-400">
              {gitHubReleases.assets.length} Assets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {gitHubReleases.assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 hover:border-violet-500/30 transition-all"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-zinc-200 truncate" title={asset.name}>
                    {asset.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {(asset.size / 1024).toFixed(1)} KB • {asset.download_count} downloads
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadAsset(asset)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-all shrink-0 active:scale-95"
                >
                  {lang === "tr" ? "Seç & Yükle" : "Select & Load"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Binary Inspection Card */}
      {detectedFileInfo && (
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-violet-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-100 truncate" title={detectedFileInfo.name}>
                {detectedFileInfo.name}
              </span>
              <span className="text-[11px] font-mono text-violet-300 mt-0.5">
                {detectedFileInfo.detectedType}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                {lang === "tr" ? "Boyut" : "Size"}: {(detectedFileInfo.sizeBytes / 1024).toFixed(1)} KB (
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
              onClick={handleSendToFlasher}
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
