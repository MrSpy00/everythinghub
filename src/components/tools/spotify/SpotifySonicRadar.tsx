"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Gauge, Zap, Flame, Smile, Mic, Volume2, Music2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioFeaturesSummary {
  avgEnergy: number;
  avgDanceability: number;
  avgValence: number;
  avgAcousticness: number;
  avgInstrumentalness: number;
  avgLiveness: number;
  avgSpeechiness: number;
  avgTempo: number;
  medianTempo: number;
  avgLoudness: number;
}

interface SpotifySonicRadarProps {
  summary: AudioFeaturesSummary;
  isTurkish?: boolean;
}

export function SpotifySonicRadar({ summary, isTurkish = true }: SpotifySonicRadarProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const axes = [
    { key: "energy", labelTr: "Enerji", labelEn: "Energy", value: summary.avgEnergy, icon: Flame, color: "#f59e0b" },
    { key: "danceability", labelTr: "Dans Edilebilirlik", labelEn: "Danceability", value: summary.avgDanceability, icon: Zap, color: "#10b981" },
    { key: "valence", labelTr: "Pozitiflik / Mood", labelEn: "Valence (Mood)", value: summary.avgValence, icon: Smile, color: "#ec4899" },
    { key: "acousticness", labelTr: "Akustiklik", labelEn: "Acousticness", value: summary.avgAcousticness, icon: Music2, color: "#8b5cf6" },
    { key: "instrumentalness", labelTr: "Enstrümantallik", labelEn: "Instrumentalness", value: Volume2, valueNum: summary.avgInstrumentalness, color: "#06b6d4" },
    { key: "liveness", labelTr: "Canlılık", labelEn: "Liveness", value: summary.avgLiveness, icon: Activity, color: "#3b82f6" },
    { key: "speechiness", labelTr: "Konuşma Oranı", labelEn: "Speechiness", value: summary.avgSpeechiness, icon: Mic, color: "#f43f5e" },
  ];

  const size = 300;
  const center = size / 2;
  const radius = center - 45;
  const totalAxes = axes.length;

  // Calculate polygon coordinates for SVG
  const points = axes.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
    const val = typeof axis.value === "number" ? axis.value : (axis as any).valueNum || 0.5;
    const r = radius * Math.max(0.05, Math.min(1, val));
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, labelX: center + (radius + 24) * Math.cos(angle), labelY: center + (radius + 24) * Math.sin(angle), axis };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Background Concentric Rings (20%, 40%, 60%, 80%, 100%)
  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      {/* SVG Spider Radar */}
      <div className="relative flex items-center justify-center w-full max-w-[340px] aspect-square shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          {/* Background Grid Rings */}
          {gridRings.map((r, idx) => {
            const ringPath = axes
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
                const rx = center + radius * r * Math.cos(angle);
                const ry = center + radius * r * Math.sin(angle);
                return `${rx},${ry}`;
              })
              .join(" ");
            return (
              <polygon
                key={idx}
                points={ringPath}
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeDasharray={idx === 4 ? "none" : "3,3"}
                strokeWidth={idx === 4 ? 1.5 : 1}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {axes.map((_, i) => {
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            const ax = center + radius * Math.cos(angle);
            const ay = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={ax}
                y2={ay}
                stroke="currentColor"
                className="text-white/10"
                strokeWidth={1}
              />
            );
          })}

          {/* Polygon Data Fill */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            points={polygonPath}
            className="fill-emerald-500/15 stroke-emerald-400/80 stroke-[1.5] drop-shadow-[0_0_6px_rgba(16,185,129,0.2)]"
          />

          {/* Interactive Radar Vertex Nodes */}
          {points.map((p, i) => {
            const isHovered = activeFeature === p.axis.key;
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveFeature(p.axis.key)} onMouseLeave={() => setActiveFeature(null)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={p.axis.color}
                  className="transition-all duration-200 stroke-white/80 stroke-2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Feature Breakdown Bars Grid */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {isTurkish ? "Sonic Özellik Profili" : "Sonic Feature Breakdown"}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>
              {isTurkish ? "Ort. Tempo:" : "Avg Tempo:"} <strong className="text-emerald-400 font-mono text-sm">{summary.avgTempo} BPM</strong>
            </span>
            <span>
              {isTurkish ? "Ses Şiddeti:" : "Loudness:"} <strong className="text-indigo-400 font-mono text-sm">{summary.avgLoudness} dB</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {axes.map((axis) => {
            const valNum = typeof axis.value === "number" ? axis.value : (axis as any).valueNum || 0.5;
            const pct = Math.round(valNum * 100);
            const Icon = axis.icon || Sparkles;
            const isSelected = activeFeature === axis.key;

            return (
              <div
                key={axis.key}
                onMouseEnter={() => setActiveFeature(axis.key)}
                onMouseLeave={() => setActiveFeature(null)}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-white/[0.08] border-white/30 shadow-lg scale-[1.02]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-white/90">
                    <Icon className="w-4 h-4" style={{ color: axis.color }} />
                    {isTurkish ? axis.labelTr : axis.labelEn}
                  </span>
                  <span className="font-mono font-bold" style={{ color: axis.color }}>
                    %{pct}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: axis.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
