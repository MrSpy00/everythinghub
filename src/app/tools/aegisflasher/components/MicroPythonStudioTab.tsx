"use client";

import React, { useState } from "react";
import {
  FileCode,
  Folder,
  Play,
  Trash2,
  Download,
  Plus,
  RefreshCw,
  Terminal,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";
import { FlasherSelect, FlasherSelectOption } from "./FlasherSelect";

interface MicroPythonStudioTabProps {
  status: ConnectionStatus;
  logs: SerialLogMessage[];
  onSendMessage: (text: string, lineEnding: string) => void;
  lang: Language;
}

interface RemoteFile {
  name: string;
  sizeBytes: number;
  isDir: boolean;
}

const DEFAULT_FILES: RemoteFile[] = [
  { name: "boot.py", sizeBytes: 154, isDir: false },
  { name: "main.py", sizeBytes: 540, isDir: false },
  { name: "config.json", sizeBytes: 88, isDir: false },
  { name: "lib", sizeBytes: 0, isDir: true },
];

const MPY_SNIPPETS: { id: string; nameTr: string; nameEn: string; code: string }[] = [
  {
    id: "blink",
    nameTr: "LED Yanıp Sönme (Blink Testi)",
    nameEn: "Blink LED Test (GPIO 2)",
    code: `# MicroPython LED Blink Test
import machine
import time

# ESP32 onboard LED is typically GPIO 2; Pico onboard is 'LED' or GPIO 25
try:
    led = machine.Pin(2, machine.Pin.OUT)
except Exception:
    led = machine.Pin("LED", machine.Pin.OUT)

print("[aegisStudio] Starting LED Blink Test...")
for i in range(10):
    led.value(1)
    time.sleep(0.2)
    led.value(0)
    time.sleep(0.2)
    print(f"Cycle {i+1}/10: LED toggled")

print("[aegisStudio] Blink test completed successfully!")
`,
  },
  {
    id: "wifi_scan",
    nameTr: "Wi-Fi Ağlarını Tara",
    nameEn: "Scan Wi-Fi Networks",
    code: `# MicroPython Wi-Fi Scanner
import network
import time

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
print("[aegisStudio] Scanning 2.4GHz Wi-Fi networks...")

time.sleep(1)
networks = wlan.scan()

print(f"Found {len(networks)} networks:")
for net in networks:
    ssid = net[0].decode("utf-8", "ignore")
    bssid = ":".join(f"{b:02X}" for b in net[1])
    channel = net[2]
    rssi = net[3]
    auth = net[4]
    print(f" - {ssid:<24} RSSI: {rssi:>3} dBm  CH: {channel:>2}")
`,
  },
  {
    id: "i2c_scan",
    nameTr: "I2C Donanım Yolu Taraması",
    nameEn: "I2C Bus Scanner (SDA 21, SCL 22)",
    code: `# MicroPython I2C Scanner
from machine import Pin, I2C

# Default ESP32 I2C pins: SDA=GPIO21, SCL=GPIO22
# For ESP32-S3/C3 or Pico, adjust pins accordingly
i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400000)

print("[aegisStudio] Scanning I2C bus...")
devices = i2c.scan()

if devices:
    print(f"Found {len(devices)} I2C device(s):")
    for d in devices:
        print(f" - Address: 0x{d:02X} (dec: {d})")
else:
    print("No I2C devices found. Check SDA/SCL connections and pull-up resistors.")
`,
  },
  {
    id: "sys_telemetry",
    nameTr: "Sistem & Bellek Bilgisi",
    nameEn: "System Info & Memory Telemetry",
    code: `# MicroPython System & Memory Telemetry
import sys
import os
import gc
import machine

print("=== aegisStudio Hardware Telemetry ===")
print("Python Version  :", sys.version)
print("Platform        :", sys.platform)
print("CPU Frequency   :", machine.freq() // 1000000, "MHz")

gc.collect()
free_mem = gc.mem_free()
alloc_mem = gc.mem_alloc()
print(f"RAM Free        : {free_mem / 1024:.1f} KB")
print(f"RAM Allocated   : {alloc_mem / 1024:.1f} KB")

try:
    stat = os.statvfs('/')
    flash_free = (stat[0] * stat[3]) / 1024
    print(f"Flash Free      : {flash_free:.1f} KB")
except Exception:
    pass

print("Filesystem Root :", os.listdir())
`,
  },
  {
    id: "adc_read",
    nameTr: "Analog Gerilim Okuma (ADC)",
    nameEn: "Analog ADC Voltage Reading",
    code: `# MicroPython ADC Pin Reader
import machine
import time

# Pin 34 is ADC1 on classic ESP32 (input only)
adc = machine.ADC(machine.Pin(34))
adc.atten(machine.ADC.ATTN_11DB) # Full 0 - 3.3V range

print("[aegisStudio] Reading ADC on GPIO 34 (10 samples)...")
for i in range(10):
    raw = adc.read()
    voltage = (raw / 4095.0) * 3.3
    print(f"Sample {i+1}: Raw={raw:4d}  Voltage={voltage:.3f} V")
    time.sleep(0.3)
`,
  },
];

export const MicroPythonStudioTab: React.FC<MicroPythonStudioTabProps> = ({
  status,
  logs,
  onSendMessage,
  lang,
}) => {
  const t = useTranslation(lang);
  const [fileList, setFileList] = useState<RemoteFile[]>(DEFAULT_FILES);
  const [activeFileName, setActiveFileName] = useState<string>("main.py");
  const [codeContent, setCodeContent] = useState<string>(MPY_SNIPPETS[0].code);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Send Raw REPL sequence to run code with robust promise timeouts
  const handleSaveAndRun = async () => {
    if (status !== "connected") {
      toast.error(
        lang === "tr"
          ? "Önce seri port üzerinden karta bağlanmalısınız."
          : "Connect to the device via serial port first."
      );
      return;
    }

    setIsRunning(true);
    toast.info(
      lang === "tr"
        ? "MicroPython Raw REPL moduna geçiliyor ve kod yükleniyor..."
        : "Entering MicroPython Raw REPL and uploading script..."
    );

    try {
      // 1. Send Ctrl-C twice to break any currently running loop
      onSendMessage("\x03\x03", "none");
      await new Promise((r) => setTimeout(r, 200));

      // 2. Send Ctrl-A to enter Raw REPL
      onSendMessage("\x01", "none");
      await new Promise((r) => setTimeout(r, 250));

      // 3. Send python code content
      onSendMessage(codeContent, "none");
      await new Promise((r) => setTimeout(r, 300));

      // 4. Send Ctrl-D to finish input and execute
      onSendMessage("\x04", "none");
      await new Promise((r) => setTimeout(r, 250));

      // 5. Send Ctrl-B to exit Raw REPL back to normal REPL
      onSendMessage("\x02", "none");
      toast.success(
        lang === "tr"
          ? "Kod cihaza yüklendi ve çalıştırılıyor!"
          : "Script uploaded and executing on device!"
      );
    } catch (err: any) {
      toast.error(`Yükleme hatası: ${err.message || err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const found = MPY_SNIPPETS.find((s) => s.id === templateId);
    if (found) {
      setCodeContent(found.code);
      toast.success(
        lang === "tr" ? `'${found.nameTr}' şablonu yüklendi.` : `'${found.nameEn}' template loaded.`
      );
    }
  };

  const handleCreateNewFile = () => {
    const filename = prompt(
      lang === "tr"
        ? "Yeni dosya adı girin (Örn: sensor.py, config.json):"
        : "Enter new file name (e.g. sensor.py, config.json):",
      "script.py"
    );
    if (!filename) return;

    setFileList((prev) => [...prev, { name: filename, sizeBytes: 0, isDir: false }]);
    setActiveFileName(filename);
    setCodeContent(`# ${filename}\nprint("Running ${filename}...")\n`);
    toast.success(`'${filename}' oluşturuldu.`);
  };

  const handleDeleteFile = (name: string) => {
    if (
      confirm(
        lang === "tr"
          ? `'${name}' dosyasını silmek istediğinize emin misiniz?`
          : `Are you sure you want to delete '${name}'?`
      )
    ) {
      setFileList(fileList.filter((f) => f.name !== name));
      if (activeFileName === name) {
        setActiveFileName("main.py");
        setCodeContent(MPY_SNIPPETS[0].code);
      }
      toast.success(`'${name}' silindi.`);
    }
  };

  const handleDownloadFileLocally = () => {
    const blob = new Blob([codeContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`'${activeFileName}' indirildi.`);
  };

  const templateOptions: FlasherSelectOption[] = MPY_SNIPPETS.map((s) => ({
    value: s.id,
    label: lang === "tr" ? s.nameTr : s.nameEn,
    subtitle: s.id,
  }));

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Banner */}
      <div className="relative z-30 focus-within:z-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              {t("mpy_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Python 3 / Raw REPL
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("mpy_desc")}</p>
          </div>
        </div>

        {/* Template Selector & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="min-w-[200px]">
            <FlasherSelect
              options={templateOptions}
              value=""
              placeholder={lang === "tr" ? "Şablon Kod Yükle..." : "Load Code Snippet..."}
              onChange={(val) => handleSelectTemplate(String(val))}
              size="sm"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveAndRun}
            disabled={isRunning || status !== "connected"}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-amber-600/30 hover:bg-amber-600/45 border border-amber-500/50 backdrop-blur-xl shadow-xl transition-all active:scale-95 disabled:opacity-40"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
            )}
            <span>{t("mpy_save_and_run")}</span>
          </button>
        </div>
      </div>

      {/* Main IDE Workspace: Left File Tree | Right Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Remote Filesystem Tree */}
        <div className="lg:col-span-1 flex flex-col p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-400" />
              {t("mpy_file_tree")}
            </span>
            <button
              type="button"
              onClick={handleCreateNewFile}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all"
              title={t("mpy_new_file")}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {fileList.map((file) => (
              <div
                key={file.name}
                onClick={() => {
                  if (!file.isDir) setActiveFileName(file.name);
                }}
                className={`group cursor-pointer flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  activeFileName === file.name
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-sm"
                    : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-900/90 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {file.isDir ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                  <span className="text-xs font-mono font-medium truncate">{file.name}</span>
                </div>

                {!file.isDir && file.name !== "main.py" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                    title={lang === "tr" ? "Sil" : "Delete"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Code Editor & Live Terminal */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-400" />
                {activeFileName}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                ({codeContent.split("\n").length} satır • {new TextEncoder().encode(codeContent).length} bayt)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadFileLocally}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
                title={lang === "tr" ? "Yerel Olarak İndir" : "Download Locally"}
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "tr" ? "İndir" : "Download"}
              </button>
            </div>
          </div>

          {/* Code Textarea Area */}
          <div className="relative w-full rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-3xl p-4 shadow-2xl flex flex-col">
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder={t("mpy_editor_placeholder")}
              className="w-full h-80 bg-transparent text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Live REPL Output Log Screen */}
          <div className="flex flex-col p-4 rounded-3xl bg-zinc-950/90 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                {t("mpy_terminal_output")}
              </span>
            </div>
            <div className="w-full h-32 overflow-y-auto font-mono text-xs text-emerald-300/90 flex flex-col gap-0.5">
              {logs.slice(-20).map((l) => (
                <div key={l.id} className="leading-tight">
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
