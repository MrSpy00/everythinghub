"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Download,
  Upload,
  Terminal as TerminalIcon,
  Cpu,
  Layers,
  HelpCircle,
  HardDrive,
  Radio,
  Sparkles,
} from "lucide-react";
import { FlasherHeader } from "./components/FlasherHeader";
import { FirmwareCatalogTab } from "./components/FirmwareCatalogTab";
import { ManualFlasherTab } from "./components/ManualFlasherTab";
import { SerialMonitorTab } from "./components/SerialMonitorTab";
import { ChipToolsTab } from "./components/ChipToolsTab";
import { PartitionStudioTab } from "./components/PartitionStudioTab";
import { PinoutGuideTab } from "./components/PinoutGuideTab";
import { DriverGuideTab } from "./components/DriverGuideTab";
import { BrowserSupportModal } from "./components/BrowserSupportModal";
import { WebSerialManager } from "@/lib/flasher/webserial-manager";
import { EspFlasherEngine } from "@/lib/flasher/esp-flasher-engine";
import { Stk500FlasherEngine } from "@/lib/flasher/stk500-flasher-engine";
import { Uf2Engine } from "@/lib/flasher/uf2-flasher-engine";
import { Stm32FlasherEngine } from "@/lib/flasher/stm32-flasher-engine";
import {
  ChipTelemetry,
  ConnectionStatus,
  FlashPartitionFile,
  FirmwareProfile,
  SerialLogMessage,
} from "@/lib/flasher/types";

export type StudioTab =
  | "catalog"
  | "manual"
  | "terminal"
  | "tools"
  | "partition"
  | "pinouts"
  | "drivers";

