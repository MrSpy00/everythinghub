"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";

const PRESETS = [
  { name: "Royal Indigo", color1: "#6366f1", color2: "#8b5cf6", color3: "#ec4899" },
  { name: "Cyberpunk Pink", color1: "#ff007f", color2: "#7928ca", color3: "#00dfd8" },
  { name: "Emerald Emerald", color1: "#10b981", color2: "#059669", color3: "#047857" },
  { name: "Sunset Gold", color1: "#f59e0b", color2: "#ef4444", color3: "#ec4899" },
  { name: "Oceanic Blue", color1: "#06b6d4", color2: "#3b82f6", color3: "#6366f1" },
];

export function GradientClient() {
  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#8b5cf6");
  const [color3, setColor3] = useState("#ec4899");
  const [angle, setAngle] = useState<number>(135);
  const [copied, setCopied] = useState<string | null>(null);

  const cssGradient = `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`;
  const cssCode = `background: ${cssGradient};`;

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(id);
      toast.success("Kopyalandı!");
      setTimeout(() => setCopied(null), 2000);
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">CSS Gradient Üretici</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              Çok katmanlı modern renk geçişleri oluşturun ve CSS kodlarını kopyalayın.
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#ec4899" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          {/* Live Preview Box */}
          <div
            className="h-48 w-full rounded-2xl shadow-2xl transition-all border border-white/20 flex items-center justify-center"
            style={{ background: cssGradient }}
          >
            <span className="rounded-xl bg-black/40 px-4 py-2 text-xs font-mono font-bold text-white backdrop-blur-md border border-white/10">
              {cssGradient}
            </span>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-white mb-2 block">Renk 1</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white mb-2 block">Renk 2</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white mb-2 block">Renk 3</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color3}
                  onChange={(e) => setColor3(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={color3}
                  onChange={(e) => setColor3(e.target.value)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Angle Slider */}
          <div>
            <label className="text-xs font-bold text-white mb-2 block flex items-center justify-between">
              <span>Açı Derecesi</span>
              <span className="font-mono text-pink-300">{angle}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value, 10))}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          {/* Presets */}
          <div>
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Öne Çıkan Hazır Şablonlar
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setColor1(p.color1);
                    setColor2(p.color2);
                    setColor3(p.color3);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3 py-1.5 text-xs font-bold text-white hover:border-pink-500/50 transition-all"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${p.color1}, ${p.color3})` }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Output */}
          <div className="rounded-xl border border-[var(--hub-border)] bg-black/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300 uppercase">CSS Kodu</span>
              <button
                onClick={() => handleCopy(cssCode, "css")}
                className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300"
              >
                {copied === "css" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied === "css" ? "Kopyalandı" : "Kopyala"}</span>
              </button>
            </div>
            <code className="block font-mono text-xs text-white">{cssCode}</code>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}
