"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Network,
  Activity,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Wifi,
  Cpu,
  Server,
  Zap,
  Compass,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface IPData {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  isp: string;
  loc: string;
  tlsVersion: string;
  httpVersion: string;
  userAgent: string;
}

interface LatencyTarget {
  name: string;
  host: string;
  url: string;
  pingMs: number | null;
  status: "idle" | "testing" | "done" | "error";
}

export function IPNetworkClient() {
  const [data, setData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [targets, setTargets] = useState<LatencyTarget[]>([
    { name: "Cloudflare DNS", host: "1.1.1.1", url: "https://1.1.1.1/cdn-cgi/trace", pingMs: null, status: "idle" },
    { name: "Google DoH", host: "dns.google", url: "https://dns.google/resolve?name=google.com", pingMs: null, status: "idle" },
    { name: "VatComply API", host: "api.vatcomply.com", url: "https://api.vatcomply.com/geolocate", pingMs: null, status: "idle" },
    { name: "GitHub CDN", host: "github.com", url: "https://github.com", pingMs: null, status: "idle" },
  ]);

  const fetchIPInfo = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Cloudflare trace endpoint
      const traceRes = await fetch("https://1.1.1.1/cdn-cgi/trace");
      const traceText = await traceRes.text();
      const lines = traceText.split("\n");
      const parsedTrace: Record<string, string> = {};
      lines.forEach((line) => {
        const [k, v] = line.split("=");
        if (k && v) parsedTrace[k] = v;
      });

      // 2. Fetch geo metadata from VatComply
      let geoData: any = {};
      try {
        const geoRes = await fetch("https://api.vatcomply.com/geolocate");
        geoData = await geoRes.json();
      } catch (err) {
        console.warn("Geo fallback", err);
      }

      setData({
        ip: parsedTrace.ip || geoData.ip || "127.0.0.1",
        country: geoData.name || parsedTrace.loc || "Bilinmiyor",
        country_code: geoData.country_code || parsedTrace.loc || "TR",
        city: geoData.city || "Bilinmiyor",
        isp: geoData.isp || "Bilinmiyor / ISP",
        loc: `${geoData.latitude || 0}, ${geoData.longitude || 0}`,
        tlsVersion: parsedTrace.tls || "TLS v1.3",
        httpVersion: parsedTrace.h || "http/2",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : parsedTrace.u || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("IP bilgileri alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const runLatencyTests = async () => {
    setTargets((prev) => prev.map((t) => ({ ...t, status: "testing", pingMs: null })));

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const start = performance.now();
      try {
        await fetch(target.url, { mode: "no-cors", cache: "no-store" });
        const elapsed = Math.round(performance.now() - start);
        setTargets((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, pingMs: elapsed, status: "done" } : t))
        );
      } catch (e) {
        setTargets((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: "error" } : t))
        );
      }
    }
  };

  useEffect(() => {
    fetchIPInfo();
    runLatencyTests();
  }, []);

  const handleCopyIP = () => {
    if (data?.ip) {
      navigator.clipboard.writeText(data.ip);
      setCopied(true);
      toast.success("IP Adresi panoya kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-xl mb-3">
          <Globe className="h-3.5 w-3.5 text-cyan-400" />
          <span>Zero-Auth Network Diagnostics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          IP, Geolocation & Ağ Latency Analizörü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          IP adresinizi, coğrafi konumunuzu, ISP ve bağlantı gecikme sürelerini %100 tarayıcı tarafında anında analiz edin.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: IP Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30">
                  <Network className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">İstemci IP Adresi & Bağlantı</h2>
                  <p className="text-xs text-zinc-400">Canlı ağ parametreleri ve protokol tanılama</p>
                </div>
              </div>

              <button
                onClick={() => {
                  fetchIPInfo();
                  runLatencyTests();
                }}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.1] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
                <span>Yenile</span>
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-zinc-500 text-sm">
                Ağ bilgileri sorgulanıyor...
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Big IP Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5 backdrop-blur-xl">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Tespit Edilen IP Adresiniz</span>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-mono mt-0.5">
                      {data.ip}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyIP}
                    className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition-all shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-cyan-300" />}
                    <span>{copied ? "Kopyalandı" : "IP Kopyala"}</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                      <Compass className="h-4 w-4 text-indigo-400" />
                      <span>Ülke & Şehir</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {data.city}, {data.country} ({data.country_code})
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                      <Wifi className="h-4 w-4 text-emerald-400" />
                      <span>İnternet Servis Sağlayıcısı (ISP)</span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {data.isp}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                      <ShieldCheck className="h-4 w-4 text-cyan-400" />
                      <span>TLS / Şifreleme Protokolü</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {data.tlsVersion}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>HTTP Protokol Sürümü</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {data.httpVersion}
                    </div>
                  </div>
                </div>

                {/* User Agent */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span>User-Agent İmzası</span>
                  </div>
                  <div className="text-xs font-mono text-zinc-300 break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
                    {data.userAgent}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Col: Latency Ping Tester */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                  <Activity className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">CDN & Sunucu Latency</h3>
                  <p className="text-xs text-zinc-400">Canlı ping süreleri (ms)</p>
                </div>
              </div>

              <button
                onClick={runLatencyTests}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 transition-all"
                title="Yeniden Ping At"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {targets.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[11px] font-mono text-zinc-500">{t.host}</div>
                  </div>

                  <div className="text-right">
                    {t.status === "testing" ? (
                      <span className="text-xs font-semibold text-amber-400 animate-pulse">Test ediliyor...</span>
                    ) : t.pingMs !== null ? (
                      <span
                        className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded border ${
                          t.pingMs < 60
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : t.pingMs < 150
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                        }`}
                      >
                        {t.pingMs} ms
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">Hata</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
