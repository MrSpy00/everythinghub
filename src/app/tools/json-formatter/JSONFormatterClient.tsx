"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Copy, Check, AlertCircle, FileText, Minimize2, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";

export function JSONFormatterClient() {
  const [input, setInput] = useState<string>(
    JSON.stringify({ name: "everythinghub", status: "live", tools: 14, active: true }, null, 2)
  );
  const [formatted, setFormatted] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = (indent = 2) => {
    try {
      setError(null);
      if (!input.trim()) {
        setFormatted("");
        return;
      }
      const parsed = JSON.parse(input);
      const res = JSON.stringify(parsed, null, indent);
      setFormatted(res);
      toast.success(indent === 0 ? "JSON sıkıştırıldı (minify)!" : "JSON formatlandı!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Geçersiz JSON formatı.";
      setError(msg);
      toast.error("JSON Doğrulama Hatası!");
    }
  };

  const handleCopy = async () => {
    if (!formatted) return;
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setCopied(true);
      toast.success("Panoya kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>Hub Menüsüne Dön</span>
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <Code2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">JSON Formatlayıcı & Validator</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              JSON verilerinizi anında doğrulayın, güzelleştirin (beautify) veya küçültün (minify).
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#10b981" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hub-border)] pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFormat(2)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"
              >
                <FileText className="h-3.5 w-3.5" /> Formatla (Beautify)
              </button>
              <button
                onClick={() => handleFormat(0)}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
              >
                <Minimize2 className="h-3.5 w-3.5" /> Küçült (Minify)
              </button>
            </div>
            {formatted && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Kopyalandı" : "Sonucu Kopyala"}</span>
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-[var(--hub-text-muted)] mb-2 block flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Ham JSON Girdisi
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="JSON içeriğini buraya yapıştırın..."
                rows={16}
                className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-black/50 p-4 font-mono text-xs text-white placeholder:text-[var(--hub-text-subtle)] focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-emerald-400 mb-2 block">Formatlanmış Sonuç</label>
              <textarea
                readOnly
                value={formatted}
                placeholder="Formatlanmış JSON burada görüntülenecek..."
                rows={16}
                className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-black/70 p-4 font-mono text-xs text-emerald-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}
