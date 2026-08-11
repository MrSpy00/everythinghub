"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Play,
  Pause,
  Download,
  Trash2,
  Sliders,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";

interface SerialPlotterTabProps {
  status: ConnectionStatus;
  logs: SerialLogMessage[];
  lang: Language;
}

interface DataPoint {
  time: number; // timestamp in ms
  values: Record<string, number>;
}

const CHANNEL_PALETTE = [
  "#38bdf8", // Sky Blue
  "#a855f7", // Violet / Purple
  "#34d399", // Emerald Green
  "#f43f5e", // Rose Red
  "#fbbf24", // Amber Yellow
  "#22d3ee", // Cyan
  "#f97316", // Orange
  "#ec4899", // Pink
];

export const SerialPlotterTab: React.FC<SerialPlotterTabProps> = ({
  status,
  logs,
  lang,
}) => {
  const t = useTranslation(lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [enabledChannels, setEnabledChannels] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [autoScale, setAutoScale] = useState(true);
  const [timeWindowSec, setTimeWindowSec] = useState<number>(15);
  const [manualMin, setManualMin] = useState<number>(0);
  const [manualMax, setManualMax] = useState<number>(100);

  const lastProcessedIndexRef = useRef<number>(0);

  // Parse telemetry values from text
  const parseTelemetryLine = useCallback((text: string): Record<string, number> | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const values: Record<string, number> = {};

    // 1. Try Key:Value format (e.g., "temp:24.5 hum:60.2" or "X:102,Y:405")
    const kvMatches = Array.from(
      trimmed.matchAll(/([a-zA-Z0-9_\-\.]+)\s*[:=]\s*([+\-]?[0-9]+(?:\.[0-9]+)?)/g)
    );
    if (kvMatches.length > 0) {
      kvMatches.forEach((m) => {
        const key = m[1];
        const val = parseFloat(m[2]);
        if (!isNaN(val)) values[key] = val;
      });
      return Object.keys(values).length > 0 ? values : null;
    }

    // 2. Try JSON format (e.g. {"temp": 24.5, "hum": 60})
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        Object.entries(parsed).forEach(([k, v]) => {
          if (typeof v === "number") values[k] = v;
        });
        return Object.keys(values).length > 0 ? values : null;
      } catch {
        // Not valid JSON
      }
    }

    // 3. Try CSV / Tab separated numbers (e.g. "102, 405, 890" or "24.5 60.1")
    const numTokens = trimmed.split(/[\s,;\t]+/).map((v) => parseFloat(v));
    const validNums = numTokens.filter((n) => !isNaN(n));
    if (validNums.length > 0) {
      validNums.forEach((n, idx) => {
        values[`Channel_${idx + 1}`] = n;
      });
      return values;
    }

    return null;
  }, []);

  // Ingest logs reactively
  useEffect(() => {
    if (isPaused || logs.length === 0) return;

    const newPoints: DataPoint[] = [];
    const discoveredChannels = new Set(channels);
    const now = Date.now();

    for (let i = lastProcessedIndexRef.current; i < logs.length; i++) {
      const log = logs[i];
      if (log.direction === "rx" || log.direction === "tx") {
        const parsed = parseTelemetryLine(log.text);
        if (parsed) {
          Object.keys(parsed).forEach((k) => discoveredChannels.add(k));
          newPoints.push({ time: now, values: parsed });
        }
      }
    }

    lastProcessedIndexRef.current = logs.length;

    if (newPoints.length > 0) {
      const updatedChannelList = Array.from(discoveredChannels);
      if (updatedChannelList.length !== channels.length) {
        setChannels(updatedChannelList);
        setEnabledChannels((prev) => {
          const next = { ...prev };
          updatedChannelList.forEach((ch) => {
            if (next[ch] === undefined) next[ch] = true;
          });
          return next;
        });
      }

      setDataPoints((prev) => {
        const merged = [...prev, ...newPoints];
        const cutoff = now - timeWindowSec * 1000 * 2;
        return merged.filter((p) => p.time >= cutoff).slice(-1000);
      });
    }
  }, [logs, isPaused, channels, parseTelemetryLine, timeWindowSec]);

  // Render Canvas Chart at 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = 420);

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.fillRect(0, 0, width, height);

      const paddingLeft = 60;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 40;
      const graphWidth = width - paddingLeft - paddingRight;
      const graphHeight = height - paddingTop - paddingBottom;

      const now = Date.now();
      const startTime = now - timeWindowSec * 1000;

      // Calculate global min / max for auto-scale
      let minVal = autoScale ? Infinity : manualMin;
      let maxVal = autoScale ? -Infinity : manualMax;

      if (autoScale) {
        dataPoints.forEach((p) => {
          if (p.time >= startTime) {
            Object.entries(p.values).forEach(([ch, val]) => {
              if (enabledChannels[ch]) {
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
              }
            });
          }
        });

        if (minVal === Infinity || maxVal === -Infinity) {
          minVal = 0;
          maxVal = 100;
        } else if (minVal === maxVal) {
          minVal -= 10;
          maxVal += 10;
        } else {
          // Add 10% margin
          const margin = (maxVal - minVal) * 0.1;
          minVal -= margin;
          maxVal += margin;
        }
      }

      // Draw Grid Lines & Y-Axis Labels
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.fillStyle = "rgba(161, 161, 170, 0.8)";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";

      const ySteps = 5;
      for (let i = 0; i <= ySteps; i++) {
        const y = paddingTop + (graphHeight / ySteps) * i;
        const val = maxVal - ((maxVal - minVal) / ySteps) * i;

        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();

        ctx.fillText(val.toFixed(1), paddingLeft - 8, y + 3);
      }

      // Time X-Axis Ticks
      const xSteps = 6;
      ctx.textAlign = "center";
      for (let i = 0; i <= xSteps; i++) {
        const x = paddingLeft + (graphWidth / xSteps) * i;
        const timeOffsetSec = Math.round(timeWindowSec - (timeWindowSec / xSteps) * i);

        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, height - paddingBottom);
        ctx.stroke();

        ctx.fillText(`-${timeOffsetSec}s`, x, height - paddingBottom + 16);
      }

      // Draw Waveforms for each enabled channel
      channels.forEach((ch, chIdx) => {
        if (!enabledChannels[ch]) return;

        const color = CHANNEL_PALETTE[chIdx % CHANNEL_PALETTE.length];
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();

        let hasMoved = false;

        for (let i = 0; i < dataPoints.length; i++) {
          const p = dataPoints[i];
          if (p.time < startTime) continue;
          const val = p.values[ch];
          if (val === undefined) continue;

          const x = paddingLeft + ((p.time - startTime) / (timeWindowSec * 1000)) * graphWidth;
          const clampedVal = Math.max(minVal, Math.min(maxVal, val));
          const y =
            paddingTop +
            graphHeight -
            ((clampedVal - minVal) / (maxVal - minVal)) * graphHeight;

          if (!hasMoved) {
            ctx.moveTo(x, y);
            hasMoved = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [dataPoints, channels, enabledChannels, autoScale, manualMin, manualMax, timeWindowSec]);

  // Statistics calculation for active channels
  const channelStats = useMemo(() => {
    const stats: Record<string, { min: number; max: number; avg: number; current: number }> = {};
    channels.forEach((ch) => {
      const vals = dataPoints.map((p) => p.values[ch]).filter((v) => v !== undefined) as number[];
      if (vals.length > 0) {
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        const current = vals[vals.length - 1];
        stats[ch] = { min, max, avg, current };
      }
    });
    return stats;
  }, [dataPoints, channels]);

  const handleExportCsv = () => {
    if (dataPoints.length === 0) return;
    const header = ["Timestamp_ms", ...channels].join(",");
    const rows = dataPoints.map((p) => {
      const vals = channels.map((ch) => (p.values[ch] !== undefined ? p.values[ch] : ""));
      return [p.time, ...vals].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `serial_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              {t("plotter_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                60 FPS Live Canvas
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("plotter_desc")}</p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold backdrop-blur-xl transition-all shadow-md active:scale-95 ${
              isPaused
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-white/[0.05] text-zinc-200 border border-white/10 hover:bg-white/[0.1]"
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? t("plotter_resume") : t("plotter_pause")}
          </button>

          {/* Time Window Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-2xl px-3 py-1.5 text-xs">
            <span className="text-zinc-400 font-medium">{t("plotter_time_window")}:</span>
            <select
              aria-label={t("plotter_time_window")}
              value={timeWindowSec}
              onChange={(e) => setTimeWindowSec(Number(e.target.value))}
              className="bg-transparent text-zinc-200 focus:outline-none font-bold"
            >
              <option value={5} className="bg-zinc-900">5s</option>
              <option value={15} className="bg-zinc-900">15s</option>
              <option value={30} className="bg-zinc-900">30s</option>
              <option value={60} className="bg-zinc-900">60s</option>
            </select>
          </div>

          {/* Auto-Scale Toggle */}
          <button
            type="button"
            onClick={() => setAutoScale(!autoScale)}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-semibold backdrop-blur-xl transition-all ${
              autoScale
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "bg-white/[0.03] text-zinc-400 border border-white/10"
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            {t("plotter_autoscale")}
          </button>

          {/* Export CSV Data Logger */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={dataPoints.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-zinc-200 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] backdrop-blur-xl transition-all disabled:opacity-40"
            title="CSV Data Logger"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            {t("plotter_export_csv")}
          </button>

          {/* Clear Buffer */}
          <button
            type="button"
            onClick={() => setDataPoints([])}
            className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 backdrop-blur-xl transition-all"
            title={t("plotter_clear")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Waveform Display Screen */}
      <div className="relative w-full rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-black/60 backdrop-blur-3xl flex flex-col">
        <canvas ref={canvasRef} className="w-full h-[420px] block cursor-crosshair" />

        {dataPoints.length === 0 && (
          <div className="absolute inset-0 m-auto flex flex-col items-center justify-center gap-2 p-6 text-center text-zinc-500 text-xs pointer-events-none">
            <Activity className="w-10 h-10 text-zinc-700 animate-pulse" />
            <span className="max-w-md text-zinc-400">{t("plotter_no_data")}</span>
          </div>
        )}
      </div>

      {/* Channel Badges & Statistics Card */}
      {channels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((ch, idx) => {
            const color = CHANNEL_PALETTE[idx % CHANNEL_PALETTE.length];
            const isEnabled = enabledChannels[ch] !== false;
            const stat = channelStats[ch];

            return (
              <div
                key={ch}
                onClick={() =>
                  setEnabledChannels((prev) => ({ ...prev, [ch]: !prev[ch] }))
                }
                className={`cursor-pointer flex flex-col justify-between p-4 rounded-3xl border backdrop-blur-2xl transition-all duration-200 select-none shadow-xl ${
                  isEnabled
                    ? "bg-zinc-950/70 border-white/10 hover:border-white/20 scale-[1.01]"
                    : "bg-zinc-950/30 border-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: color, color }}
                    />
                    <span className="text-xs font-bold text-zinc-100 truncate">{ch}</span>
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color }}>
                    {stat ? stat.current.toFixed(2) : "0.0"}
                  </span>
                </div>

                {stat && (
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                    <div className="flex flex-col">
                      <span>{t("stat_min")}:</span>
                      <span className="text-zinc-300 font-semibold">{stat.min.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span>{t("stat_avg")}:</span>
                      <span className="text-zinc-300 font-semibold">{stat.avg.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span>{t("stat_max")}:</span>
                      <span className="text-zinc-300 font-semibold">{stat.max.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
