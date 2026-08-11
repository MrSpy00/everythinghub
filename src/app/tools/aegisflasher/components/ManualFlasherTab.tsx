"use client";

import React, { useRef } from "react";
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

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Presets Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-white/10 backdrop-blur-2xl">
        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-violet-400" />
          Hızlı Bölüm Şablonları:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onApplyPreset("esp32_4mb")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all"
          >
            ESP32 Standart 4MB
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("esp32_s3")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all"
          >
            ESP32-S3 8MB/16MB
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("esp8266")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all"
          >
            ESP8266 4MB
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("arduino_hex")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all"
          >
            Arduino Uno/Nano (.hex)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("rp2040_uf2")}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all"
          >
            RP2040 Pico (.uf2)
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-zinc-950/40 hover:bg-violet-950/10 cursor-pointer transition-all duration-300"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".bin,.hex,.uf2,.elf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              Array.from(e.target.files).forEach((f) => onAddFile(f));
            }
          }}
          className="hidden"
        />
        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="text-sm md:text-base font-bold text-zinc-100 mt-4">
          Firmware Dosyalarını Buraya Sürükleyin veya Tıklayın
        </h4>
        <p className="text-xs text-zinc-400 mt-1 text-center max-w-md">
          Çoklu dosya desteği: <code className="text-violet-300">.bin</code>, <code className="text-violet-300">.hex</code>, <code className="text-violet-300">.uf2</code> formatları otomatik ayrıştırılır.
        </p>
      </div>

      {/* Partition Files List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-violet-400" />
            Yazılacak Bölümler ({files.length} Dosya — {(totalBytes / 1024).toFixed(1)} KB)
          </h4>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Dosya Ekle
          </button>
        </div>

        {files.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950/40 border border-white/5 text-center text-xs text-zinc-500">
            Henüz dosya eklenmedi. Yukarıdaki alana sürükleyebilir veya bir şablon seçebilirsiniz.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-violet-400">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-100 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {(file.sizeBytes / 1024).toFixed(1)} KB
                      {file.md5Checksum && ` • MD5: ${file.md5Checksum.slice(0, 8)}...`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400 font-mono">Offset:</span>
                    <input
                      type="text"
                      value={file.offsetHex}
                      onChange={(e) => onUpdateOffset(file.id, e.target.value)}
                      className="w-24 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-center text-violet-300 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Bölümü Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flashing Options */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={eraseAll}
            onChange={(e) => onToggleEraseAll(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 text-violet-600 focus:ring-violet-500 bg-zinc-900"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">
              Tüm Flash Belleği Sil (Erase Flash Before Write)
            </span>
            <span className="text-[11px] text-zinc-400">
              Eski veya bozulmuş bölüm yapılarını sıfırlamak için önerilir.
            </span>
          </div>
        </label>

        {/* Start Flashing Button */}
        <button
          type="button"
          onClick={onStartFlashing}
          disabled={
            files.length === 0 ||
            status === "flashing" ||
            status === "erasing" ||
            status === "reading"
          }
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs md:text-sm font-bold text-white bg-violet-600/25 border border-violet-500/50 hover:bg-violet-600/40 hover:border-violet-400 shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 fill-current text-violet-300" />
          Flaşlamayı Başlat
        </button>
      </div>

      {/* Progress Bar (When flashing or erasing) */}
      {(status === "flashing" || status === "erasing" || status === "reading") && (
        <div className="flex flex-col gap-2 p-5 rounded-3xl bg-zinc-950/80 border border-violet-500/30 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-violet-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400 animate-pulse" />
              {currentStatusText || "İşlem yürütülüyor..."}
            </span>
            <span className="font-mono font-bold text-white">%{progressPercent}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
