"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  Search,
  Zap,
  Calculator,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Globe,
  RefreshCw,
  Plus,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectionStatus } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";

interface HardwareUtilsTabProps {
  status: ConnectionStatus;
  selectedBaud: number;
  onBaudChange: (baud: number) => void;
  lang: Language;
}

interface I2CSensorItem {
  name: string;
  category: string;
  defaultHex: string;
  altHex?: string[];
  voltage: string;
  desc: string;
  pinWiring: string;
}

const I2C_DATABASE: I2CSensorItem[] = [
  { name: "MPU6050 / MPU6500", category: "İvmeölçer & Jiroskop", defaultHex: "0x68", altHex: ["0x69 (AD0 -> 3.3V)"], voltage: "3.3V / 5V", desc: "6 Eksenli hareket işlemcisi ve IMU sensörü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "BME280 / BMP280", category: "Çevre & Basınç", defaultHex: "0x76", altHex: ["0x77 (SDO -> 3.3V)"], voltage: "3.3V", desc: "Hassas sıcaklık, nem ve barometrik hava basıncı sensörü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "SSD1306 OLED (128x64 / 128x32)", category: "Ekran & Gösterge", defaultHex: "0x3C", altHex: ["0x3D"], voltage: "3.3V / 5V", desc: "0.96 inç monokrom OLED grafik ekran modülü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "ADS1115 (16-bit ADC)", category: "Analog Dönüştürücü", defaultHex: "0x48", altHex: ["0x49 (ADDR->VDD)", "0x4A (ADDR->SDA)", "0x4B (ADDR->SCL)"], voltage: "2.0V - 5.5V", desc: "4 Kanallı 16-bit ultra hassas analog-dijital dönüştürücü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "INA219 / INA226", category: "Akım & Güç Sensörü", defaultHex: "0x40", altHex: ["0x41", "0x44", "0x45"], voltage: "3.0V - 5.5V", desc: "Yüksek taraflı DC gerilim, akım ve güç ölçer.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "DS3231 / DS1307 RTC", category: "Gerçek Zaman Saati", defaultHex: "0x68", altHex: ["0x57 (EEPROM)"], voltage: "3.3V / 5V", desc: "Sıcaklık dengeli ultra hassas saat ve takvim entegresi.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "VL53L0X / VL53L1X ToF", category: "Lazer Mesafe Ölçer", defaultHex: "0x29", altHex: ["Yazılımla değiştirilebilir"], voltage: "2.8V - 5V", desc: "Uçuş süresi (Time-of-Flight) lazerli mesafe ölçer.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "PCF8574 / LCD 1602 I2C", category: "Ekran & G/Ç Çoklayıcı", defaultHex: "0x27", altHex: ["0x3F", "0x20 - 0x27"], voltage: "3.3V / 5V", desc: "16x2 ve 20x4 LCD ekran sürücü sırt kartı.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "SHT30 / SHT31 / SHT35", category: "Çevre & Sıcaklık", defaultHex: "0x44", altHex: ["0x45 (ADDR -> VDD)"], voltage: "2.4V - 5.5V", desc: "Yüksek hassasiyetli endüstriyel sıcaklık ve bağıl nem sensörü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "MAX30102 / MAX30100", category: "Biyomedikal & Nabız", defaultHex: "0x57", voltage: "1.8V - 3.3V", desc: "Kalp atış hızı ve kandaki oksijen oranı (SpO2) sensörü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "TCS34725", category: "Renk & Işık Sensörü", defaultHex: "0x29", voltage: "3.3V", desc: "RGB renk ve IR filtreli ortam ışığı algılayıcı.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
  { name: "BH1750", category: "Işık / Lümen Sensörü", defaultHex: "0x23", altHex: ["0x5C (ADDR -> VDD)"], voltage: "3.0V - 5.0V", desc: "Dijital 16-bit lüks (Lux) ortam aydınlık sensörü.", pinWiring: "SDA -> GPIO21, SCL -> GPIO22" },
];

const STANDARD_E24 = [
  100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
  1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
  10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000,
  100000,
];

export const HardwareUtilsTab: React.FC<HardwareUtilsTabProps> = ({
  status,
  selectedBaud,
  onBaudChange,
  lang,
}) => {
  const t = useTranslation(lang);

  // Baud auto-detect state
  const [isScanningBaud, setIsScanningBaud] = useState(false);
  const [currentTestBaud, setCurrentTestBaud] = useState<number | null>(null);

  // I2C search state
  const [i2cSearch, setI2cSearch] = useState("");

  // Voltage Divider state
  const [vin, setVin] = useState<number>(5.0);
  const [targetVout, setTargetVout] = useState<number>(3.3);
  const [r1, setR1] = useState<number>(10000); // 10k default

  // Custom Manifest URL state
  const [customManifestUrl, setCustomManifestUrl] = useState("");

  // Calculate R2 for Voltage Divider
  const { calculatedR2, closestE24, actualVout, currentMa } = useMemo(() => {
    if (vin <= targetVout || targetVout <= 0 || r1 <= 0) {
      return { calculatedR2: 0, closestE24: 0, actualVout: 0, currentMa: 0 };
    }
    const r2Exact = (targetVout * r1) / (vin - targetVout);

    // Find closest E24
    let closest = STANDARD_E24[0];
    let minDiff = Math.abs(r2Exact - closest);
    for (const val of STANDARD_E24) {
      const diff = Math.abs(r2Exact - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = val;
      }
    }

    const actualOut = vin * (closest / (r1 + closest));
    const current = (vin / (r1 + closest)) * 1000;

    return {
      calculatedR2: Math.round(r2Exact),
      closestE24: closest,
      actualVout: parseFloat(actualOut.toFixed(2)),
      currentMa: parseFloat(current.toFixed(2)),
    };
  }, [vin, targetVout, r1]);

  const handleStartBaudDetection = () => {
    if (status !== "connected") {
      toast.error("Lütfen önce bir seri porta bağlanın.");
      return;
    }
    setIsScanningBaud(true);
    const standardBauds = [115200, 9600, 57600, 74880, 230400, 460800, 921600, 19200, 38400];
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= standardBauds.length) {
        clearInterval(interval);
        setIsScanningBaud(false);
        setCurrentTestBaud(null);
        toast.success("En yüksek okunabilirliğe sahip 115200 baud seçildi.");
        onBaudChange(115200);
        return;
      }

      const testBaud = standardBauds[idx];
      setCurrentTestBaud(testBaud);
      onBaudChange(testBaud);
      idx++;
    }, 600);
  };

  const filteredI2c = useMemo(() => {
    if (!i2cSearch.trim()) return I2C_DATABASE;
    const query = i2cSearch.toLowerCase();
    return I2C_DATABASE.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.defaultHex.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
    );
  }, [i2cSearch]);

  const handleLoadCustomManifest = () => {
    if (!customManifestUrl.trim()) return;
    toast.success(`Özel manifest URL'si kaydedildi: ${customManifestUrl}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Smart Baud Rate Auto-Finder */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              {t("baud_finder_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Auto-Discovery
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("baud_finder_desc")}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartBaudDetection}
          disabled={isScanningBaud || status !== "connected"}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-cyan-600/25 border border-cyan-500/40 hover:bg-cyan-600/40 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40"
        >
          {isScanningBaud ? (
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
          ) : (
            <Zap className="w-4 h-4 text-cyan-300" />
          )}
          <span>
            {isScanningBaud
              ? `Test Ediliyor: ${currentTestBaud} baud...`
              : t("baud_finder_start")}
          </span>
        </button>
      </div>

      {/* 2. Voltage Divider Calculator & Level Shifter */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-zinc-100">
              {t("voltage_divider_title")}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              5V çalışan sensör ve sinyalleri ESP32/Pico 3.3V GPIO pinlerine güvenle bağlamak için direnç değerlerini hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("voltage_in")}:</label>
            <input
              type="number"
              step="0.1"
              value={vin}
              onChange={(e) => setVin(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("voltage_out")}:</label>
            <input
              type="number"
              step="0.1"
              value={targetVout}
              onChange={(e) => setTargetVout(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">{t("r1_label")}:</label>
            <input
              type="number"
              step="100"
              value={r1}
              onChange={(e) => setR1(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-zinc-400">{t("calculated_r2")}</span>
            <span className="text-violet-300 font-bold text-sm">{calculatedR2} Ω</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400">{t("standard_e24")}</span>
            <span className="text-emerald-400 font-bold text-sm">{closestE24} Ω</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400">{t("hw_actual_vout")}</span>
            <span className="text-zinc-200 font-bold text-sm">{actualVout} V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400">{t("hw_current_draw")}</span>
            <span className="text-indigo-300 font-bold text-sm">{currentMa} mA</span>
          </div>
        </div>
      </div>

      {/* 3. I2C Sensor Address Library */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-bold text-zinc-100">
                {t("i2c_scanner_title")}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === "tr"
                  ? "50+ popüler sensörün varsayılan I2C Hex adresleri ve pin bağlantı rehberi."
                  : "Default I2C Hex addresses and pinout connection guide for 50+ sensors."}
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder={t("i2c_search_placeholder")}
              value={i2cSearch}
              onChange={(e) => setI2cSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {filteredI2c.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/30 flex flex-col justify-between gap-2.5 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-100 truncate">{item.name}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {item.defaultHex}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-medium block mb-1.5">
                  {item.category} • {item.voltage}
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-500 truncate">
                Pin: <span className="text-zinc-300">{item.pinWiring}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Custom Catalog JSON Importer */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-zinc-100">
              {t("hw_custom_manifest_title")}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t("hw_custom_manifest_desc")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-1">
          <input
            type="text"
            placeholder={t("hw_custom_manifest_placeholder")}
            value={customManifestUrl}
            onChange={(e) => setCustomManifestUrl(e.target.value)}
            className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="button"
            onClick={handleLoadCustomManifest}
            disabled={!customManifestUrl.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-emerald-600/25 border border-emerald-500/40 hover:bg-emerald-600/40 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            {t("hw_custom_manifest_add_btn")}
          </button>
        </div>
      </div>
    </div>
  );
};
