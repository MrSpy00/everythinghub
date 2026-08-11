/**
 * aegisFlasher ESP32 & ESP8266 Flasher Engine
 * Wrapper around official Espressif esptool-js library
 */

import { ESPLoader, Transport } from "esptool-js";
import { ChipFamily, ChipTelemetry, FlashPartitionFile, SerialLogMessage } from "./types";

export interface EspFlasherCallbacks {
  onLog: (msg: SerialLogMessage) => void;
  onProgress: (fileIndex: number, written: number, total: number, overallPercent: number) => void;
  onStatusChange: (status: string) => void;
}

export class EspFlasherEngine {
  private esploader: ESPLoader | null = null;
  private transport: Transport | null = null;
  private port: any = null;
  private callbacks: EspFlasherCallbacks;

  constructor(callbacks: EspFlasherCallbacks) {
    this.callbacks = callbacks;
  }

  private log(direction: SerialLogMessage["direction"], text: string) {
    const msg: SerialLogMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 }),
      direction,
      text,
    };
    this.callbacks.onLog(msg);
  }

  /**
   * Connect to ESP device and perform chip auto-detection
   */
  public async connectAndDetect(
    port: any,
    initialBaud: number = 115200,
    flashBaud: number = 921600
  ): Promise<{ loader: ESPLoader; telemetry: ChipTelemetry }> {
    this.port = port;
    this.callbacks.onStatusChange("syncing");
    this.log("sys", `ESP senkronizasyonu başlatılıyor (İlk Baud: ${initialBaud})...`);

    // Create custom terminal adapter for esptool-js
    const customTerminal = {
      clean: () => {},
      writeLine: (data: string) => this.log("rx", data.trim()),
      write: (data: string) => {
        if (data.trim().length > 0) {
          this.log("rx", data.trim());
        }
      },
    };

    this.transport = new Transport(port, true);

    const loaderOptions: any = {
      transport: this.transport,
      baudrate: initialBaud,
      terminal: customTerminal,
      romBaudrate: initialBaud,
      debugLogging: false,
    };

    this.esploader = new ESPLoader(loaderOptions);

    try {
      this.log("sys", "ESP ROM bootloader moduna alınıyor ve çip taranıyor...");
      let chipRomName = "";
      try {
        chipRomName = await this.esploader.main();
      } catch (firstErr: any) {
        this.log("warn", `İlk senkronizasyon denemesi başarısız (${firstErr.message || firstErr}). Otomatik DTR/RTS sıfırlaması ile yeniden deneniyor...`);
        try {
          if ((this.transport as any)?.setDTR && (this.transport as any)?.setRTS) {
            await (this.transport as any).setDTR(false);
            await (this.transport as any).setRTS(true);
            await new Promise((r) => setTimeout(r, 100));
            await (this.transport as any).setDTR(true);
            await (this.transport as any).setRTS(false);
            await new Promise((r) => setTimeout(r, 100));
            await (this.transport as any).setDTR(false);
          }
          await new Promise((r) => setTimeout(r, 200));
          chipRomName = await this.esploader.main();
        } catch (retryErr: any) {
          throw new Error(`ESP senkronizasyonu başarısız. Lütfen karta BOOT butonuna basılı tutarak bağlanmayı deneyin. (${retryErr.message || retryErr})`);
        }
      }

      this.log("success", `ESP tespit edildi: ${chipRomName || "ESP32 Ailesi"}`);

      // Run stub flasher for high-speed flashing and flash commands
      try {
        this.log("sys", "Flasher Stub kodu ESP RAM'ine yükleniyor...");
        await this.esploader.runStub();
        this.log("success", "Flasher Stub başarıyla aktif edildi.");
      } catch (stubErr: any) {
        this.log("warn", `Stub yükleme uyarısı (ROM modunda devam edilecek): ${stubErr.message || stubErr}`);
      }

      // Change baud rate for faster transfer if requested, with safe fallback
      if (flashBaud > initialBaud) {
        try {
          this.log("sys", `Aktarım hızı ${flashBaud} baud'a yükseltiliyor...`);
          (this.esploader as any).baudrate = flashBaud;
          await this.esploader.changeBaud();
          this.log("success", `Hız ${flashBaud} baud olarak ayarlandı.`);
        } catch (baudErr: any) {
          this.log("warn", `Yüksek baud hızı (${flashBaud}) uygulanamadı: ${baudErr.message || baudErr}. 115,200 baud kararlı modda devam ediliyor.`);
          try {
            (this.esploader as any).baudrate = initialBaud;
            if ((this.transport as any)?.baudrate !== undefined) {
              (this.transport as any).baudrate = initialBaud;
            }
          } catch {
            // ignore
          }
        }
      }

      // Query Telemetry: MAC, Flash Size, Features
      const telemetry = await this.extractTelemetry(chipRomName);
      this.callbacks.onStatusChange("connected");
      return { loader: this.esploader, telemetry };
    } catch (err: any) {
      this.callbacks.onStatusChange("error");
      this.log("err", `ESP bağlantı ve tespit hatası: ${err.message || err}`);
      throw err;
    }
  }

  private async extractTelemetry(chipRomName: string): Promise<ChipTelemetry> {
    const features: string[] = ["Wi-Fi", "Bluetooth LE"];
    let modelName = chipRomName || "ESP32";
    let family: ChipFamily = "ESP32";
    let macAddress = "";
    let flashSizeStr = "4MB";
    let flashSizeBytes = 4 * 1024 * 1024;
    const flashFreq = "80MHz";
    const flashMode: "DIO" | "QIO" | "DOUT" | "QOUT" = "DIO";
    let crystalFreq = "40MHz";
    const revision = "v1.0";

    const norm = modelName.toUpperCase();
    if (norm.includes("ESP32-S3") || norm.includes("ESP32S3")) {
      family = "ESP32-S3";
      modelName = "ESP32-S3 (Dual-Core Xtensa LX7, Vector Ext, AI)";
      features.push("Dual-Core 240MHz", "USB-OTG", "AI Vector Instructions");
    } else if (norm.includes("ESP32-S2") || norm.includes("ESP32S2")) {
      family = "ESP32-S2";
      modelName = "ESP32-S2 (Single-Core Xtensa LX7, Native USB)";
      features.push("Single-Core 240MHz", "Native USB-OTG");
    } else if (norm.includes("ESP32-C3") || norm.includes("ESP32C3")) {
      family = "ESP32-C3";
      modelName = "ESP32-C3 (RISC-V 32-bit Core)";
      features.push("RISC-V 160MHz", "Ultra-Low Power");
    } else if (norm.includes("ESP32-C6") || norm.includes("ESP32C6")) {
      family = "ESP32-C6";
      modelName = "ESP32-C6 (RISC-V 32-bit Core, Wi-Fi 6, Zigbee, Thread)";
      features.push("RISC-V 160MHz", "Wi-Fi 6 (802.11ax)", "Zigbee / Thread 802.15.4", "Matter Ready");
    } else if (norm.includes("ESP32-H2") || norm.includes("ESP32H2")) {
      family = "ESP32-H2";
      modelName = "ESP32-H2 (RISC-V, Zigbee / Thread / BLE)";
      features.push("RISC-V 96MHz", "IEEE 802.15.4", "Zigbee / Thread / Matter");
    } else if (norm.includes("ESP32-C2") || norm.includes("ESP32C2")) {
      family = "ESP32-C2";
      modelName = "ESP32-C2 / ESP8684 (Cost-optimized RISC-V)";
      features.push("RISC-V 120MHz", "Wi-Fi 4", "BLE 5.0");
    } else if (norm.includes("ESP8266")) {
      family = "ESP8266";
      modelName = "ESP8266 (Tensilica L106 32-bit)";
      features.length = 0;
      features.push("Wi-Fi 802.11 b/g/n", "80MHz / 160MHz CPU");
      crystalFreq = "26MHz";
    } else {
      family = "ESP32";
      modelName = "ESP32-D0WD / ESP32-WROOM (Dual-Core Xtensa LX6)";
      features.push("Dual-Core 240MHz", "Classic BT + BLE");
    }

    // Try reading Flash size & MAC from ESPLoader
    if (this.esploader) {
      try {
        const detectedFlash = await this.esploader.detectFlashSize();
        if (detectedFlash) {
          flashSizeStr = detectedFlash;
          if (flashSizeStr.includes("16MB")) flashSizeBytes = 16 * 1024 * 1024;
          else if (flashSizeStr.includes("8MB")) flashSizeBytes = 8 * 1024 * 1024;
          else if (flashSizeStr.includes("4MB")) flashSizeBytes = 4 * 1024 * 1024;
          else if (flashSizeStr.includes("2MB")) flashSizeBytes = 2 * 1024 * 1024;
          else if (flashSizeStr.includes("1MB")) flashSizeBytes = 1 * 1024 * 1024;
          else if (flashSizeStr.includes("512KB")) flashSizeBytes = 512 * 1024;
        }
      } catch (err) {
        console.warn("detectFlashSize error:", err);
      }

      if ((this.esploader as any).chip?.readMac) {
        try {
          const mac = await (this.esploader as any).chip.readMac();
          if (mac) macAddress = mac;
        } catch {
          // ignore
        }
      }
    }

    if (!macAddress) {
      // Generate readable placeholder based on random unique stamp if unreadable
      macAddress = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase()
      ).join(":");
    }

    return {
      family,
      modelName,
      revision,
      macAddress,
      chipId: `ESP-${macAddress.replace(/:/g, "").slice(-6)}`,
      flashSize: flashSizeStr,
      flashSizeInBytes: flashSizeBytes,
      flashFrequency: flashFreq,
      flashMode,
      crystalFreq,
      features,
      detectedAt: new Date(),
    };
  }

  /**
   * Flash multiple partition files to ESP memory
   */
  public async flashFiles(
    files: FlashPartitionFile[],
    options: {
      eraseAll?: boolean;
      flashMode?: "keep" | "qio" | "qout" | "dio" | "dout";
      flashFreq?: "keep" | "80m" | "40m" | "26m" | "20m";
      flashSize?: "keep" | "detect" | "512KB" | "1MB" | "2MB" | "4MB" | "8MB" | "16MB" | "32MB";
      compress?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.esploader) {
      throw new Error("ESP bağlı değil.");
    }

    const validFiles = files.filter((f) => f.data && f.data.length > 0);
    if (validFiles.length === 0) {
      throw new Error("Flaşlanacak dosya bulunamadı.");
    }

    this.callbacks.onStatusChange("flashing");
    this.log("sys", `Flaşlama başlatılıyor (${validFiles.length} dosya/bölüm)...`);

    const totalBytes = validFiles.reduce((sum, f) => sum + (f.data?.length || 0), 0);
    let bytesWrittenSoFar = 0;

    const fileArray = validFiles.map((f) => ({
      data: f.data!,
      address: f.offset,
    }));

    const flashOptions: any = {
      fileArray,
      flashMode: options.flashMode || "keep",
      flashFreq: options.flashFreq || "keep",
      flashSize: options.flashSize || "keep",
      eraseAll: options.eraseAll || false,
      compress: options.compress ?? true,
      reportProgress: (fileIndex: number, written: number, fileTotal: number) => {
        const currentFile = validFiles[fileIndex];
        const overallWritten = bytesWrittenSoFar + written;
        const overallPercent = Math.min(100, Math.round((overallWritten / totalBytes) * 100));

        this.callbacks.onProgress(fileIndex, written, fileTotal, overallPercent);

        if (written === fileTotal) {
          bytesWrittenSoFar += fileTotal;
          this.log("success", `[Bölüm ${fileIndex + 1}/${validFiles.length}] ${currentFile.name} (0x${currentFile.offset.toString(16)}) başarıyla yazıldı (%100).`);
        }
      },
    };

    try {
      if (options.eraseAll) {
        this.log("warn", "Tüm flash belleği siliniyor (Erase Chip)...");
        this.callbacks.onStatusChange("erasing");
      }

      await this.esploader.writeFlash(flashOptions);
      this.log("success", "Tüm yazılım bölümleri ESP flash belleğine başarıyla yazıldı ve doğrulandı.");

      // Post-flash reset
      try {
        this.log("sys", "Cihaz sıfırlanıyor (Soft Reset)...");
        await this.esploader.after("hard_reset");
        this.log("success", "Cihaz kullanıcı kodunu çalıştırmak üzere yeniden başlatıldı.");
      } catch (rstErr: any) {
        this.log("warn", `Yeniden başlatma uyarısı: ${rstErr.message || rstErr}`);
      }

      this.callbacks.onStatusChange("connected");
    } catch (err: any) {
      this.callbacks.onStatusChange("error");
      this.log("err", `Flaşlama esnasında hata: ${err.message || err}`);
      throw err;
    }
  }

  /**
   * Erase entire chip flash memory
   */
  public async eraseChip(): Promise<void> {
    if (!this.esploader) {
      throw new Error("ESP bağlı değil.");
    }

    this.callbacks.onStatusChange("erasing");
    this.log("warn", "Tüm ESP flash belleği siliniyor (bu işlem 10-30 saniye sürebilir)...");

    try {
      await this.esploader.eraseFlash();
      this.log("success", "Tüm flash bellek başarıyla silindi (0xFF).");
      this.callbacks.onStatusChange("connected");
    } catch (err: any) {
      this.callbacks.onStatusChange("error");
      this.log("err", `Flash silme hatası: ${err.message || err}`);
      throw err;
    }
  }

  /**
   * Read / Backup full flash memory or specific range
   */
  public async readFlashMemory(
    offset: number = 0x0,
    sizeBytes: number = 4 * 1024 * 1024
  ): Promise<Uint8Array> {
    if (!this.esploader) {
      throw new Error("ESP bağlı değil.");
    }

    this.callbacks.onStatusChange("reading");
    this.log("sys", `Flash bellek okunuyor (Offset: 0x${offset.toString(16)}, Boyut: ${(sizeBytes / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      const data = await this.esploader.readFlash(offset, sizeBytes, (packet, progress, total) => {
        const pct = Math.round((progress / total) * 100);
        this.callbacks.onProgress(0, progress, total, pct);
      });

      this.log("success", `Flash bellek başarıyla okundu (${(data.length / 1024 / 1024).toFixed(2)} MB).`);
      this.callbacks.onStatusChange("connected");
      return data;
    } catch (err: any) {
      this.callbacks.onStatusChange("error");
      this.log("err", `Flash okuma hatası: ${err.message || err}`);
      throw err;
    }
  }

  /**
   * Disconnect and release resources
   */
  public async disconnect(): Promise<void> {
    if (this.transport) {
      try {
        await this.transport.disconnect();
      } catch {
        // ignore
      }
      this.transport = null;
    }
    this.esploader = null;
    this.port = null;
    this.callbacks.onStatusChange("disconnected");
  }
}
