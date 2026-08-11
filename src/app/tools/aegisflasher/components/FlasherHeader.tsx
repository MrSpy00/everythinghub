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
} from "lucide-react";
import MeshText from "@/components/creative/MeshText";
import { ChipTelemetry, ConnectionStatus } from "@/lib/flasher/types";

interface FlasherHeaderProps {
  status: ConnectionStatus;
  telemetry: ChipTelemetry | null;
  selectedBaud: number;
  onBaudChange: (baud: number) => void;
  onConnect: () => void;
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
  onDisconnect,
  onHardReset,
  isSerialSupported,
}) => {
  return (
    <header className="relative w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Badges & Mesh Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-violet-500/10 border border-violet-500/30 text-violet-300">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                Universal Hardware Studio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Web Serial & WebUSB
              </span>
              {isSerialSupported ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Web Serial Destekleniyor
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Chromium Tarayıcı Gerekli
                </span>
              )}
            </div>

            {/* Mesh Title */}
            <div className="w-full max-w-lg mt-1">
              <MeshText
                text="aegisFlasher"
                fontSize={42}
                height="60px"
                gradientColors={["#a78bfa", "#ec4899", "#60a5fa", "#34d399"]}
                className="justify-start text-left"
              />
            </div>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              ESP32, ESP8266, Arduino AVR, Raspberry Pi Pico ve STM32 için sıfır kurulumlu, tarayıcı tabanlı yüksek hızlı firmware flaşlayıcı, akıllı telemetri ve ANSI seri monitör stüdyosu.
            </p>
          </div>

          {/* Connection Control Action Box */}
          <div className="flex flex-col gap-3 min-w-[280px] p-4 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-2xl">
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

            {/* Baud Selector */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-zinc-500" />
                Hız:
              </label>
              <select
                aria-label="Flaşlama ve Seri Port Baud Hızı Seçimi"
                value={selectedBaud}
                onChange={(e) => onBaudChange(Number(e.target.value))}
                disabled={status === "flashing" || status === "erasing" || status === "reading"}
                className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value={115200}>115,200 baud (Standart)</option>
                <option value={230400}>230,400 baud</option>
                <option value={460800}>460,800 baud (Hızlı)</option>
                <option value={921600}>921,600 baud (Ultra Hızlı)</option>
                <option value={1500000}>1,500,000 baud (Maksimum)</option>
                <option value={57600}>57,600 baud (Eski Nano)</option>
                <option value={9600}>9,600 baud</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 mt-1">
              {status === "disconnected" || status === "error" ? (
                <button
                  type="button"
                  onClick={onConnect}
                  disabled={!isSerialSupported}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 hover:border-violet-400 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Usb className="w-4 h-4 text-violet-400" />
                  Cihaz Seç & Bağlan
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all active:scale-95"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-400" />
                    Bağlantıyı Kes
                  </button>
                  <button
                    type="button"
                    onClick={onHardReset}
                    title="Donanımsal Reset (EN/RTS pulse)"
                    className="inline-flex items-center justify-center p-2 rounded-xl text-xs text-zinc-300 bg-zinc-900 border border-white/10 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Bar (When connected) */}
        {telemetry && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-violet-500/20">
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">Çip Modeli</span>
              <span className="text-xs font-bold text-violet-300 truncate" title={telemetry.modelName}>
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
                <span className="text-[11px] text-indigo-300 truncate">
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
