"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Search,
  ShieldCheck,
  Copy,
  Check,
  Globe,
  RefreshCw,
  Clock,
  ArrowRight,
  Database,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface DNSRecord {
  name: string;
  type: number;
  typeName: string;
  TTL: number;
  data: string;
}

interface ResolverResult {
  resolver: string;
  records: DNSRecord[];
  status: string;
  dnssec: boolean;
  latencyMs: number;
}

const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA", "SRV"];

export function DNSLookupClient() {
  const [domain, setDomain] = useState("everythinghub.com.tr");
  const [recordType, setRecordType] = useState("A");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResolverResult[]>([]);
  const [copiedData, setCopiedData] = useState<string | null>(null);

  const handleLookup = async (targetDomain = domain, targetType = recordType) => {
    if (!targetDomain.trim()) {
      toast.error("Lütfen geçerli bir alan adı girin.");
      return;
    }

    setLoading(true);
    setResults([]);

    const cleanDomain = targetDomain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const resolverList: ResolverResult[] = [];

    // 1. Cloudflare DoH
    try {
      const start = performance.now();
      const cfRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${targetType}`, {
        headers: { accept: "application/dns-json" },
      });
      const cfData = await cfRes.json();
      const elapsed = Math.round(performance.now() - start);

      const parsedRecords: DNSRecord[] = (cfData.Answer || []).map((ans: any) => ({
        name: ans.name,
        type: ans.type,
        typeName: targetType,
        TTL: ans.TTL,
        data: ans.data,
      }));

      resolverList.push({
        resolver: "Cloudflare DoH (1.1.1.1)",
        records: parsedRecords,
        status: cfData.Status === 0 ? "NOERROR" : `Status ${cfData.Status}`,
        dnssec: cfData.AD ?? false,
        latencyMs: elapsed,
      });
    } catch {
      resolverList.push({
        resolver: "Cloudflare DoH (1.1.1.1)",
        records: [],
        status: "Bağlantı Hatası",
        dnssec: false,
        latencyMs: 0,
      });
    }

    // 2. Google DoH
    try {
      const start = performance.now();
      const gRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=${targetType}`);
      const gData = await gRes.json();
      const elapsed = Math.round(performance.now() - start);

      const parsedRecords: DNSRecord[] = (gData.Answer || []).map((ans: any) => ({
        name: ans.name,
        type: ans.type,
        typeName: targetType,
        TTL: ans.TTL,
        data: ans.data,
      }));

      resolverList.push({
        resolver: "Google Public DoH (8.8.8.8)",
        records: parsedRecords,
        status: gData.Status === 0 ? "NOERROR" : `Status ${gData.Status}`,
        dnssec: gData.AD ?? false,
        latencyMs: elapsed,
      });
    } catch {
      resolverList.push({
        resolver: "Google Public DoH (8.8.8.8)",
        records: [],
        status: "Bağlantı Hatası",
        dnssec: false,
        latencyMs: 0,
      });
    }

    setResults(resolverList);
    setLoading(false);
    toast.success(`${cleanDomain} için DNS kayıtları başarıyla sorgulandı!`);
  };

  const copyRecord = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(text);
    toast.success("Kayıt panoya kopyalandı!");
    setTimeout(() => setCopiedData(null), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <Server className="h-3.5 w-3.5 text-indigo-400" />
          <span>Multi-Resolver DoH Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DNS Kayıtları & DoH Sorgulayıcı
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Cloudflare ve Google DoH altyapısıyla A, AAAA, MX, TXT ve CNAME kayıtlarını çoklu doğrulama ile anında sorgulayın.
        </p>
      </div>

      {/* Control Box */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Domain Input */}
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="Örn: everythinghub.com.tr veya google.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Record Type Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {RECORD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setRecordType(type);
                  handleLookup(domain, type);
                }}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shrink-0 ${
                  recordType === type
                    ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 shadow-sm"
                    : "bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-6 py-3 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30 transition-all shrink-0"
          >
            <Search className="h-4 w-4 text-indigo-300" />
            <span>{loading ? "Sorgulanıyor..." : "DNS Sorgula"}</span>
          </button>
        </div>
      </div>

      {/* Multi-Resolver Evidence Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((res, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">{res.resolver}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {res.dnssec && (
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      <span>DNSSEC</span>
                    </span>
                  )}
                  <span className="text-zinc-400">{res.latencyMs}ms</span>
                </div>
              </div>

              {res.records.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {res.records.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="min-w-0">
                        <div className="text-zinc-200 break-all font-semibold">{rec.data}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">TTL: {rec.TTL}s</div>
                      </div>
                      <button
                        onClick={() => copyRecord(rec.data)}
                        className="text-zinc-500 hover:text-white transition-colors shrink-0"
                      >
                        {copiedData === rec.data ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Bu resolver üzerinde {recordType} kaydı bulunamadı.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
