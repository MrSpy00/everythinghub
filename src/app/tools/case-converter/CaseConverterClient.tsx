"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CaseSensitive, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";

export function CaseConverterClient() {
  const [text, setText] = useState("everythinghub dijital araçlar merkezi");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toWords = (str: string) => str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+/g, " ").trim().split(/\s+/);

  const transformations = [
    {
      id: "camelCase",
      label: "camelCase",
      transform: (str: string) => {
        const words = toWords(str);
        return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
      },
    },
    {
      id: "snake_case",
      label: "snake_case",
      transform: (str: string) => toWords(str).map((w) => w.toLowerCase()).join("_"),
    },
    {
      id: "kebab-case",
      label: "kebab-case",
      transform: (str: string) => toWords(str).map((w) => w.toLowerCase()).join("-"),
    },
    {
      id: "CONSTANT_CASE",
      label: "CONSTANT_CASE",
      transform: (str: string) => toWords(str).map((w) => w.toUpperCase()).join("_"),
    },
    {
      id: "Title Case",
      label: "Title Case",
      transform: (str: string) => toWords(str).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
    },
    {
      id: "UPPERCASE",
      label: "BÜYÜK HARF (UPPERCASE)",
      transform: (str: string) => str.toLocaleUpperCase("tr-TR"),
    },
    {
      id: "lowercase",
      label: "küçük harf (lowercase)",
      transform: (str: string) => str.toLocaleLowerCase("tr-TR"),
    },
  ];

  const handleCopy = async (val: string, id: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedId(id);
      toast.success("Kopyalandı!");
      setTimeout(() => setCopiedId(null), 2000);
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
          <span>Hub Menüsüne Dön</span>
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30">
            <CaseSensitive className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Metin Kasa Dönüştürücü</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              camelCase, snake_case, kebab-case ve BÜYÜK/KÜÇÜK harf formatlarına anında dönüştürün.
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#8b5cf6" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div>
            <label className="text-xs font-bold text-violet-300 uppercase tracking-wider block mb-2">Metin Girdisi</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dönüştürülecek metni buraya yazın..."
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-black/50 p-4 text-sm text-white focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            {transformations.map((t) => {
              const res = t.transform(text);
              return (
                <div key={t.id} className="rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-violet-300 block mb-1">{t.label}</span>
                    <span className="font-mono text-xs text-white truncate block">{res}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(res, t.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3 py-1.5 text-xs font-bold text-white hover:border-violet-500/50 transition-all shrink-0"
                  >
                    {copiedId === t.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-violet-400" />}
                    <span>{copiedId === t.id ? "Kopyalandı" : "Kopyala"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}
