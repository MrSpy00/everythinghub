"use client";

import React from "react";
import {
  Download,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Usb,
  ShieldCheck,
  HardDrive,
  Cpu,
} from "lucide-react";
import { DRIVER_CATALOG, TROUBLESHOOTING_TIPS } from "@/lib/flasher/driver-catalog";

export const DriverGuideTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Introduction Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
            <Usb className="w-5 h-5 text-violet-400" />
            USB-UART Sürücüleri ve Bağlantı Merkezi
          </h3>
          <p className="text-xs text-zinc-300">
            Tarayıcının geliştirme kartınızı tanıması için işletim sisteminize uygun resmi sürücüyü kurmanız gerekebilir.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200 border border-white/15 whitespace-nowrap backdrop-blur-xl">
          Resmi & Güvenli İndirme
        </span>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DRIVER_CATALOG.map((driver) => (
          <div
            key={driver.id}
            className="flex flex-col justify-between p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-zinc-100">{driver.name}</h4>
                <div className="flex items-center gap-1">
                  {driver.supportedOS.map((os) => (
                    <span
                      key={os}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase bg-zinc-900 border border-white/5 text-zinc-300"
                    >
                      {os}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-[11px] font-mono text-violet-300">{driver.chipsets}</span>
              <p className="text-xs text-zinc-300 leading-relaxed">{driver.description}</p>

              {driver.notes && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300 block mb-0.5">Kurulum Notu:</span>
                  {driver.notes}
                </div>
              )}
            </div>

            {/* Download Links */}
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-3.5 border-t border-white/5">
              {driver.downloadUrlWin && (
                <a
                  href={driver.downloadUrlWin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-zinc-200 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-300" />
                  Windows (.exe)
                </a>
              )}
              {driver.downloadUrlMac && (
                <a
                  href={driver.downloadUrlMac}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-zinc-200 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-300" />
                  macOS (.pkg)
                </a>
              )}
              {driver.downloadUrlLinux && (
                <a
                  href={driver.downloadUrlLinux}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl text-zinc-400 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
                  title="Linux Kaynak"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Troubleshooting FAQ & Guides */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-4">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-violet-400" />
          Sık Karşılaşılan Donanım & Bağlantı Hataları
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TROUBLESHOOTING_TIPS.map((tip, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col gap-2">
              <h5 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {tip.title}
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
