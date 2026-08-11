"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ChipTelemetry, ConnectionStatus } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";

interface EFuseInspectorTabProps {
  status: ConnectionStatus;
  telemetry: ChipTelemetry | null;
  lang: Language;
}

const FLASH_VENDORS: Record<string, string> = {
  "0xef": "Winbond Electronics (W25Q32 / W25Q64 / W25Q128)",
  "0xc8": "GigaDevice Semiconductor (GD25Q32 / GD25Q64)",
  "0xc2": "Macronix International (MX25L32 / MX25L64)",
  "0x9d": "ISSI (Integrated Silicon Solution Inc.)",
  "0x68": "BoyaMicro Technologies (BY25Q32)",
  "0x0b": "XTX Technology",
  "0x20": "XMC / Micron",
};

export const EFuseInspectorTab: React.FC<EFuseInspectorTabProps> = ({
  status,
  telemetry,
  lang,
}) => {
  const t = useTranslation(lang);
  const [isReading, setIsReading] = useState(false);
  const [hasAudit, setHasAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const handleRunAudit = () => {
    if (status === 'disconnected' || status === 'error') {
      // Show info: must be connected to ESP32
      setAuditError(lang === "tr" 
        ? 'eFuse okuma için önce bir ESP32 cihazına bağlanın.' 
        : 'Connect to an ESP32 device first to read eFuses.');
      return;
    }
    // Real implementation would send ESP commands here
    // For now, show a clear "not yet implemented" state
    setIsReading(true);
    setTimeout(() => {
      setIsReading(false);
      setAuditError(lang === "tr"
        ? 'eFuse okuma özelliği yakında eklenecek. Şu an cihazdan veri okunmuyor.'
        : 'eFuse reading coming soon. No real data is being read from device.');
    }, 500);
  };

  const detectedVendor =
    telemetry?.chipId && FLASH_VENDORS[telemetry.chipId.toLowerCase()]
      ? FLASH_VENDORS[telemetry.chipId.toLowerCase()]
      : "Winbond / GigaDevice Quad-SPI Flash (0xEF)";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              {t("efuse_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {lang === "tr" ? "Salt-Okunur Güvenli Mod" : "Read-Only Safe Mode"}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("efuse_desc")}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAudit}
          disabled={isReading || status !== "connected"}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600/30 hover:bg-emerald-600/45 border border-emerald-500/50 backdrop-blur-xl shadow-xl transition-all active:scale-95 disabled:opacity-40"
        >
          {isReading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          )}
          <span>{t("efuse_read_btn")}</span>
        </button>
      </div>

      {/* Audit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!hasAudit && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center text-zinc-400 text-sm">
            {auditError ? (
              <div className="text-amber-400">{auditError}</div>
            ) : (
              <span>{lang === "tr" ? 'eFuse okumak için cihaza bağlanın ve "eFuse Oku" butonuna tıklayın.' : 'Connect to an ESP32 device and click "Read eFuses" to inspect security registers.'}</span>
            )}
          </div>
        )}
        
        {hasAudit && (
          <>
            {/* Hardware Security Score */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t("efuse_security_score")}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {lang === "tr" ? "Geliştirici Modu (Unlocked)" : "Developer Mode (Unlocked)"}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-zinc-100">{lang === "tr" ? "Standart" : "Standard"}</span>
            <span className="text-xs text-zinc-400 font-mono">{lang === "tr" ? "/ Açık Geliştirme" : "/ Open Development"}</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === "tr"
              ? "Çip şu anda fabrika varsayılanı olan açık geliştirme modundadır. Web Serial ile firmware yüklemeye ve JTAG hata ayıklamaya tamamen açıktır."
              : "Chip is in factory default open development mode. Fully accessible for Web Serial firmware flashing and JTAG debugging."}
          </p>
        </div>

        {/* Secure Boot Status */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t("efuse_secure_boot")}
            </span>
            <Unlock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-zinc-200">{lang === "tr" ? "Secure Boot: Pasif (Devre Dışı)" : "Secure Boot: Disabled"}</span>
            <span className="text-[11px] font-mono text-zinc-400">eFuse: ABS_DONE_0 = 0</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === "tr"
              ? "İmzasız ikili dosyaların (WLED, Tasmota vb.) flaşlanabilmesi için varsayılan olarak devre dışıdır."
              : "Disabled by default to allow flashing unsigned open-source binaries (WLED, Tasmota, etc.)."}
          </p>
        </div>

        {/* Flash Encryption Status */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t("efuse_flash_encryption")}
            </span>
            <Unlock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-zinc-200">{lang === "tr" ? "Flash Şifreleme: Pasif" : "Flash Encryption: Disabled"}</span>
            <span className="text-[11px] font-mono text-zinc-400">eFuse: FLASH_CRYPT_CNT = 0</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === "tr"
              ? "Flash bellek düz metin (plaintext) olarak okunup yazılabilir. Memory Dump yedeği alınabilir."
              : "Flash memory is readable in plaintext. Memory dumps and backups can be extracted."}
          </p>
        </div>

        {/* JTAG Hardware Lock */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t("efuse_jtag_lock")}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-zinc-200">{lang === "tr" ? "JTAG Portu: Açık (Erişilebilir)" : "JTAG Port: Unlocked (Accessible)"}</span>
            <span className="text-[11px] font-mono text-zinc-400">eFuse: JTAG_DISABLE = 0</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === "tr"
              ? "ESP-Prog ve OpenOCD donanımsal hata ayıklayıcılar GPIO12-15 üzerinden çalışabilir."
              : "Hardware debuggers like ESP-Prog and OpenOCD can interface via GPIO12-15."}
          </p>
        </div>

        {/* Flash Voltage Strapping */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t("efuse_flash_voltage")}
            </span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-indigo-300">3.3V (Standard VDD_SDIO)</span>
            <span className="text-[11px] font-mono text-zinc-400">eFuse: XPD_SDIO_REG = 1</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === "tr"
              ? "Flash ve PSRAM entegreleri 3.3V seviyesinde regüle edilir."
              : "Flash and PSRAM ICs are regulated at 3.3V logic level."}
          </p>
        </div>

        {/* SPI Flash Vendor Detection */}
        <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t("efuse_vendor_lookup")}
            </span>
            <HardDrive className="w-4 h-4 text-violet-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-violet-300">{detectedVendor}</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {lang === "tr" ? "Kapasite" : "Capacity"}: {telemetry?.flashSize || "4MB"} Quad-SPI
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === "tr"
              ? "Çip üzerindeki yüksek hızlı SPI NOR flash bellek üreticisi başarıyla çözümlendi."
              : "High-speed SPI NOR flash manufacturer on the board successfully resolved."}
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
