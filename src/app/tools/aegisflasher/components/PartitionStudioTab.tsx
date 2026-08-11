"use client";

import React, { useState } from "react";
import {
  Layers,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
} from "lucide-react";
import {
  PARTITION_PRESETS,
  PartitionTableEngine,
} from "@/lib/flasher/partition-table-engine";
import { PartitionTableEntry } from "@/lib/flasher/types";

export const PartitionStudioTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState("ota_4mb");
  const [partitions, setPartitions] = useState<PartitionTableEntry[]>(
    PARTITION_PRESETS[1].entries
  );

  const validation = PartitionTableEngine.validate(partitions, 4 * 1024 * 1024);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = PARTITION_PRESETS.find((x) => x.id === presetId);
    if (p) setPartitions(p.entries);
  };

  const handleDownloadCsv = () => {
    const csvText = PartitionTableEngine.toCsv(partitions);
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partitions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBin = () => {
    const binData = PartitionTableEngine.generateBinary(partitions);
    const blob = new Blob([binData as any], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partitions_0x8000.bin`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalFlashBytes = 4 * 1024 * 1024; // 4MB base for bar calculation

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Preset Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <Layers className="w-4 h-4 text-violet-400" />
          Hazır Bölüm Şablonu:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PARTITION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                selectedPresetId === preset.id
                  ? "bg-white/[0.1] text-zinc-100 border border-white/20 shadow-md backdrop-blur-xl scale-[1.02]"
                  : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-white/[0.06]"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Flash Memory Map Bar */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            Görsel Bellek Haritası (Flash Layout)
          </h4>
          <span className="text-xs font-mono text-zinc-400">Toplam: 4.0 MB Flash</span>
        </div>

        {/* Proportional Memory Bar */}
        <div className="w-full h-11 rounded-2xl bg-zinc-900 border border-white/10 p-1 flex items-center gap-1 overflow-hidden shadow-inner">
          {/* Reserved bootloader 0x0 - 0x9000 */}
          <div
            className="h-full rounded-xl bg-zinc-700/60 border border-zinc-600/40 flex items-center justify-center text-[10px] font-mono text-zinc-300 px-2 truncate select-none"
            style={{ width: `${(0x9000 / totalFlashBytes) * 100}%`, minWidth: "40px" }}
            title="Bootloader & Table (0x0 - 0x9000)"
          >
            Boot
          </div>

          {partitions.map((p) => {
            const widthPct = Math.max(4, (p.size / totalFlashBytes) * 100);
            return (
              <div
                key={p.id}
                className="h-full rounded-xl flex items-center justify-center text-[10px] font-mono font-bold text-white px-1.5 truncate transition-all hover:brightness-125 select-none"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: p.color || "#8b5cf6",
                  border: `1px solid rgba(255,255,255,0.25)`,
                }}
                title={`${p.name} (0x${p.offset.toString(16)} - ${(p.size / 1024).toFixed(0)} KB)`}
              >
                {p.name}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {partitions.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="font-semibold">{p.name}:</span>
              <span className="font-mono text-zinc-400">{(p.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Status */}
      {validation.errors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-1.5 text-xs text-rose-200">
          <span className="font-bold flex items-center gap-1.5 text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Bellek Çakışması / Hata Tespit Edildi:
          </span>
          {validation.errors.map((err, i) => (
            <span key={i} className="font-mono ml-5 text-rose-300">
              • {err}
            </span>
          ))}
        </div>
      )}

      {/* Partition Table List */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Bölüm Tablosu Satırları ({partitions.length} Alan)
          </h4>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium text-zinc-200 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] backdrop-blur-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              CSV İndir
            </button>
            <button
              type="button"
              onClick={handleDownloadBin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/35 backdrop-blur-xl transition-all"
            >
              <FileCode className="w-3.5 h-3.5 text-violet-300" />
              Binary (.bin) İndir
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="pb-2.5 font-semibold">Adı (Name)</th>
                <th className="pb-2.5 font-semibold">Türü (Type)</th>
                <th className="pb-2.5 font-semibold">Alt Tür (SubType)</th>
                <th className="pb-2.5 font-semibold">Başlangıç Ofseti</th>
                <th className="pb-2.5 font-semibold">Boyut (Size)</th>
                <th className="pb-2.5 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {partitions.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-bold text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    {row.name}
                  </td>
                  <td className="py-3 text-zinc-300">{row.type}</td>
                  <td className="py-3 text-violet-300">{row.subType}</td>
                  <td className="py-3 text-emerald-400">0x{row.offset.toString(16)}</td>
                  <td className="py-3 text-zinc-300">
                    0x{row.size.toString(16)} ({(row.size / 1024).toFixed(0)} KB)
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setPartitions(partitions.filter((p) => p.id !== row.id))}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Satırı Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
