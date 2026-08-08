"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Type, Clock, AlignLeft, Sparkles, MessageSquare } from "lucide-react";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function WordCounterClient() {
  const { t } = useLanguage();
  const [text, setText] = useState<string>(
    "everythinghub — Digital Tools Studio. YouTube playlist length analysis, image compression, developer utilities, and much more. 100% private, free forever."
  );

  const cleanText = text.trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const charWithSpaces = text.length;
  const charNoSpaces = text.replace(/\s+/g, "").length;
  const sentenceCount = cleanText ? cleanText.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphCount = cleanText ? cleanText.split(/\n+/).filter(Boolean).length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);
  const speakingTimeMin = Math.ceil(wordCount / 130);

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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-2xl shadow-xl shadow-indigo-500/10">
            <Type className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t.wordCounterTitle}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.wordCounterSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#6366f1" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<Type className="h-4 w-4 text-indigo-400" />} label={t.words} value={wordCount.toLocaleString()} />
            <StatCard icon={<AlignLeft className="h-4 w-4 text-purple-400" />} label={t.characters} value={charWithSpaces.toLocaleString()} subtitle={`${t.charactersNoSpaces}: ${charNoSpaces}`} />
            <StatCard icon={<MessageSquare className="h-4 w-4 text-pink-400" />} label={`${t.sentences} / ${t.paragraphs}`} value={`${sentenceCount} / ${paragraphCount}`} />
            <StatCard icon={<Clock className="h-4 w-4 text-emerald-400" />} label={t.readingTime} value={`~${readingTimeMin} min`} subtitle={`${t.speakingTime}: ~${speakingTimeMin} min`} />
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> {t.rawTextInput}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.textPlaceholder}
              rows={12}
              className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-black/50 p-4 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
            />
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle?: string }) {
  return (
    <div className="flex flex-col p-4 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-bg)]">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--hub-text-muted)] mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {subtitle && <p className="text-[10px] text-[var(--hub-text-subtle)] mt-0.5">{subtitle}</p>}
    </div>
  );
}
