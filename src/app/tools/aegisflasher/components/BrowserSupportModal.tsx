"use client";

import React from "react";
import {
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  X,
  Compass,
  Laptop,
  Smartphone,
} from "lucide-react";

interface BrowserSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrowserSupportModal: React.FC<BrowserSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-violet-500/30 p-6 md:p-8 shadow-2xl flex flex-col gap-6 text-zinc-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">
              Web Serial API Gerekliliği
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              aegisFlasher donanım portlarına ve USB cihazlarına doğrudan tarayıcı üzerinden erişir.
            </p>
          </div>
        </div>

        {/* Supported Browsers List */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-zinc-300">
            Tam Destekleyen Tarayıcılar:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Chrome (v89+)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Microsoft Edge (v89+)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Brave Browser</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Opera (v75+)</span>
            </div>
          </div>
        </div>

        {/* Mobile / Android Tip */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex flex-col gap-1.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold">
            <Smartphone className="w-4 h-4 text-violet-400" />
            <span>Android Cihazlarda Kullanım:</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Android Chrome üzerinde OTG kablosuyla mikrokontrolcü flaşlamak için adres çubuğuna <code className="text-violet-300">chrome://flags#enable-web-serial-on-android</code> yazıp özelliği <strong>Enabled</strong> yapın.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 transition-all text-center"
        >
          Anladım, Devam Et
        </button>
      </div>
    </div>
  );
};
