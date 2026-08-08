"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ArrowRightLeft } from "lucide-react";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function UnitConverterClient() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("length");
  const [value, setValue] = useState<number>(10);
  const [fromUnit, setFromUnit] = useState<string>("Meter");
  const [toUnit, setToUnit] = useState<string>("Kilometer");

  const UNITS: Record<string, { name: string; units: Record<string, number> }> = {
    length: {
      name: t.categoryLength,
      units: {
        Meter: 1,
        Kilometer: 0.001,
        Centimeter: 100,
        Millimeter: 1000,
        Mile: 0.000621371,
        Inch: 39.3701,
        Foot: 3.28084,
      },
    },
    mass: {
      name: t.categoryMass,
      units: {
        Kilogram: 1,
        Gram: 1000,
        Milligram: 1000000,
        Pound: 2.20462,
        Ounce: 35.274,
        Tonne: 0.001,
      },
    },
    data: {
      name: t.categoryData,
      units: {
        Byte: 1,
        Kilobyte: 1 / 1024,
        Megabyte: 1 / (1024 * 1024),
        Gigabyte: 1 / (1024 * 1024 * 1024),
        Terabyte: 1 / (1024 * 1024 * 1024 * 1024),
      },
    },
  };

  const currentCategory = UNITS[category] || UNITS.length;
  const fromFactor = currentCategory.units[fromUnit] || 1;
  const toFactor = currentCategory.units[toUnit] || 1;

  const result = (value / fromFactor) * toFactor;

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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/10 backdrop-blur-2xl shadow-xl shadow-teal-500/10">
            <Scale className="h-7 w-7 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t.unitConverterTitle}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.unitConverterSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#14b8a6" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="flex gap-2 border-b border-[var(--hub-border)] pb-4">
            {Object.keys(UNITS).map((catKey) => (
              <button
                key={catKey}
                onClick={() => {
                  setCategory(catKey);
                  const firstUnit = Object.keys(UNITS[catKey].units)[0];
                  const secondUnit = Object.keys(UNITS[catKey].units)[1];
                  setFromUnit(firstUnit);
                  setToUnit(secondUnit);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  category === catKey
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                    : "border border-[var(--hub-border)] bg-[var(--hub-bg)] text-[var(--hub-text-muted)]"
                }`}
              >
                {UNITS[catKey].name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-center">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-teal-300 mb-2 block">{t.fromUnit}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-black/50 p-3 text-sm text-white focus:border-teal-500/50 focus:outline-none mb-2"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2.5 text-xs font-bold text-white focus:outline-none"
              >
                {Object.keys(currentCategory.units).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-emerald-400 mb-2 block">{t.unitResult}</label>
              <input
                type="text"
                readOnly
                value={result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                className="w-full rounded-xl border border-teal-500/30 bg-black/70 p-3 font-mono text-sm font-bold text-teal-300 focus:outline-none mb-2"
              />
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2.5 text-xs font-bold text-white focus:outline-none"
              >
                {Object.keys(currentCategory.units).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}
