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
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface IPSourceResult {
  source: string;
  ip: string;
  country?: string;
  city?: string;
  isp?: string;
  latencyMs?: number;
  status: "success" | "failed" | "loading";
}

interface LatencyTarget {
  name: string;
  host: string;
  url: string;
  pingMs: number | null;
  status: "idle" | "testing" | "done" | "error";
}

export function IPNetworkClient() {
  const [primaryIP, setPrimaryIP] = useState<string>("127.0.0.1");
  const [geoCity, setGeoCity] = useState<string>("İstanbul");
  const [geoCountry, setGeoCountry] = useState<string>("Türkiye (TR)");
  const [ispName, setIspName] = useState<string>("Bilinmiyor / ISP");
  const [coloName, setColoName] = useState<string>("IST");
  const [tlsVersion, setTlsVersion] = useState<string>("TLS v1.3");
  const [httpVersion, setHttpVersion] = useState<string>("http/2 - http/3");
  const [userAgent, setUserAgent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Multi-source redundant results
  const [sources, setSources] = useState<IPSourceResult[]>([
    { source: "Cloudflare Edge Trace", ip: "...", status: "loading" },
    { source: "IPify Public API", ip: "...", status: "loading" },
    { source: "VatComply Geolocation", ip: "...", status: "loading" },
    { source: "EverythingHub Edge Route", ip: "...", status: "loading" },
  ]);

  const [targets, setTargets] = useState<LatencyTarget[]>([
    { name: "Cloudflare (1.1.1.1)", host: "1.1.1.1", url: "https://1.1.1.1/cdn-cgi/trace", pingMs: null, status: "idle" },
    { name: "Google DoH", host: "dns.google", url: "https://dns.google/resolve?name=google.com", pingMs: null, status: "idle" },
    { name: "Fastly CDN", host: "fastly.net", url: "https://www.fastly.com", pingMs: null, status: "idle" },
    { name: "GitHub Network", host: "github.com", url: "https://github.com", pingMs: null, status: "idle" },
    { name: "VatComply Endpoint", host: "vatcomply.com", url: "https://api.vatcomply.com/geolocate", pingMs: null, status: "idle" },
  ]);

  // Robust Multi-Source Fetch Chain
  const fetchAllIPSources = async () => {
    setLoading(true);
    let resolvedIP = "";

    // 1. Cloudflare Trace
    try {
      const start = performance.now();
      const cfRes = await fetch("https://1.1.1.1/cdn-cgi/trace", { cache: "no-store" });
      const cfText = await cfRes.text();
      const elapsed = Math.round(performance.now() - start);
      const parsed: Record<string, string> = {};
      cfText.split("\n").forEach((line) => {
        const [k, v] = line.split("=");
        if (k && v) parsed[k] = v;
      });

      if (parsed.ip) {
        resolvedIP = parsed.ip;
        setPrimaryIP(parsed.ip);
        if (parsed.loc) setGeoCountry(parsed.loc);
        if (parsed.colo) setColoName(parsed.colo);
        if (parsed.tls) setTlsVersion(parsed.tls);
        if (parsed.h) setHttpVersion(parsed.h);

        setSources((prev) =>
          prev.map((s) =>
            s.source === "Cloudflare Edge Trace"
              ? { ...s, ip: parsed.ip, latencyMs: elapsed, status: "success" }
              : s
          )
        );
      }
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.source === "Cloudflare Edge Trace" ? { ...s, status: "failed" } : s
        )
      );
    }

    // 2. IPify Public API
    try {
      const start = performance.now();
      const ipifyRes = await fetch("https://api64.ipify.org?format=json", { cache: "no-store" });
      const ipifyData = await ipifyRes.json();
      const elapsed = Math.round(performance.now() - start);
      if (ipifyData.ip) {
        if (!resolvedIP) {
          resolvedIP = ipifyData.ip;
          setPrimaryIP(ipifyData.ip);
        }
        setSources((prev) =>
          prev.map((s) =>
            s.source === "IPify Public API"
              ? { ...s, ip: ipifyData.ip, latencyMs: elapsed, status: "success" }
              : s
          )
        );
      }
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.source === "IPify Public API" ? { ...s, status: "failed" } : s
        )
      );
    }

    // 3. VatComply Geolocation
    try {
      const start = performance.now();
      const vatRes = await fetch("https://api.vatcomply.com/geolocate", { cache: "no-store" });
      const vatData = await vatRes.json();
      const elapsed = Math.round(performance.now() - start);
      if (vatData.ip) {
        if (!resolvedIP) {
          resolvedIP = vatData.ip;
          setPrimaryIP(vatData.ip);
        }
        if (vatData.name) setGeoCountry(`${vatData.name} (${vatData.country_code || "TR"})`);
        if (vatData.city) setGeoCity(vatData.city);
        if (vatData.isp) setIspName(vatData.isp);

        setSources((prev) =>
          prev.map((s) =>
            s.source === "VatComply Geolocation"
              ? { ...s, ip: vatData.ip, country: vatData.name, city: vatData.city, latencyMs: elapsed, status: "success" }
              : s
          )
        );
      }
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.source === "VatComply Geolocation" ? { ...s, status: "failed" } : s
        )
      );
    }

    // 4. Internal Edge Route (/api/diagnostics/ip)
    try {
      const start = performance.now();
      const internalRes = await fetch("/api/diagnostics/ip", { cache: "no-store" });
      const internalData = await internalRes.json();
      const elapsed = Math.round(performance.now() - start);
      if (internalData.ip) {
        if (!resolvedIP || resolvedIP === "127.0.0.1") {
          setPrimaryIP(internalData.ip);
        }
        if (internalData.colo) setColoName(internalData.colo);
        setSources((prev) =>
          prev.map((s) =>
            s.source === "EverythingHub Edge Route"
              ? { ...s, ip: internalData.ip, country: internalData.country, latencyMs: elapsed, status: "success" }
              : s
          )
        );
      }
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.source === "EverythingHub Edge Route" ? { ...s, status: "failed" } : s
        )
      );
    }

    if (typeof navigator !== "undefined") {
      setUserAgent(navigator.userAgent);
    }
    setLoading(false);
  };

  // Run Latency Benchmarks
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
      } catch {
        setTargets((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: "error" } : t))
        );
      }
    }
  };

  useEffect(() => {
    fetchAllIPSources();
    runLatencyTests();
  }, []);

  const handleCopyIP = () => {
    if (primaryIP) {
      navigator.clipboard.writeText(primaryIP);
      setCopied(true);
      toast.success("IP adresi panoya kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-xl mb-3">
          <Globe className="h-3.5 w-3.5 text-cyan-400" />
          <span>Multi-Source Redundant Network Diagnostics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          IP, Geolocation & Ağ Latency Analizörü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          IP adresinizi, coğrafi konumunuzu, ISP sağlayıcınızı ve CDN gecikme sürelerini 4 bağımsız kaynaktan canlı doğrulayın.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Primary IP Card & Evidence Sources */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big IP Hero Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Doğrulanmış Genel IP Adresi</h2>
              </div>
              <button
                onClick={fetchAllIPSources}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Yenile</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {primaryIP}
                </div>
                <div className="text-xs text-cyan-300 mt-1 flex items-center gap-2">
                  <span>{geoCity}, {geoCountry}</span>
                  <span className="opacity-50">|</span>
                  <span className="font-mono">Colo: {coloName}</span>
                </div>
              </div>

              <button
                onClick={handleCopyIP}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] border border-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/[0.15] transition-all shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Kopyalandı" : "IP Kopyala"}</span>
              </button>
            </div>

            {/* Redundant Sources Evidence */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <Server className="h-3.5 w-3.5 text-cyan-400" />
                <span>Çoklu Kaynak Kanıt Doğrulaması (Multi-Source Proof)</span>
              </h3>

              <div className="space-y-2">
                {sources.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      {s.status === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : s.status === "loading" ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="text-zinc-300 font-semibold">{s.source}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-cyan-300 font-bold">{s.ip}</span>
                      {s.latencyMs && (
                        <span className="text-[10px] text-zinc-500">{s.latencyMs}ms</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Network Protocol Details & Latency Benchmarks */}
        <div className="lg:col-span-5 space-y-6">
          {/* Protocol Details */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ağ & Protokol Detayları</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-zinc-400">ISP Sağlayıcı:</span>
                <span className="text-white font-semibold">{ispName}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-zinc-400">Şifreleme:</span>
                <span className="text-emerald-400 font-bold">{tlsVersion}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-zinc-400">HTTP Protokolü:</span>
                <span className="text-cyan-300">{httpVersion}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-zinc-400">Uç Nokta (Colo):</span>
                <span className="text-purple-300 font-bold">{coloName}</span>
              </div>
            </div>
          </div>

          {/* Latency Benchmarks */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Küresel CDN Ping Testi</span>
              </h3>
              <button
                onClick={runLatencyTests}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Testi Tekrarla
              </button>
            </div>

            <div className="space-y-2">
              {targets.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono"
                >
                  <span className="text-zinc-300">{t.name}</span>
                  {t.status === "testing" ? (
                    <span className="text-cyan-400 animate-pulse text-[11px]">Ölçülüyor...</span>
                  ) : t.pingMs !== null ? (
                    <span
                      className={`font-bold ${
                        t.pingMs < 50
                          ? "text-emerald-400"
                          : t.pingMs < 150
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {t.pingMs} ms
                    </span>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
