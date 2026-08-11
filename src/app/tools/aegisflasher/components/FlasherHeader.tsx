"use client";

import React from "react";
import {
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Usb,
  Power,
  RefreshCw,
  Sliders,
  Terminal,
  ChevronDown,
} from "lucide-react";
import MeshText from "@/components/creative/MeshText";
import { ChipTelemetry, ConnectionStatus } from "@/lib/flasher/types";

interface FlasherHeaderProps {
  status: ConnectionStatus;
  telemetry: ChipTelemetry | null;
  selectedBaud: number;
  onBaudChange: (baud: number) => void;
  onConnect: () => void;
  onConnectTerminalOnly?: () => void;
  onDisconnect: () => void;
  onHardReset: () => void;
  isSerialSupported: boolean;
}

export const FlasherHeader: React.FC<FlasherHeaderProps> = ({
  status,
  telemetry,
  selectedBaud,
  onBaudChange,
  onConnect,
  onConnectTerminalOnly,
  onDisconnect,
  onHardReset,
  isSerialSupported,
}) => {
  return (
    <header className="relative w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
      {/* Ambient background metallic glass glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-slate-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-zinc-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Badges & Metallic Mesh Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/[0.06] border border-white/15 text-zinc-200 backdrop-blur-xl shadow-sm">
                <Cpu className="w-3.5 h-3.5 text-zinc-300" />
                Universal Hardware Studio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/[0.04] border border-white/10 text-zinc-300 backdrop-blur-xl shadow-sm">
                <Zap className="w-3.5 h-3.5 text-slate-300" />
                Web Serial & WebUSB
              </span>
              {isSerialSupported ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Web Serial Hazır
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onConnect}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Chromium Tarayıcı Gerekli
                </button>
              )}
            </div>

            {/* Silver & Anthracite Metallic Mesh Title */}
            <div className="w-full max-w-lg mt-1">
              <MeshText
                text="aegisFlasher"
                fontSize={44}
                height="64px"
                gradientColors={["#ffffff", "#f8fafc", "#cbd5e1", "#94a3b8", "#64748b", "#334155", "#e2e8f0"]}
                className="justify-start text-left font-black tracking-tight"
              />
            </div>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              ESP32, ESP8266, Arduino AVR, Raspberry Pi Pico ve STM32 için sıfır kurulumlu, tarayıcı tabanlı yüksek hızlı firmware flaşlayıcı, akıllı telemetri ve ANSI seri monitör stüdyosu.
            </p>
          </div>

          {/* Connection Control Action Box */}
          <div className="flex flex-col gap-3 min-w-[290px] p-5 rounded-3xl border border-white/10 bg-zinc-950/70 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
                Bağlantı Durumu
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status === "connected"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : status === "flashing" || status === "syncing"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                    : "bg-zinc-800/80 text-zinc-400 border border-zinc-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "connected"
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      : status === "flashing" || status === "syncing"
                      ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                      : "bg-zinc-500"
                  }`}
                />
                {status === "connected"
                  ? "Bağlı"
                  : status === "syncing"
                  ? "Eşitleniyor..."
                  : status === "flashing"
                  ? "Flaşlanıyor..."
                  : status === "erasing"
                  ? "Siliniyor..."
                  : status === "reading"
                  ? "Okunuyor..."
                  : "Bağlantı Yok"}
              </span>
            </div>

            {/* Baud Selector with Custom Chevron */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-zinc-500" />
                Hız:
              </label>
              <div className="relative flex-1 max-w-[170px]">
                <select
                  aria-label="Flaşlama ve Seri Port Baud Hızı Seçimi"
                  value={selectedBaud}
                  onChange={(e) => onBaudChange(Number(e.target.value))}
                  disabled={status === "flashing" || status === "erasing" || status === "reading"}
                  className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-xl pl-2.5 pr-7 py-1 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value={115200}>115,200 baud</option>
                  <option value={230400}>230,400 baud</option>
                  <option value={460800}>460,800 baud</option>
                  <option value={921600}>921,600 baud</option>
                  <option value={1500000}>1,500,000 baud</option>
                  <option value={57600}>57,600 baud</option>
                  <option value={9600}>9,600 baud</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Liquid Glass Buttons */}
            <div className="flex flex-col gap-2 mt-1">
              {status === "disconnected" || status === "error" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onConnect}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-zinc-100 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 backdrop-blur-2xl shadow-xl transition-all active:scale-95"
                  >
                    <Usb className="w-4 h-4 text-zinc-300" />
                    Cihaz Seç & Bağlan
                  </button>
                  {onConnectTerminalOnly && (
                    <button
                      type="button"
                      onClick={onConnectTerminalOnly}
                      title="Sadece Seri Terminal / Log Modunda Bağlan (Flaşlamasız)"
                      className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      <Terminal className="w-4 h-4 text-violet-400" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 backdrop-blur-xl transition-all active:scale-95"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-400" />
                    Bağlantıyı Kes
                  </button>
                  <button
                    type="button"
                    onClick={onHardReset}
                    title="Donanımsal Reset (EN/RTS darbesi)"
                    className="inline-flex items-center justify-center p-2.5 rounded-2xl text-xs text-zinc-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Bar (When connected) */}
        {telemetry && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-2xl shadow-xl">
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">Çip Modeli</span>
              <span className="text-xs font-bold text-zinc-200 truncate" title={telemetry.modelName}>
                {telemetry.modelName}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">MAC / Cihaz ID</span>
              <span className="text-xs font-mono font-medium text-zinc-200">
                {telemetry.macAddress || telemetry.chipId || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">Flash Boyutu</span>
              <span className="text-xs font-bold text-emerald-400">{telemetry.flashSize || "4MB"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">Flash Hızı & Modu</span>
              <span className="text-xs font-mono text-zinc-200">
                {telemetry.flashFrequency || "80MHz"} ({telemetry.flashMode || "DIO"})
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">Kristal Saat</span>
              <span className="text-xs font-mono text-zinc-200">{telemetry.crystalFreq || "40MHz"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">Özellikler</span>
              <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-[11px] text-slate-300 truncate">
                  {telemetry.features.slice(0, 2).join(", ") || "Standart"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
