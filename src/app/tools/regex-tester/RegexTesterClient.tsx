"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Regex, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function RegexTesterClient() {
  const { t } = useLanguage();
  const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState<string>("gi");
  const [text, setText] = useState<string>(
    "Contact us at support@everythinghub.com or mrspy00@github.com for queries."
  );

  let matches: string[] = [];
  let error: string | null = null;

  try {
    if (pattern) {
      const regex = new RegExp(pattern, flags);
      const m = text.match(regex);
      matches = m ? Array.from(m) : [];
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Invalid Regex pattern";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-2xl shadow-xl shadow-blue-500/10">
            <Regex className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t.regexTitle}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.regexSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#3b82f6" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-blue-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" /> {t.regexPattern}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-mono text-blue-400">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="e.g. [0-9]+"
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-black/60 py-3 pl-7 pr-7 font-mono text-sm text-white focus:border-blue-500/50 focus:outline-none"
                />
                <span className="absolute right-3 text-xs font-mono text-blue-400">/</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--hub-text-muted)] uppercase tracking-wider block mb-2">
                {t.flagsLabel}
              </label>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="gi"
                className="w-full rounded-xl border border-[var(--hub-border)] bg-black/60 py-3 px-3 font-mono text-sm text-blue-300 focus:border-blue-500/50 focus:outline-none text-center"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-white mb-2 block">{t.testString}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-black/50 p-4 font-mono text-xs text-white focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> {t.matchesFound} ({matches.length})
              </span>
            </div>
            {matches.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--hub-border)] bg-black/40 p-4">
                {matches.map((m, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-blue-500/20 border border-blue-500/40 px-3 py-1 font-mono text-xs font-bold text-blue-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--hub-border)] bg-black/20 p-4 text-center text-xs text-[var(--hub-text-subtle)]">
                {t.noMatchesYet}
              </div>
            )}
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}
