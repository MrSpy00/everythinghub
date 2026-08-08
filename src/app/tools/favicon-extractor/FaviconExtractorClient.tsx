"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Globe,
  Sparkles,
  ExternalLink,
  Search,
  Code,
} from "lucide-react";
import { toast } from "sonner";

interface FaviconVariant {
  title: string;
  size: string;
  url: string;
}

export function FaviconExtractorClient() {
  const [domainInput, setDomainInput] = useState<string>("github.com");
  const [activeDomain, setActiveDomain] = useState<string>("github.com");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExtract = () => {
    if (!domainInput.trim()) {
      toast.error("Lütfen geçerli bir web sitesi veya domain girin.");
      return;
    }
    const cleaned = domainInput.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    setActiveDomain(cleaned);
    toast.success(`${cleaned} için faviconlar çıkarıldı!`);
  };

  const variants: FaviconVariant[] = [
    {
      title: "Google Ultra HD Favicon (256x256)",
      size: "256x256",
      url: `https://www.google.com/s2/favicons?domain=${activeDomain}&sz=256`,
    },
    {
      title: "Icon Horse Orijinal Favicon",
      size: "Orijinal",
      url: `https://icon.horse/icon/${activeDomain}`,
    },
    {
      title: "Google Medium Favicon (128x128)",
      size: "128x128",
      url: `https://www.google.com/s2/favicons?domain=${activeDomain}&sz=128`,
    },
    {
      title: "DuckDuckGo Favicon",
      size: "64x64",
      url: `https://icons.duckduckgo.com/ip3/${activeDomain}.ico`,
    },
  ];

  const htmlSnippet = `<link rel="icon" type="image/png" sizes="256x256" href="https://www.google.com/s2/favicons?domain=${activeDomain}&sz=256" />`;

  const copyHTML = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedCode(true);
    toast.success("HTML Kodu panoya kopyalandı!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Bulletproof Cross-Origin Canvas/Blob download
  const handleDownloadImage = async (imgUrl: string, title: string) => {
    setDownloading(title);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || 128;
        canvas.height = img.height || 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `favicon-${activeDomain}-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
          a.click();
          toast.success("Favicon başarıyla indirildi!");
        }
        setDownloading(null);
      };
      img.onerror = () => {
        // Fallback open in new tab if CORS prevents canvas export
        window.open(imgUrl, "_blank");
        setDownloading(null);
      };
      img.src = imgUrl;
    } catch {
      window.open(imgUrl, "_blank");
      setDownloading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xl mb-3">
          <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
          <span>Zero-Auth Asset Extractor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Site Favicon & Logo İndirici
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Herhangi bir web sitesinin HD favicon ve logolarını yüksek çözünürlükte çıkarın, önizleyin ve indirin.
        </p>
      </div>

      {/* Input Box */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExtract()}
              placeholder="Örn: github.com, spotify.com, everythinghub.com.tr"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleExtract}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-6 py-3 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all shrink-0 w-full sm:w-auto"
          >
            <Search className="h-4 w-4 text-amber-300" />
            <span>Favicon Çıkar</span>
          </button>
        </div>
      </div>

      {/* Extracted Favicons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {variants.map((variant) => (
          <div
            key={variant.title}
            className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl flex flex-col items-center justify-between gap-4 text-center group hover:border-amber-500/30 transition-all"
          >
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white">{variant.title}</span>
              <span className="text-[10px] font-mono font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                {variant.size}
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={variant.url}
                alt={variant.title}
                className="h-16 w-16 object-contain group-hover:scale-110 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            {/* Direct Download & New Tab Buttons */}
            <div className="flex items-center gap-2 w-full pt-2">
              <button
                onClick={() => handleDownloadImage(variant.url, variant.title)}
                disabled={downloading === variant.title}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-amber-300" />
                <span>{downloading === variant.title ? "İndiriliyor..." : "Resmi İndir"}</span>
              </button>
              <a
                href={variant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
                title="Yeni Sekmede Aç"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* HTML Meta Tag Snippet Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">HTML Meta Etiketi</h2>
          </div>
          <button
            onClick={copyHTML}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
          >
            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCode ? "Kopyalandı" : "Kodu Kopyala"}</span>
          </button>
        </div>
        <pre className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-amber-300 overflow-x-auto">
          {htmlSnippet}
        </pre>
      </div>
    </div>
  );
}
