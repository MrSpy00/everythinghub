"use client";

import React, { useState } from "react";
import {
  HardDrive,
  Download,
  Trash2,
  Wifi,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { ChipTelemetry, ConnectionStatus } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";
import { NvsConfigEntry, NvsConfigGenerator } from "@/lib/flasher/nvs-config-generator";
import { FlasherSelect } from "./FlasherSelect";

interface ChipToolsTabProps {
  status: ConnectionStatus;
  telemetry: ChipTelemetry | null;
  onReadFlashDump: (offset: number, sizeBytes: number) => void;
  onEraseChip: () => void;
  onFlashNvs: (nvsBinary: Uint8Array, offset: number) => void;
  lang?: Language;
}

export const ChipToolsTab: React.FC<ChipToolsTabProps> = ({
  status,
  telemetry,
  onReadFlashDump,
  onEraseChip,
  onFlashNvs,
  lang = "tr",
}) => {
  const t = useTranslation(lang);
  // Dump settings
  const [dumpOffsetHex, setDumpOffsetHex] = useState("0x0");
  const [dumpSizeMb, setDumpSizeMb] = useState<number>(4);

  // NVS Generator settings
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [deviceName, setDeviceName] = useState("aegis-device");
  const [mqttHost, setMqttHost] = useState("");
  const [mqttPort, setMqttPort] = useState("1883");

  const handleGenerateAndFlashNvs = () => {
    const entries: NvsConfigEntry[] = [];
    if (wifiSsid.trim()) {
      entries.push({ namespace: "config", key: "wifi_ssid", type: "string", value: wifiSsid.trim() });
    }
    if (wifiPassword.trim()) {
      entries.push({ namespace: "config", key: "wifi_pass", type: "string", value: wifiPassword.trim() });
    }
    if (deviceName.trim()) {
      entries.push({ namespace: "config", key: "dev_name", type: "string", value: deviceName.trim() });
    }
    if (mqttHost.trim()) {
      entries.push({ namespace: "config", key: "mqtt_host", type: "string", value: mqttHost.trim() });
      entries.push({ namespace: "config", key: "mqtt_port", type: "u16", value: parseInt(mqttPort, 10) || 1883 });
    }

    if (entries.length === 0) return;

    const nvsBin = NvsConfigGenerator.generateNvsImage(entries, 0x4000);
    onFlashNvs(nvsBin, 0x9000);
  };

  const handleDownloadNvsBin = () => {
    const entries: NvsConfigEntry[] = [];
    if (wifiSsid.trim()) entries.push({ namespace: "config", key: "wifi_ssid", type: "string", value: wifiSsid.trim() });
    if (wifiPassword.trim()) entries.push({ namespace: "config", key: "wifi_pass", type: "string", value: wifiPassword.trim() });
    if (deviceName.trim()) entries.push({ namespace: "config", key: "dev_name", type: "string", value: deviceName.trim() });

    const nvsBin = NvsConfigGenerator.generateNvsImage(entries, 0x4000);
    const blob = new Blob([nvsBin as any], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nvs_wifi_config_0x9000.bin`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Flash Backup & Memory Dumper Card */}
      <div className="flex flex-col justify-between p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-violet-400" />
              {t("tools_backup_title")}
            </h3>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
              .bin Dump
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t("tools_backup_desc")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">{t("tools_start_offset")}</label>
              <input
                type="text"
                value={dumpOffsetHex}
                onChange={(e) => setDumpOffsetHex(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="relative z-30">
              <label className="text-[11px] text-zinc-400 block mb-1">{t("tools_read_size")}</label>
              <FlasherSelect
                options={[
                  { value: 1, label: "1 MB", subtitle: "ESP8266 Mini" },
                  { value: 2, label: "2 MB" },
                  { value: 4, label: "4 MB", subtitle: "ESP32 Standard", badge: "Default" },
                  { value: 8, label: "8 MB", subtitle: "ESP32-S3 / WROVER" },
                  { value: 16, label: "16 MB", subtitle: "Large Flash" },
                ]}
                value={dumpSizeMb}
                onChange={(val) => setDumpSizeMb(Number(val))}
                ariaLabel={t("tools_read_size")}
                size="md"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              const offset = parseInt(dumpOffsetHex, 16) || 0;
              const sizeBytes = dumpSizeMb * 1024 * 1024;
              onReadFlashDump(offset, sizeBytes);
            }}
            disabled={status !== "connected"}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 hover:border-violet-400 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-violet-400" />
            {t("tools_read_btn")}
          </button>
        </div>
      </div>

      {/* 2. Full Flash Erase Card */}
      <div className="flex flex-col justify-between p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              {t("tools_erase_title")}
            </h3>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Reset
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t("tools_erase_desc")}
          </p>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              {t("tools_erase_warning")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onEraseChip}
            disabled={status !== "connected"}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 backdrop-blur-xl transition-all active:scale-95 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            {t("tools_erase_btn")}
          </button>
        </div>
      </div>

      {/* 3. NVS Key-Value Wi-Fi & Device Config Generator */}
      <div className="lg:col-span-2 flex flex-col p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-indigo-400" />
              {t("tools_nvs_title")}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {t("tools_nvs_desc")}
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 self-start md:self-auto">
            NVS Partition (0x9000)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("wifi_ssid")}</label>
            <input
              type="text"
              placeholder="Home Wi-Fi"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("wifi_password")}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("device_name")}</label>
            <input
              type="text"
              placeholder="aegis-device"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("mqtt_broker")}</label>
            <input
              type="text"
              placeholder="192.168.1.50"
              value={mqttHost}
              onChange={(e) => setMqttHost(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleDownloadNvsBin}
            disabled={!wifiSsid.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium text-zinc-300 bg-white/[0.04] border border-white/10 hover:text-white hover:bg-white/[0.08] backdrop-blur-xl transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            {t("nvs_download_bin")}
          </button>

          <button
            type="button"
            onClick={handleGenerateAndFlashNvs}
            disabled={!wifiSsid.trim() || status !== "connected"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-indigo-600/25 border border-indigo-500/40 hover:bg-indigo-600/40 backdrop-blur-xl transition-all disabled:opacity-40"
          >
            <Wifi className="w-3.5 h-3.5 text-indigo-300" />
            {t("nvs_flash_to_chip")}
          </button>
        </div>
      </div>
    </div>
  );
};
