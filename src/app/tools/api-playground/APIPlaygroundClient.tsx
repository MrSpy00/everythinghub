"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Send,
  Copy,
  Check,
  Code2,
  Globe,
  Sparkles,
  ExternalLink,
  Layers,
  Database,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";
import { PUBLIC_APIS_CATALOG, type PublicAPIItem } from "@/lib/public-apis-catalog";

export function APIPlaygroundClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // HTTP Client State
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">("GET");
  const [url, setUrl] = useState<string>("https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code,wind_speed_10m");
  const [headers, setHeaders] = useState<string>('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState<string>("{\n  \n}");
  
  // Response State
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>("");
  const [latency, setLatency] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const categories = [
    { id: "all", label: "Tüm API'ler" },
    { id: "weather", label: "Hava & Çevre" },
    { id: "crypto", label: "Kripto & Web3" },
    { id: "finance", label: "Finans & Döviz" },
    { id: "countries", label: "Ülkeler & Coğrafya" },
    { id: "dictionary", label: "Dil & Sözlük" },
    { id: "books", label: "Kitap & Kütüphane" },
    { id: "space", label: "Uzay & NASA" },
    { id: "facts", label: "Trivia & Bilgi" },
    { id: "dev", label: "Geliştirici & Mock" },
  ];

  const filteredCatalog = PUBLIC_APIS_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const loadPreset = (item: PublicAPIItem) => {
    setMethod(item.method);
    setUrl(item.endpoint);
    setResponseData(null);
    setResponseStatus(null);
    toast.success(`${item.name} şablonu yüklendi!`);
  };

  const handleSendRequest = async () => {
    if (!url.trim()) {
      toast.error("Lütfen geçerli bir URL adresi girin.");
      return;
    }

    setLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    const startTime = performance.now();

    try {
      let parsedHeaders: Record<string, string> = {};
      try {
        if (headers.trim()) {
          parsedHeaders = JSON.parse(headers);
        }
      } catch (err) {
        toast.error("Headers JSON formatı hatalı.");
        setLoading(false);
        return;
      }

      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText || (res.ok ? "OK" : "Error"));

      const rawText = await res.text();
      const bytes = new Blob([rawText]).size;
      setResponseSize((bytes / 1024).toFixed(2) + " KB");

      try {
        const json = JSON.parse(rawText);
        setResponseData(JSON.stringify(json, null, 2));
      } catch {
        setResponseData(rawText);
      }

      if (res.ok) {
        toast.success(`İstek başarılı (${res.status} ${res.statusText || "OK"}) — ${elapsed}ms`);
      } else {
        toast.warning(`Sunucu yanıtı: ${res.status}`);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setResponseStatus(0);
      setResponseStatusText("Ağ / CORS Hatası");
      setResponseData(`İstek gerçekleştirilemedi.\nOlası nedenler:\n1. Hedef sunucu CORS kısıtlamasına sahip olabilir.\n2. URL adresi geçersiz veya çevrimdışı olabilir.\n\nHata Detayı: ${err.message || String(err)}`);
      toast.error("İstek tamamlanamadı (CORS veya Ağ Hatası).");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseData) {
      navigator.clipboard.writeText(responseData);
      setCopied(true);
      toast.success("Yanıt panoya kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateCurl = () => {
    let curl = `curl -X ${method} "${url}"`;
    try {
      const parsed = JSON.parse(headers);
      Object.entries(parsed).forEach(([k, v]) => {
        curl += ` \\\n  -H "${k}: ${v}"`;
      });
    } catch {}
    if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
      curl += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
    }
    return curl;
  };

  const handleCopyCurl = () => {
    const curl = generateCurl();
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    toast.success("cURL komutu kopyalandı!");
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span>Zero-Auth API Studio & Sandbox</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Canlı API Test Konsolu & Açık API Kataloğu
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Kayıt, kredi kartı veya API anahtarı gerektirmeyen 100% ücretsiz açık API&apos;leri tarayıcıda canlı test edin, latency sürelerini görün ve cURL kodlarını alın.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Presets & Public APIs Catalog */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-5 shadow-2xl flex flex-col h-[760px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Sıfır-Auth API Kataloğu</h2>
              </div>
              <span className="text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                {filteredCatalog.length} Servis
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="API ara (örn: hava, crypto, btc, ülkeler)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadPreset(item)}
                  className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                          {item.method}
                        </span>
                        <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="truncate max-w-[240px] opacity-70">{item.endpoint}</span>
                    <a
                      href={item.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      <span>Docs</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Interactive HTTP Request & Response Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col h-[760px]">
            {/* Request Bar */}
            <div className="space-y-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <select
                  value={method}
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs font-bold font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />

                <button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all disabled:opacity-50"
                >
                  <Send className={`h-3.5 w-3.5 ${loading ? "animate-pulse" : ""}`} />
                  <span>{loading ? "Gönderiliyor..." : "Gönder"}</span>
                </button>
              </div>

              {/* Request Options Accordion / Controls */}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div className="flex gap-2">
                  <span className="font-mono text-[11px] text-zinc-500">Headers & Body Yapılandırması</span>
                </div>
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors font-mono"
                >
                  {copiedCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>cURL Kopyala</span>
                </button>
              </div>

              {["POST", "PUT", "PATCH"].includes(method) && (
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Request Body (JSON)</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Response Console */}
            <div className="flex-1 flex flex-col pt-3 min-h-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sunucu Yanıtı</span>
                  </span>

                  {responseStatus !== null && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          responseStatus >= 200 && responseStatus < 300
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {responseStatus} {responseStatusText}
                      </span>
                      {latency !== null && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="h-3 w-3" />
                          <span>{latency}ms</span>
                        </span>
                      )}
                      {responseSize && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <HardDrive className="h-3 w-3" />
                          <span>{responseSize}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {responseData && (
                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Kopyalandı" : "Yanıtı Kopyala"}</span>
                  </button>
                )}
              </div>

              {/* Response Body Box */}
              <div className="flex-1 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-zinc-300 overflow-auto scrollbar-thin scrollbar-thumb-white/10 relative">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <span className="text-xs">API isteği yapılıyor...</span>
                  </div>
                ) : responseData ? (
                  <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                    {responseData}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center space-y-2">
                    <Terminal className="h-8 w-8 text-zinc-700" />
                    <p className="text-xs max-w-sm">
                      Sol panelden bir API şablonu seçin veya özel bir endpoint URL&apos;si girip &quot;Gönder&quot; butonuna basın.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
