"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Clock,
  Sparkles,
  Copy,
  Check,
  Play,
  Settings,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Preset {
  label: string;
  expr: string;
  desc: string;
}

const PRESETS: Preset[] = [
  { label: "Her Dakika", expr: "* * * * *", desc: "Her dakika başı çalışır" },
  { label: "Her 5 Dakikada Bir", expr: "*/5 * * * *", desc: "Her 5 dakikada bir tetiklenir" },
  { label: "Her Saat Başı", expr: "0 * * * *", desc: "Her saatin 0. dakikasında çalışır" },
  { label: "Her Gün Gece Yarısı", expr: "0 0 * * *", desc: "Her gece 00:00'da çalışır" },
  { label: "Hafta İçi Her Sabah 9", expr: "0 9 * * 1-5", desc: "Pazartesi-Cuma saat 09:00'da" },
  { label: "Her Ayın 1'inde", expr: "0 0 1 * *", desc: "Her ayın 1. günü 00:00'da" },
];

export function CronStudioClient() {
  const [cronExpr, setCronExpr] = useState<string>("*/15 * * * *");
  const [copied, setCopied] = useState<boolean>(false);

  const parts = cronExpr.trim().split(/\s+/);
  const minute = parts[0] || "*";
  const hour = parts[1] || "*";
  const dayOfMonth = parts[2] || "*";
  const month = parts[3] || "*";
  const dayOfWeek = parts[4] || "*";

  const translateCron = (expr: string): string => {
    const p = expr.trim().split(/\s+/);
    if (p.length < 5) return "Geçersiz cron ifadesi (En az 5 parametre gerekli)";

    if (expr === "* * * * *") return "Her dakika başı çalışır";
    if (expr === "*/5 * * * *") return "Her 5 dakikada bir tetiklenir";
    if (expr === "*/15 * * * *") return "Her 15 dakikada bir tetiklenir";
    if (expr === "*/30 * * * *") return "Her 30 dakikada bir tetiklenir";
    if (expr === "0 * * * *") return "Her saatin 0. dakikasında çalışır";
    if (expr === "0 0 * * *") return "Her gün saat 00:00'da çalışır";
    if (expr === "0 9 * * 1-5") return "Hafta içi her gün (Pazartesi - Cuma) saat 09:00'da çalışır";
    if (expr === "0 0 1 * *") return "Her ayın 1. günü gece yarısı (00:00) çalışır";

    let desc = "";
    if (p[0] === "*") desc += "Her dakika ";
    else if (p[0].startsWith("*/")) desc += `Her ${p[0].replace("*/", "")} dakikada bir `;
    else desc += `Dakika: ${p[0]} `;

    if (p[1] === "*") desc += "her saat ";
    else desc += `Saat: ${p[1]} `;

    if (p[2] !== "*") desc += `Ayın ${p[2]}. günü `;
    if (p[3] !== "*") desc += `Ay: ${p[3]} `;
    if (p[4] !== "*") desc += `Haftanın günü: ${p[4]}`;

    return desc;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    toast.success("Cron ifadesi panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300 backdrop-blur-xl mb-3">
          <CalendarClock className="h-3.5 w-3.5 text-pink-400" />
          <span>Zero-Auth Cron Expression Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cron İfadesi Üreteci & Açıklayıcı
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Linux Crontab ve zamanlanmış görev ifadelerini Türkçe insani açıklamalara dönüştürün ve anında üretin.
        </p>
      </div>

      {/* Main Input Box */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-pink-400" />
            <h2 className="text-base font-bold text-white">Cron İfadesi (5 Parametre)</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl bg-pink-500/20 border border-pink-500/40 px-4 py-2 text-xs font-bold text-pink-200 hover:bg-pink-500/30 transition-all shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-pink-300" />}
            <span>İfadeyi Kopyala</span>
          </button>
        </div>

        {/* Big Cron Code Input */}
        <div className="mb-6">
          <input
            type="text"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            className="w-full text-center text-2xl sm:text-3xl font-black font-mono tracking-widest text-pink-300 bg-black/50 border border-pink-500/30 rounded-xl py-4 focus:border-pink-400 focus:outline-none shadow-inner"
          />
        </div>

        {/* Live Translation Card */}
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-5 text-center backdrop-blur-xl">
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block mb-1">Türkçe Açıklaması</span>
          <div className="text-lg font-bold text-white">
            {translateCron(cronExpr)}
          </div>
        </div>

        {/* 5-Field Breakdown Grid */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {[
            { title: "Dakika", val: minute, range: "0-59" },
            { title: "Saat", val: hour, range: "0-23" },
            { title: "Gün (Ay)", val: dayOfMonth, range: "1-31" },
            { title: "Ay", val: month, range: "1-12" },
            { title: "Gün (Hafta)", val: dayOfWeek, range: "0-6" },
          ].map((field) => (
            <div key={field.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <span className="text-[10px] text-zinc-400 block">{field.title}</span>
              <span className="text-sm font-mono font-extrabold text-pink-300 block my-0.5">{field.val}</span>
              <span className="text-[9px] text-zinc-500 block">({field.range})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Cards */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/80 backdrop-blur-3xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-400" /> Sık Kullanılan Cron Şablonları
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setCronExpr(preset.expr);
                toast.success(`${preset.label} şablonu seçildi!`);
              }}
              className="text-left rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                  {preset.label}
                </span>
                <span className="text-xs font-mono font-semibold text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/30">
                  {preset.expr}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