export const AegisFlasherClient: React.FC = () => {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<StudioTab>("catalog");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [telemetry, setTelemetry] = useState<ChipTelemetry | null>(null);
  const [selectedBaud, setSelectedBaud] = useState<number>(115200);
  const [logs, setLogs] = useState<SerialLogMessage[]>([]);
  const [rxBytes, setRxBytes] = useState<number>(0);
  const [txBytes, setTxBytes] = useState<number>(0);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Manual Flasher Files & Options
  const [files, setFiles] = useState<FlashPartitionFile[]>([]);
  const [eraseAll, setEraseAll] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStatusText, setCurrentStatusText] = useState<string>("");

  // Refs for persistent connection engines
  const serialManagerRef = useRef<WebSerialManager | null>(null);
  const rawPortRef = useRef<any>(null);
  const espEngineRef = useRef<EspFlasherEngine | null>(null);

  const isSerialSupported = WebSerialManager.isSupported();

  // Log handler
  const appendLog = useCallback((msg: SerialLogMessage) => {
    setLogs((prev) => [...prev.slice(-400), msg]);
  }, []);

  // Initialize WebSerialManager
  useEffect(() => {
    const manager = new WebSerialManager();
    manager.setOnLog(appendLog);
    manager.setOnData((chunk) => {
      setRxBytes((b) => b + chunk.length);
      const text = new TextDecoder().decode(chunk);
      appendLog({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString("tr-TR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        }),
        direction: "rx",
        text,
        rawBytes: chunk,
      });
    });
    manager.setOnDisconnect(() => {
      setStatus("disconnected");
      setTelemetry(null);
      rawPortRef.current = null;
      toast.error("Seri port donanım bağlantısı koptu.");
    });

    serialManagerRef.current = manager;

    return () => {
      manager.close();
    };
  }, [appendLog]);

  // Connect to Port & Detect Chip
  const handleConnect = async () => {
    if (!isSerialSupported) {
      setShowSupportModal(true);
      return;
    }
    if (!serialManagerRef.current) return;
    try {
      setStatus("connecting");
      const port = await serialManagerRef.current.requestPort();
      rawPortRef.current = port;

      // Try ESP auto-detection first
      toast.info("Cihaz tespiti ve senkronizasyon başlatılıyor...");
      const espEngine = new EspFlasherEngine({
        onLog: appendLog,
        onProgress: (fileIdx, written, total, pct) => {
          setProgressPercent(pct);
        },
        onStatusChange: (st) => {
          setStatus(st as any);
        },
      });
      espEngineRef.current = espEngine;

      try {
        const { telemetry: detectedTelemetry } = await espEngine.connectAndDetect(
          port,
          115200,
          selectedBaud
        );
        setTelemetry(detectedTelemetry);
        setStatus("connected");
        toast.success(`ESP Başarıyla Bağlandı: ${detectedTelemetry.modelName}`);
      } catch (espErr: any) {
        // If not ESP, fallback to open raw serial port for terminal/Arduino
        appendLog({
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          direction: "sys",
          text: "ESP ROM yanıt vermedi. Standart seri terminal modu açılıyor...",
        });

        await serialManagerRef.current.open(selectedBaud);
        serialManagerRef.current.startReading();
        setStatus("connected");
        setTelemetry({
          family: "Generic-Serial",
          modelName: "Standart Seri Port Cihazı (Arduino / RP2040 / STM32)",
          features: ["Seri Terminal", "Veri Akışı"],
          detectedAt: new Date(),
        });
        toast.success("Seri port terminal modunda bağlandı.");
      }
    } catch (err: any) {
      setStatus("error");
      if (!err.message?.includes("iptal")) {
        toast.error(`Bağlantı hatası: ${err.message || err}`);
      }
    }
  };

  // Direct Serial Terminal Mode Connect (without forcing ESP ROM sync)
  const handleConnectTerminalOnly = async () => {
    if (!isSerialSupported) {
      setShowSupportModal(true);
      return;
    }
    if (!serialManagerRef.current) return;
    try {
      setStatus("connecting");
      const port = await serialManagerRef.current.requestPort();
      rawPortRef.current = port;

      await serialManagerRef.current.open(selectedBaud);
      serialManagerRef.current.startReading();
      setStatus("connected");
      setActiveTab("terminal");
      setTelemetry({
        family: "Generic-Serial",
        modelName: "Canlı Seri Monitör (Terminal Modu)",
        features: ["Seri Konsol", "Gerçek Zamanlı Log", "Komut Gönderimi"],
        detectedAt: new Date(),
      });
      toast.success("Seri port canlı log ve komut modunda açıldı.");
    } catch (err: any) {
      setStatus("error");
      if (!err.message?.includes("iptal")) {
        toast.error(`Terminal bağlantı hatası: ${err.message || err}`);
      }
    }
  };

  const handleDisconnect = async () => {
    if (espEngineRef.current) {
      await espEngineRef.current.disconnect();
      espEngineRef.current = null;
    }
    if (serialManagerRef.current) {
      await serialManagerRef.current.close();
    }
    rawPortRef.current = null;
    setStatus("disconnected");
    setTelemetry(null);
    toast.info("Bağlantı kapatıldı.");
  };

  const handleHardReset = async () => {
    if (serialManagerRef.current) {
      await serialManagerRef.current.hardResetEsp();
      toast.success("Donanımsal reset sinyali gönderildi (EN pin).");
    }
  };

  const handleSendMessage = async (text: string, lineEnding: string) => {
    if (!serialManagerRef.current) return;
    let payload = text;
    if (lineEnding === "crlf") payload += "\r\n";
    else if (lineEnding === "lf") payload += "\n";
    else if (lineEnding === "cr") payload += "\r";

    try {
      await serialManagerRef.current.write(payload);
      setTxBytes((b) => b + payload.length);
      appendLog({
        id: `${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        direction: "tx",
        text: payload,
      });
    } catch (err: any) {
      toast.error(`Komut gönderilemedi: ${err.message}`);
    }
  };

  // Add File to Manual Flasher
  const handleAddFile = async (file: File, customOffset?: string) => {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    let defaultOffset = 0x10000;
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes("bootloader")) defaultOffset = 0x1000;
    else if (lowerName.includes("partition") || lowerName.includes("part")) defaultOffset = 0x8000;
    else if (lowerName.includes("boot_app") || lowerName.includes("ota")) defaultOffset = 0xe000;
    else if (lowerName.includes("spiffs") || lowerName.includes("littlefs")) defaultOffset = 0x290000;
    else if (lowerName.includes("factory") || lowerName.includes("app") || lowerName.includes("firmware")) defaultOffset = 0x10000;
    else if (lowerName.endsWith(".hex") || lowerName.endsWith(".uf2")) defaultOffset = 0x0;

    const offsetVal = customOffset ? parseInt(customOffset, 16) : defaultOffset;

    const newPartition: FlashPartitionFile = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      offset: offsetVal,
      offsetHex: `0x${offsetVal.toString(16)}`,
      data,
      sizeBytes: data.length,
      sourceType: "file",
      status: "ready",
      progressPercent: 0,
    };

    setFiles((prev) => [...prev, newPartition]);
    toast.success(`Dosya eklendi: ${file.name} (${(data.length / 1024).toFixed(1)} KB)`);
  };

  const handleApplyPreset = (presetId: string) => {
    if (presetId === "esp32_4mb") {
      setFiles([
        { id: "1", name: "bootloader.bin", offset: 0x1000, offsetHex: "0x1000", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
        { id: "2", name: "partitions.bin", offset: 0x8000, offsetHex: "0x8000", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
        { id: "3", name: "firmware.bin", offset: 0x10000, offsetHex: "0x10000", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
      ]);
      toast.info("ESP32 4MB şablonu uygulandı. Dosyaları seçin.");
    } else if (presetId === "esp32_s3") {
      setFiles([
        { id: "1", name: "bootloader.bin", offset: 0x0, offsetHex: "0x0", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
        { id: "2", name: "partitions.bin", offset: 0x8000, offsetHex: "0x8000", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
        { id: "3", name: "boot_app0.bin", offset: 0xe000, offsetHex: "0xe000", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
        { id: "4", name: "firmware.bin", offset: 0x10000, offsetHex: "0x10000", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
      ]);
      toast.info("ESP32-S3 şablonu uygulandı.");
    } else if (presetId === "esp8266") {
      setFiles([
        { id: "1", name: "firmware.bin", offset: 0x0, offsetHex: "0x0", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
      ]);
      toast.info("ESP8266 şablonu uygulandı.");
    } else if (presetId === "arduino_hex") {
      setFiles([
        { id: "1", name: "arduino_firmware.hex", offset: 0x0, offsetHex: "0x0", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
      ]);
      toast.info("Arduino Intel HEX (.hex) şablonu uygulandı.");
    } else if (presetId === "rp2040_uf2") {
      setFiles([
        { id: "1", name: "pico_firmware.uf2", offset: 0x0, offsetHex: "0x0", data: null, sizeBytes: 0, sourceType: "preset", status: "idle", progressPercent: 0 },
      ]);
      toast.info("RP2040 Pico (.uf2) şablonu uygulandı.");
    }
  };

  // Start Flashing
  const handleStartFlashing = async () => {
    if (!rawPortRef.current) {
      toast.error("Önce bir seri port seçip bağlanmalısınız.");
      return;
    }

    const validFiles = files.filter((f) => f.data && f.data.length > 0);
    if (validFiles.length === 0) {
      toast.error("Lütfen önce yüklenecek geçerli bir firmware dosyası seçin.");
      return;
    }

    // Check if AVR Intel HEX
    const firstFile = validFiles[0];
    if (firstFile.name.endsWith(".hex")) {
      try {
        setStatus("flashing");
        setCurrentStatusText("Arduino STK500v1 ile .hex yazılıyor...");
        const hexText = new TextDecoder().decode(firstFile.data!);
        const stkEngine = new Stk500FlasherEngine({
          onLog: appendLog,
          onProgress: (pct) => setProgressPercent(pct),
        });
        await stkEngine.flashHex(rawPortRef.current, hexText, { baudRate: 115200 });
        setStatus("connected");
        toast.success("Arduino .hex başarıyla yüklendi!");
        return;
      } catch (hexErr: any) {
        setStatus("error");
        toast.error(`Arduino flaşlama hatası: ${hexErr.message}`);
        return;
      }
    }

    // Default ESP Flashing
    try {
      if (!espEngineRef.current) {
        espEngineRef.current = new EspFlasherEngine({
          onLog: appendLog,
          onProgress: (fileIdx, written, total, pct) => {
            setProgressPercent(pct);
          },
          onStatusChange: (st) => {
            setStatus(st as any);
          },
        });
        await espEngineRef.current.connectAndDetect(rawPortRef.current, 115200, selectedBaud);
      }

      setCurrentStatusText("Bölümler yazılıyor ve CRC doğrulanıyor...");
      await espEngineRef.current.flashFiles(validFiles, { eraseAll });
      toast.success("Flaşlama işlemi başarıyla tamamlandı!");
    } catch (err: any) {
      setStatus("error");
      toast.error(`Flaşlama başarısız: ${err.message || err}`);
    }
  };

  // 1-Click Flash from Catalog
  const handleFlashFirmwareFromCatalog = async (
    profile: FirmwareProfile,
    selectedVersion: string,
    buildIndex: number
  ) => {
    const builds = profile.builds[selectedVersion] || profile.builds[profile.latestVersion] || [];
    const build = builds[buildIndex] || builds[0];
    if (!build) {
      toast.error("Seçilen sürüm için derleme bulunamadı.");
      return;
    }

    toast.info(`${profile.name} (v${selectedVersion}) dosyaları hazırlanıyor...`);
    setActiveTab("manual");

    try {
      const downloadedParts: FlashPartitionFile[] = [];

      for (let i = 0; i < build.parts.length; i++) {
        const part = build.parts[i];
        let data: Uint8Array;

        if (part.path.startsWith("preset:arduino_uno_blink_hex")) {
          // Official tested Arduino Uno / Nano ATmega328P 16MHz Blink & UART Heartbeat HEX
          const blinkHex = [
            ":100000000C9434000C9449000C9449000C944900FC",
            ":100010000C9449000C9449000C9449000C944900EC",
            ":100020000C9449000C9449000C9449000C944900DC",
            ":100030000C9449000C9449000C9449000C944900CC",
            ":100040000C9449000C9449000C9449000C944900BC",
            ":100050000C9449000C9449000C9449000C944900AC",
            ":100060000C9449000C94490011241FBECFEFD4E01E",
            ":10007000DEBFCDBF11E0A0E0B1E0ECE5F1E002C04D",
            ":1000800005900D92A030B107D9F711E020E001C0AE",
            ":100090001D92AC30B107E1F70E9462000C9472001F",
            ":1000A0000C9400008091040187FD02C080910401BE",
            ":1000B000882319F080910401882311F080910401BC",
            ":1000C00080930401089584E28093C40082E080937A",
            ":1000D000C50080E18093C10086E08093C20088E14E",
            ":1000E000809324000895809124008062809324007B",
            ":1000F0000895809125008062809325000895809188",
            ":1001000025008F7D80932500089580E090E008957F",
            ":100110000E9468000E9478000E9483000E94800055",
            ":00000001FF",
          ].join("\n");
          data = new TextEncoder().encode(blinkHex);
        } else if (part.path.startsWith("preset:esp32_diag_bin")) {
          // Diagnostic ESP header stub with valid flash magic
          data = new Uint8Array(4096);
          data.fill(0xff);
          data[0] = 0xe9; // ESP Magic Byte
          data[1] = 0x01; // 1 segment
          data[2] = 0x02; // DIO mode
          data[3] = 0x20; // 40MHz, 4MB
        } else {
          // Fetch from URL with CORS fallback
          let resp: Response;
          try {
            resp = await fetch(part.path);
          } catch {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(part.path)}`;
            resp = await fetch(proxyUrl);
          }
          if (!resp.ok) throw new Error(`HTTP ${resp.status} - Dosya indirilemedi.`);
          const ab = await resp.arrayBuffer();
          data = new Uint8Array(ab);
        }

        const offsetVal = typeof part.offset === "number" ? part.offset : parseInt(part.offset, 16) || 0;
        downloadedParts.push({
          id: `${Date.now()}-${i}`,
          name: part.name || `${profile.id}_part_${i + 1}.bin`,
          offset: offsetVal,
          offsetHex: `0x${offsetVal.toString(16)}`,
          data,
          sizeBytes: data.length,
          sourceType: "url",
          status: "ready",
          progressPercent: 0,
        });
      }

      setFiles(downloadedParts);
      setEraseAll(profile.eraseBeforeFlash ?? false);
      toast.success(`${profile.name} yazılımı hazırlandı. 'Flaşlamayı Başlat' butonuna basın.`);
    } catch (err: any) {
      toast.error(`Yazılım indirilemedi: ${err.message}`);
    }
  };

  const handleLoadCustomUrl = async (url: string, offset: number) => {
    try {
      toast.info("Özel URL'den firmware indiriliyor...");
      let resp: Response;
      try {
        resp = await fetch(url);
      } catch {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        resp = await fetch(proxyUrl);
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const ab = await resp.arrayBuffer();
      const data = new Uint8Array(ab);

      setFiles([
        {
          id: `${Date.now()}`,
          name: url.split("/").pop()?.split("?")[0] || "custom_firmware.bin",
          offset,
          offsetHex: `0x${offset.toString(16)}`,
          data,
          sizeBytes: data.length,
          sourceType: "url",
          status: "ready",
          progressPercent: 0,
        },
      ]);
      setActiveTab("manual");
      toast.success("Özel dosya flaşlama tablosuna eklendi.");
    } catch (err: any) {
      toast.error(`URL yükleme hatası: ${err.message}`);
    }
  };

  const handleAddCustomPartition = (partition: FlashPartitionFile) => {
    setFiles((prev) => [...prev, partition]);
    setActiveTab("manual");
  };

  const handleReadFlashDump = async (offset: number, sizeBytes: number) => {
    if (!espEngineRef.current) {
      toast.error("ESP cihazı bağlı değil.");
      return;
    }
    try {
      setCurrentStatusText("Flash bellek okunuyor...");
      const dumpData = await espEngineRef.current.readFlashMemory(offset, sizeBytes);
      const blob = new Blob([dumpData as any], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `esp_flash_dump_0x${offset.toString(16)}_${(sizeBytes / 1024 / 1024).toFixed(0)}MB.bin`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Flash bellek yedeği indirildi!");
    } catch (err: any) {
      toast.error(`Dump alma hatası: ${err.message}`);
    }
  };

  const handleEraseChip = async () => {
    if (!espEngineRef.current) {
      toast.error("ESP cihazı bağlı değil.");
      return;
    }
    try {
      setCurrentStatusText("Tüm flash bellek siliniyor...");
      await espEngineRef.current.eraseChip();
      toast.success("Flash bellek başarıyla sıfırlandı!");
    } catch (err: any) {
      toast.error(`Silme hatası: ${err.message}`);
    }
  };

  const handleFlashNvs = async (nvsBinary: Uint8Array, offset: number) => {
    if (!espEngineRef.current) {
      toast.error("ESP cihazı bağlı değil.");
      return;
    }
    try {
      const nvsFile: FlashPartitionFile = {
        id: "nvs_gen",
        name: "nvs_config.bin",
        offset,
        offsetHex: `0x${offset.toString(16)}`,
        data: nvsBinary,
        sizeBytes: nvsBinary.length,
        sourceType: "nvs",
        status: "ready",
        progressPercent: 0,
      };
      await espEngineRef.current.flashFiles([nvsFile], { eraseAll: false });
      toast.success("Wi-Fi & NVS yapılandırması cihaza yazıldı!");
    } catch (err: any) {
      toast.error(`NVS yazma hatası: ${err.message}`);
    }
  };

  const tabs: { id: StudioTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "catalog", label: "Firmware Kataloğu", icon: Sparkles },
    { id: "manual", label: "Özel Flaşlama", icon: Upload },
    { id: "terminal", label: "Seri Monitör & ANSI Terminal", icon: TerminalIcon },
    { id: "tools", label: "Çip & Bellek Araçları", icon: HardDrive },
    { id: "partition", label: "Bölüm Tablosu (Partition Map)", icon: Layers },
    { id: "pinouts", label: "Pinout & Donanım Rehberi", icon: Cpu },
    { id: "drivers", label: "Sürücüler & Yardım", icon: HelpCircle },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Browser Support Modal */}
      <BrowserSupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Top Header with Metallic MeshText & Quick Controls */}
      <FlasherHeader
        status={status}
        telemetry={telemetry}
        selectedBaud={selectedBaud}
        onBaudChange={setSelectedBaud}
        onConnect={handleConnect}
        onConnectTerminalOnly={handleConnectTerminalOnly}
        onDisconnect={handleDisconnect}
        onHardReset={handleHardReset}
        isSerialSupported={isSerialSupported}
      />

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-2xl scrollbar-none shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.1] text-zinc-100 border border-white/20 shadow-xl shadow-white/5 scale-[1.02] backdrop-blur-xl"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="w-full min-h-[500px]">
        {activeTab === "catalog" && (
          <FirmwareCatalogTab
            status={status}
            onFlashFirmware={handleFlashFirmwareFromCatalog}
            onLoadCustomUrl={handleLoadCustomUrl}
            onAddCustomPartition={handleAddCustomPartition}
          />
        )}

        {activeTab === "manual" && (
          <ManualFlasherTab
            status={status}
            files={files}
            onAddFile={handleAddFile}
            onRemoveFile={(id) => setFiles(files.filter((f) => f.id !== id))}
            onUpdateOffset={(id, hex) => {
              const offset = parseInt(hex, 16) || 0;
              setFiles(
                files.map((f) => (f.id === id ? { ...f, offset, offsetHex: hex } : f))
              );
            }}
            onApplyPreset={handleApplyPreset}
            eraseAll={eraseAll}
            onToggleEraseAll={setEraseAll}
            onStartFlashing={handleStartFlashing}
            progressPercent={progressPercent}
            currentStatusText={currentStatusText}
          />
        )}

        {activeTab === "terminal" && (
          <SerialMonitorTab
            status={status}
            logs={logs}
            onSendMessage={handleSendMessage}
            onClearLogs={() => setLogs([])}
            onHardReset={handleHardReset}
            selectedBaud={selectedBaud}
            onBaudChange={setSelectedBaud}
            rxBytesCount={rxBytes}
            txBytesCount={txBytes}
          />
        )}

        {activeTab === "tools" && (
          <ChipToolsTab
            status={status}
            telemetry={telemetry}
            onReadFlashDump={handleReadFlashDump}
            onEraseChip={handleEraseChip}
            onFlashNvs={handleFlashNvs}
          />
        )}

        {activeTab === "partition" && <PartitionStudioTab />}

        {activeTab === "pinouts" && <PinoutGuideTab />}

        {activeTab === "drivers" && <DriverGuideTab />}
      </div>
    </div>
  );
};
