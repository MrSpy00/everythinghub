"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, AlertTriangle, Info, AlertOctagon, UserCheck } from "lucide-react";
import { BotFlags } from "@/lib/spotify-analyzer";
import { cn } from "@/lib/utils";

interface SpotifyBotShieldProps {
  score: number; // 0 to 100
  riskLevel: "safe" | "moderate" | "high_risk";
  botFlags: BotFlags;
  pitchingVerdict: string;
  isTurkish?: boolean;
}

export function SpotifyBotShield({
  score,
  riskLevel,
  botFlags,
  pitchingVerdict,
  isTurkish = true,
}: SpotifyBotShieldProps) {
  const getScoreColor = () => {
    if (score >= 80) return { stroke: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" };
    if (score >= 50) return { stroke: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
    return { stroke: "#f43f5e", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" };
  };

  const style = getScoreColor();

  const circleRadius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-2xl border backdrop-blur-xl", style.bg, style.border)}>
            {riskLevel === "safe" ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : riskLevel === "moderate" ? (
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            ) : (
              <ShieldX className="w-6 h-6 text-rose-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Bot & Yapay Akış Güvenlik Kalkanı" : "Bot & Artificial Stream Shield"}
            </h3>
            <p className="text-xs text-white/60">
              {isTurkish
                ? "Artist.tools & SubmitHub standartlarında 5 kriterli derin sahtecilik analizi"
                : "5-point artificial stream & fraud detection based on Artist.tools & SubmitHub rules"}
            </p>
          </div>
        </div>

        {/* Risk Badge */}
        <span
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-xl",
            riskLevel === "safe"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : riskLevel === "moderate"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-rose-500/20 text-rose-300 border-rose-500/40"
          )}
        >
          {riskLevel === "safe"
            ? isTurkish
              ? "Organik & Güvenli"
              : "Organic & Safe"
            : riskLevel === "moderate"
            ? isTurkish
              ? "Orta Risk Uyarı"
              : "Moderate Risk"
            : isTurkish
            ? "Yüksek Risk / Botted"
            : "High Risk / Botted"}
        </span>
      </div>

      {/* Main Gauge & Pitching Verdict Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* SVG Circular Quality Score Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={circleRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-white/10"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={circleRadius}
                fill="none"
                stroke={style.stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={cn("text-3xl font-black font-mono", style.text)}>%{score}</span>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                {isTurkish ? "Kalite Skoru" : "Quality Score"}
              </span>
            </div>
          </div>
        </div>

        {/* Pitching Safety Verdict Card */}
        <div className="md:col-span-2 p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>{isTurkish ? "Sanatçı & Pitch Değerlendirme Raporu" : "Artist & Pitching Security Verdict"}</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
            "{pitchingVerdict}"
          </p>
        </div>
      </div>

      {/* 4-Point Heuristics Audit Checklist */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs uppercase font-bold tracking-wider text-white/50">
          {isTurkish ? "Denetim Kriterleri & Anomali Kontrolleri" : "Audit Criteria & Anomaly Checks"}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Artist Stuffing */}
          <div
            className={cn(
              "p-3.5 rounded-2xl border flex items-start gap-3 transition-all",
              botFlags.artistStuffing
                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
            )}
          >
            {botFlags.artistStuffing ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-bold block">
                {isTurkish ? "Sanatçı Yoğunlaşma Katsayısı" : "Artist Concentration Ratio"}
              </span>
              <p className="text-white/70">
                {botFlags.artistStuffingDetails ||
                  (isTurkish
                    ? "Sanatçılar dengeli dağılmış, tek bir ismin liste üzerine baskısı yok."
                    : "Balanced artist distribution; no single artist dominates the list.")}
              </p>
            </div>
          </div>

          {/* 2. Short Duration Anomaly */}
          <div
            className={cn(
              "p-3.5 rounded-2xl border flex items-start gap-3 transition-all",
              botFlags.shortDurationAnomaly
                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
            )}
          >
            {botFlags.shortDurationAnomaly ? (
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-bold block">
                {isTurkish ? "Şarkı Süresi Anomalisi (< 90sn)" : "Short Song Duration Anomaly (< 90s)"}
              </span>
              <p className="text-white/70">
                {botFlags.shortDurationDetails ||
                  (isTurkish
                    ? "Şarkı süreleri doğal müzik standartlarına uygundur."
                    : "Song durations align with natural music standards.")}
              </p>
            </div>
          </div>

          {/* 3. Bimodal Popularity Anomaly */}
          <div
            className={cn(
              "p-3.5 rounded-2xl border flex items-start gap-3 transition-all",
              botFlags.bimodalPopularityAnomaly
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
            )}
          >
            {botFlags.bimodalPopularityAnomaly ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-bold block">
                {isTurkish ? "Popülerlik Ayrışması (Cloaking)" : "Popularity Discrepancy (Cloaking)"}
              </span>
              <p className="text-white/70">
                {botFlags.bimodalDetails ||
                  (isTurkish
                    ? "Popülerlik dağılımı tutarlı, sahte kamufle şarkı tespiti yok."
                    : "Popularity distribution is consistent; no cloaked zero-pop tracks found.")}
              </p>
            </div>
          </div>

          {/* 4. Duplicates scanner */}
          <div
            className={cn(
              "p-3.5 rounded-2xl border flex items-start gap-3 transition-all",
              botFlags.duplicateTracksCount > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
            )}
          >
            {botFlags.duplicateTracksCount > 0 ? (
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-bold block">
                {isTurkish ? "Kopya & Mükerrer Parçalar" : "Duplicate Tracks Density"}
              </span>
              <p className="text-white/70">
                {botFlags.duplicateTracksCount > 0
                  ? isTurkish
                    ? `${botFlags.duplicateTracksCount} adet mükerrer parça bulundu.`
                    : `${botFlags.duplicateTracksCount} duplicate tracks detected.`
                  : isTurkish
                  ? "Tüm parçalar benzersiz ve kopyasızdır."
                  : "All tracks are unique with zero duplicates."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
