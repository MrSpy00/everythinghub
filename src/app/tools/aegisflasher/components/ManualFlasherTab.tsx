"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Upload,
  Plus,
  Trash2,
  FileCode,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Settings2,
  HardDrive,
  Clock,
  Activity,
  Cpu,
  Info,
} from "lucide-react";
import { ConnectionStatus, FlashPartitionFile } from "@/lib/flasher/types";

interface ManualFlasherTabProps {
  status: ConnectionStatus;
  files: FlashPartitionFile[];
  onAddFile: (file: File, offsetHex?: string) => void;
  onRemoveFile: (id: string) => void;
  onUpdateOffset: (id: string, offsetHex: string) => void;
  onApplyPreset: (presetId: string) => void;
  eraseAll: boolean;
  onToggleEraseAll: (val: boolean) => void;
  onStartFlashing: () => void;
  progressPercent: number;
  currentStatusText: string;
}

export const ManualFlasherTab: React.FC<ManualFlasherTabProps> = ({
  status,
  files,
  onAddFile,
  onRemoveFile,
  onUpdateOffset,
  onApplyPreset,
  eraseAll,
  onToggleEraseAll,
  onStartFlashing,
  progressPercent,
  currentStatusText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: any = null;
    if (status === "flashing" || status === "erasing" || status === "reading") {
      if (!startTime) setStartTime(Date.now());
      timer = setInterval(() => {
        if (startTime) {
          setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    } else {
      setStartTime(null);
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, startTime]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => onAddFile(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const totalBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);

  // Speed estimation
  const bytesWritten = Math.round((totalBytes * progressPercent) / 100);
  const speedKbps =
    elapsedSeconds > 0 ? (bytesWritten / 1024 / elapsedSeconds).toFixed(1) : "0.0";
  const remainingSeconds =
    progressPercent > 0 && progressPercent < 100 && elapsedSeconds > 0
      ? Math.max(0, Math.round(((100 - progressPercent) / progressPercent) * elapsedSeconds))
      : 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Presets Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-violet-400" />
          Hızlı Bölüm Şablonları:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onApplyPreset("esp32_4mb")}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] text-zinc-300 border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
          >
            ESP32 Standart 4MB
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("esp32_s3")}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] text-zinc-300 border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
          >
            ESP32-S3 (8MB/16MB)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("esp8266")}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] text-zinc-300 border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
          >
            ESP8266 (0x0 Tek İmaj)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("arduino_hex")}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] text-zinc-300 border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
          >
            Arduino Intel HEX (.hex)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("rp2040_uf2")}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] text-zinc-300 border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
          >
            RP2040 Pico (.uf2)
          </button>
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-white/15 hover:border-violet-500/50 bg-zinc-950/60 hover:bg-zinc-900/60 backdrop-blur-3xl transition-all duration-300 text-center shadow-2xl"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".bin,.hex,.uf2"
          onChange={(e) => {
            if (e.target.files) {
              Array.from(e.target.files).forEach((file) => onAddFile(file));
            }
          }}
          className="hidden"
        />
        <div className="p-4 rounded-3xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-zinc-100">
          Firmware Dosyalarını Sürükleyip Bırakın veya Seçin
        </h4>
        <p className="text-xs text-zinc-400 max-w-md mt-1">
          <code className="text-violet-300">.bin</code>, <code className="text-violet-300">.hex</code> veya{" "}
          <code className="text-violet-300">.uf2</code> uzantılı dosyalar desteklenir. Otomatik ofset eşleştirmesi yapılır.
        </p>
      </div>

      {/* Partition Files List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Yazılacak Bölümler ({files.length} Dosya • {(totalBytes / 1024).toFixed(1)} KB)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Dosya Ekle
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-violet-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-800 text-violet-400 shrink-0">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-100 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {file.sizeBytes > 0
                        ? `${(file.sizeBytes / 1024).toFixed(1)} KB (${file.sizeBytes.toLocaleString()} bayt)`
                        : "Dosya bekleniyor..."}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400 font-mono">Ofset:</span>
                    <input
                      type="text"
                      value={file.offsetHex}
                      onChange={(e) => onUpdateOffset(file.id, e.target.value)}
                      className="w-24 bg-zinc-950 border border-white/10 rounded-xl px-2 py-1 text-xs text-center font-mono text-violet-300 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress & Live Telemetry Panel (When Flashing) */}
      {(status === "flashing" || status === "erasing" || status === "reading") && (
        <div className="flex flex-col gap-3 p-6 rounded-3xl bg-zinc-950/80 border border-violet-500/40 backdrop-blur-3xl shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-violet-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
              {currentStatusText || "Yazma işlemi devam ediyor..."}
            </span>
            <span className="font-mono text-sm font-bold text-violet-400">%{progressPercent}</span>
          </div>

          {/* Progress bar with neon glow */}
          <div className="w-full h-3 rounded-full bg-zinc-900 border border-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_#8b5cf6]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Live Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-mono text-zinc-400">
            <div className="flex flex-col">
              <span>Yazılan Bayt</span>
              <span className="text-zinc-200 font-bold">
                {(bytesWritten / 1024).toFixed(1)} / {(totalBytes / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex flex-col">
              <span>Aktarım Hızı</span>
              <span className="text-emerald-400 font-bold">{speedKbps} KB/s</span>
            </div>
            <div className="flex flex-col">
              <span>Geçen Süre</span>
              <span className="text-zinc-200 font-bold">{elapsedSeconds}s</span>
            </div>
            <div className="flex flex-col">
              <span>Tahmini Kalan (ETA)</span>
              <span className="text-indigo-300 font-bold">
                {remainingSeconds > 0 ? `~${remainingSeconds}s` : "Tamamlanıyor"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Flashing Action Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={eraseAll}
            onChange={(e) => onToggleEraseAll(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-zinc-900 text-violet-600 focus:ring-0 focus:ring-offset-0"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">
              Yazmadan Önce Tüm Flash'ı Sil (Erase Flash)
            </span>
            <span className="text-[10px] text-zinc-500">
              Temiz kurulum için önerilir. NVS ve önceki ayarlar silinir.
            </span>
          </div>
        </label>

        <button
          type="button"
          onClick={onStartFlashing}
          disabled={
            files.length === 0 ||
            status === "flashing" ||
            status === "erasing" ||
            status === "reading"
          }
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs md:text-sm font-bold text-white bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/40 hover:border-violet-400 backdrop-blur-2xl shadow-xl shadow-violet-500/10 transition-all active:scale-95 disabled:opacity-40"
        >
          <Zap className="w-4 h-4 text-violet-300" />
          Flaşlamayı Başlat (Flash Device)
        </button>
      </div>
    </div>
  );
};
