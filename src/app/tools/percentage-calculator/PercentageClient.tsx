"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Percent, Calculator } from "lucide-react";
import { NeonBorder } from "@/components/creative/NeonBorder";

export function PercentageClient() {
  const [val1, setVal1] = useState<number>(20);
  const [val2, setVal2] = useState<number>(500);

  const [origPrice, setOrigPrice] = useState<number>(1000);
  const [discountRate, setDiscountRate] = useState<number>(25);

  const percentResult = (val1 / 100) * val2;

  const discountAmount = (origPrice * discountRate) / 100;
  const finalPrice = origPrice - discountAmount;

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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/30">
            <Percent className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Yüzde & İndirim Hesaplayıcı</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              Yüzde oranları, indirimli fiyat ve KDV tutarlarını anında hesaplayın.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Module 1: X% of Y */}
        <NeonBorder color="#eab308" rounded={24} glow={60}>
          <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Yüzde Hesaplama (X% of Y)
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center">
              <div>
                <label className="text-xs font-semibold text-[var(--hub-text-muted)] mb-1 block">Yüzde Oranı (%)</label>
                <input
                  type="number"
                  value={val1}
                  onChange={(e) => setVal1(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-black/50 p-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hub-text-muted)] mb-1 block">Tutar / Sayı</label>
                <input
                  type="number"
                  value={val2}
                  onChange={(e) => setVal2(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-black/50 p-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-400 mb-1 block">Sonuç</label>
                <div className="rounded-xl border border-yellow-500/30 bg-black/70 p-3 font-mono text-base font-black text-yellow-300">
                  {percentResult.toLocaleString("tr-TR")}
                </div>
              </div>
            </div>
          </div>
        </NeonBorder>

        {/* Module 2: Discount Calculator */}
        <NeonBorder color="#f59e0b" rounded={24} glow={60}>
          <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Percent className="h-4 w-4" /> İndirimli Fiyat Hesaplayıcı
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center">
              <div>
                <label className="text-xs font-semibold text-[var(--hub-text-muted)] mb-1 block">Orijinal Fiyat (TL)</label>
                <input
                  type="number"
                  value={origPrice}
                  onChange={(e) => setOrigPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-black/50 p-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hub-text-muted)] mb-1 block">İndirim Oranı (%)</label>
                <input
                  type="number"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--hub-border)] bg-black/50 p-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-400 mb-1 block">İndirimli Fiyat</label>
                <div className="rounded-xl border border-emerald-500/30 bg-black/70 p-3 font-mono text-base font-black text-emerald-300">
                  {finalPrice.toLocaleString("tr-TR")} TL
                  <span className="text-[10px] text-amber-300 block font-normal mt-0.5">(-{discountAmount.toLocaleString("tr-TR")} TL İndirim)</span>
                </div>
              </div>
            </div>
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
