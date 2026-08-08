"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface DNSRecord {
  name: string;
  type: number;
  typeName: string;
  TTL: number;
  data: string;
}

const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA", "SRV"];

export function DNSLookupClient() {
  const [domain, setDomain] = useState("everythinghub.com.tr");
  const [recordType, setRecordType] = useState("A");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [dnssec, setDnssec] = useState<boolean | null>(null);

  const handleLookup = async (targetDomain = domain, targetType = recordType) => {
    if (!targetDomain.trim()) {
      toast.error("Lütfen geçerli bir alan adı girin.");
      return;
    }

    setLoading(true);
    setRecords([]);
    setStatus(null);

    const cleanDomain = targetDomain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    try {
      // Query Cloudflare DoH Endpoint
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${targetType}`;
      const res = await fetch(url, {
        headers: { accept: "application/dns-json" },
      });
      const data = await res.json();

      setStatus(data.Status === 0 ? "NOERROR" : `Status ${data.Status}`);
      setDnssec(data.AD ?? false);

      if (data.Answer && Array.isArray(data.Answer)) {
        const parsed: DNSRecord[] = data.Answer.map((ans: any) => ({
          name: ans.name,
          type: ans.type,
          typeName: targetType,
          TTL: ans.TTL,
          data: ans.data,
        }));
        setRecords(parsed);
        toast.success(`${parsed.length} adet ${targetType} kaydı bulundu!`);
      } else {
        setRecords([]);
        toast.info(`${targetType} türünde kayıt bulunamadı.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("DNS sorgulanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyRecord = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kayıt panoya kopyalandı!");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <Server className="h-3.5 w-3.5 text-indigo-400" />
          <span>Zero-Auth DNS over HTTPS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DNS Kayıtları & DoH Sorgulayıcı
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Cloudflare & Google DoH güvenli altyapısıyla herhangi bir alan adının A, AAAA, MX, TXT ve NS kayıtlarını anında tarayın.
        </p>
      </div>

      {/* Control Box */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl mb-8">
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
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-6 py-3 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30 transition-all shrink-0 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-300" /> : <Search className="h-4 w-4 text-indigo-300" />}
            <span>Sorgula</span>
          </button>
        </div>
      </div>

      {/* Results Box */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Sorgu Sonuçları ({recordType})
            </h2>
          </div>

          {status && (
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                {status}
              </span>
              {dnssec !== null && (
                <span className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> DNSSEC: {dnssec ? "Aktif" : "Pasif"}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-500 text-sm">
            DNS sunucusu sorgulanıyor...
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-3">
            {records.map((rec, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-indigo-500/30 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[10px] font-bold border border-indigo-500/30">
                      {rec.typeName}
                    </span>
                    <span className="text-xs text-zinc-400 truncate">{rec.name}</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-white break-all bg-black/40 p-2.5 rounded-lg border border-white/5 mt-2">
                    {rec.data}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>TTL: {rec.TTL}s</span>
                  </div>

                  <button
                    onClick={() => copyRecord(rec.data)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all border border-white/5"
                  >
                    <Copy className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Kopyala</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Sorgulama yapmak için alan adınızı yazıp Sorgula butonuna basınız.
          </div>
        )}
      </div>
    </div>
  );
}
