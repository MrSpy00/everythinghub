"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Binary, Copy, Check, Lock, Unlock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Base64Client() {
  const { t } = useLanguage();
  const [input, setInput] = useState("everythinghub — Digital Studio");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  let output = "";
  let error = false;

  try {
    if (mode === "encode") {
      output = btoa(unescape(encodeURIComponent(input)));
    } else {
      output = decodeURIComponent(escape(atob(input)));
    }
  } catch {
    error = true;
    output = t.invalidBase64Error;
  }

  const handleCopy = async () => {
    if (error || !output) return;
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>{t.backToHub}</span>
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-2xl shadow-xl shadow-cyan-500/10">
            <Binary className="h-7 w-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t.base64Title}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.base64Sub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#06b6d4" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[var(--hub-border)] pb-4">
            <button
              onClick={() => setMode("encode")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                mode === "encode"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                  : "border border-[var(--hub-border)] bg-[var(--hub-bg)] text-[var(--hub-text-muted)]"
              }`}
            >
              <Lock className="h-3.5 w-3.5" /> {t.encode}
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                mode === "decode"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                  : "border border-[var(--hub-border)] bg-[var(--hub-bg)] text-[var(--hub-text-muted)]"
              }`}
            >
              <Unlock className="h-3.5 w-3.5" /> {t.decode}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--hub-text-muted)] mb-2 block">
                {mode === "encode" ? t.rawTextInput : t.base64Input}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-black/50 p-4 font-mono text-xs text-white focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-cyan-300">
                  {mode === "encode" ? t.base64Output : t.plainTextOutput}
                </label>
                {!error && output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? t.copied : t.copy}</span>
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={output}
                rows={5}
                className={`w-full resize-none rounded-xl border p-4 font-mono text-xs focus:outline-none ${
                  error
                    ? "border-red-500/50 bg-red-500/10 text-red-300"
                    : "border-cyan-500/30 bg-black/70 text-cyan-300"
                }`}
              />
            </div>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}
