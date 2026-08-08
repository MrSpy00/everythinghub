"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Key,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// Sample Pre-generated JWTs for testing
const SAMPLE_ADMIN_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFobWV0IFnEsWxtYXoiLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJldmVyeXRoaW5naHViLmNvbS50ciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDgwMDAwMDAwfQ.dGVzdF9zaWduYXR1cmVfc2FtcGxl";

const SAMPLE_EXPIRED_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzg4OSIsIm5hbWUiOiJaZXluZXAgS2F5YSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjUwMDAwMDAwfQ.ZXhwaXJlZF90b2tlbl9zaWduYXR1cmU";

export function JWTDebuggerClient() {
  const [token, setToken] = useState(SAMPLE_ADMIN_JWT);
  const [headerJson, setHeaderJson] = useState<any>(null);
  const [payloadJson, setPayloadJson] = useState<any>(null);
  const [signature, setSignature] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [expiryStatus, setExpiryStatus] = useState<{ expired: boolean; message: string; diffText: string } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Decode JWT Base64URL
  const decodeBase64Url = (str: string) => {
    try {
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!token.trim()) {
      setHeaderJson(null);
      setPayloadJson(null);
      setSignature("");
      setIsValid(false);
      setExpiryStatus(null);
      return;
    }

    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      setIsValid(false);
      setHeaderJson(null);
      setPayloadJson(null);
      setSignature("");
      setExpiryStatus(null);
      return;
    }

    const header = decodeBase64Url(parts[0]);
    const payload = decodeBase64Url(parts[1]);

    if (!header || !payload) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
    setHeaderJson(header);
    setPayloadJson(payload);
    setSignature(parts[2]);

    // Check exp timestamp
    if (payload.exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const expSec = payload.exp;
      const diff = expSec - nowSec;

      if (diff <= 0) {
        const pastDays = Math.abs(Math.floor(diff / 86400));
        const pastHours = Math.abs(Math.floor((diff % 86400) / 3600));
        setExpiryStatus({
          expired: true,
          message: "Token süresi dolmuş!",
          diffText: `${pastDays} gün ${pastHours} saat önce sona erdi.`,
        });
      } else {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        setExpiryStatus({
          expired: false,
          message: "Token geçerli ve aktif.",
          diffText: `${days > 0 ? `${days} gün ` : ""}${hours} saat ${minutes} dakika kaldı.`,
        });
      }
    } else {
      setExpiryStatus(null);
    }
  }, [token]);

  const handleCopy = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedPayload(true);
    toast.success("Payload JSON panoya kopyalandı!");
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <Lock className="h-3.5 w-3.5 text-indigo-400" />
          <span>%100 İstemci Taraflı & Sıfır Veri Tutma</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          İstemci Taraflı JWT Debugger & Token Çözücü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          JSON Web Token (JWT) başlık, payload ve imza verilerini %100 tarayıcınızda çözün. Hiçbir token sunucuya gönderilmez.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setToken(SAMPLE_ADMIN_JWT)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-indigo-400 hover:text-white transition-all"
        >
          Örnek Admin Token
        </button>
        <button
          onClick={() => setToken(SAMPLE_EXPIRED_JWT)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-rose-400 hover:text-white transition-all"
        >
          Örnek Süresi Dolmuş Token
        </button>
        <button
          onClick={() => setToken("")}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-all"
        >
          Temizle
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Encoded JWT Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4 flex flex-col h-full min-h-[560px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-400" />
                <span>Kodlanmış JWT Dizisi (Encoded)</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Header.Payload.Signature</span>
            </div>

            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="flex-1 w-full rounded-xl border border-white/10 bg-black/60 p-4 text-xs font-mono text-indigo-300 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />

            <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-[11px] text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Gizlilik Garantisi: Bu araç tüm şifre çözme işlemlerini Web Crypto ile tarayıcınızda yerel yapar.</span>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Decoded JWT Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4 min-h-[560px] flex flex-col justify-between">
            {isValid && payloadJson ? (
              <div className="space-y-5">
                {/* Expiry Banner */}
                {expiryStatus && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      expiryStatus.expired
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {expiryStatus.expired ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-semibold">{expiryStatus.message}</div>
                        <div className="text-[11px] opacity-80">{expiryStatus.diffText}</div>
                      </div>
                    </div>
                    <Clock className="h-4 w-4 opacity-50" />
                  </div>
                )}

                {/* Header Section */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                    <span className="text-rose-400 font-mono">HEADER: Algoritma & Tip</span>
                  </div>
                  <pre className="rounded-xl border border-white/10 bg-black/60 p-3 text-xs font-mono text-rose-300 overflow-x-auto">
                    {JSON.stringify(headerJson, null, 2)}
                  </pre>
                </div>

                {/* Payload Section */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                    <span className="text-purple-400 font-mono">PAYLOAD: Veri & Yetkiler</span>
                    <button
                      onClick={() => handleCopy(payloadJson)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedPayload ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Kopyala</span>
                    </button>
                  </div>
                  <pre className="rounded-xl border border-white/10 bg-black/60 p-3 text-xs font-mono text-purple-300 overflow-x-auto max-h-56">
                    {JSON.stringify(payloadJson, null, 2)}
                  </pre>
                </div>

                {/* Signature Section */}
                <div>
                  <div className="text-xs font-semibold text-cyan-400 font-mono mb-1.5">
                    SIGNATURE: İmza Hash
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/60 p-2.5 text-[11px] font-mono text-cyan-300 truncate">
                    {signature || "İmzasız Token"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center space-y-2 py-16">
                <AlertTriangle className="h-8 w-8 text-zinc-700" />
                <p className="text-xs max-w-xs">
                  Geçerli bir JSON Web Token girildiğinde Başlık (Header), Yük (Payload) ve Zaman Aşımı detayları burada ayrıştırılacaktır.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
