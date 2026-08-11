/**
 * aegisFlasher Web Serial Connection Manager
 * High-performance, resilient Web Serial port controller
 */

import { SerialLogMessage } from "./types";

export interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
  manufacturer?: string;
  name?: string;
}

export const KNOWN_USB_VIDS: Record<number, string> = {
  0x303a: "Espressif Systems (Native USB / JTAG / CDC)",
  0x10c4: "Silicon Labs (CP2102 / CP2104 / CP210x)",
  0x1a86: "WCH (CH340 / CH341 / CH9102)",
  0x0403: "FTDI (FT232R / FT2232 / FT4232)",
  0x067b: "Prolific Technology (PL2303)",
  0x2e8a: "Raspberry Pi (RP2040 / Pico)",
  0x0483: "STMicroelectronics (STM32 / ST-Link / Virtual COM)",
  0x2341: "Arduino LLC (Uno, Mega, Nano, Leonardo)",
};

export class WebSerialManager {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private isReading = false;
  private isWriting = false;
  private onDataCallback: ((chunk: Uint8Array) => void) | null = null;
  private onLogCallback: ((log: SerialLogMessage) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  public static isSupported(): boolean {
    return typeof navigator !== "undefined" && "serial" in navigator;
  }

  public static isWebUsbSupported(): boolean {
    return typeof navigator !== "undefined" && "usb" in navigator;
  }

  public setOnData(cb: (chunk: Uint8Array) => void) {
    this.onDataCallback = cb;
  }

  public setOnLog(cb: (log: SerialLogMessage) => void) {
    this.onLogCallback = cb;
  }

  public setOnDisconnect(cb: () => void) {
    this.onDisconnectCallback = cb;
  }

  private log(direction: SerialLogMessage["direction"], text: string, rawBytes?: Uint8Array) {
    const msg: SerialLogMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 }),
      direction,
      text,
      rawBytes,
    };
    if (this.onLogCallback) {
      this.onLogCallback(msg);
    }
  }

  public getRawPort(): any {
    return this.port;
  }

  public async requestPort(filters?: { usbVendorId?: number; usbProductId?: number }[]): Promise<any> {
    if (!WebSerialManager.isSupported()) {
      throw new Error("Web Serial API bu tarayıcıda desteklenmiyor. Lütfen Google Chrome, Microsoft Edge, Opera veya Brave kullanın.");
    }

    try {
      this.log("sys", "Seri port seçim penceresi açılıyor...");
      const port = await (navigator as any).serial.requestPort({
        filters: filters && filters.length > 0 ? filters : undefined,
      });

      this.port = port;

      // Listen for hardware disconnects
      if (port && typeof port.addEventListener === "function") {
        port.addEventListener("disconnect", () => {
          this.log("warn", "Donanım bağlantısı kesildi (USB kablosu çıkarıldı veya cihaz kapandı).");
          if (this.onDisconnectCallback) {
            this.onDisconnectCallback();
          }
        });
      }

      const info = port.getInfo ? port.getInfo() : {};
      const vid = info.usbVendorId;
      const pid = info.usbProductId;
      const chipVendor = vid ? KNOWN_USB_VIDS[vid] || `VID: 0x${vid.toString(16).padStart(4, "0").toUpperCase()}` : "Bilinmeyen Seri Donanım";
      this.log("sys", `Cihaz seçildi: ${chipVendor} (VID: 0x${vid?.toString(16) || "?"}, PID: 0x${pid?.toString(16) || "?"})`);

      return port;
    } catch (err: any) {
      if (err.name === "NotFoundError" || err.message?.includes("No port selected")) {
        this.log("sys", "Kullanıcı port seçimini iptal etti.");
        throw new Error("Port seçimi iptal edildi.");
      }
      this.log("err", `Port seçim hatası: ${err.message || err}`);
      throw err;
    }
  }

  public async open(baudRate: number = 115200, bufferSize: number = 255 * 1024): Promise<void> {
    if (!this.port) {
      throw new Error("Önce bir seri port seçilmelidir.");
    }

    try {
      this.log("sys", `Port açılıyor (${baudRate} baud, 8N1)...`);
      await this.port.open({
        baudRate,
        bufferSize,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        flowControl: "none",
      });

      this.log("success", `Port başarıyla bağlandı (${baudRate} baud).`);
    } catch (err: any) {
      if (err.name === "InvalidStateError" || err.message?.includes("already open")) {
        this.log("warn", "Port zaten açık.");
        return;
      }
      this.log("err", `Port açma başarısız: ${err.message || err}`);
      throw err;
    }
  }

  public async close(): Promise<void> {
    this.isReading = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // ignore
      }
      try {
        this.reader.releaseLock();
      } catch {
        // ignore
      }
      this.reader = null;
    }

    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch {
        // ignore
      }
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
        this.log("sys", "Port güvenle kapatıldı.");
      } catch (err: any) {
        this.log("warn", `Port kapatılırken uyarı: ${err.message || err}`);
      }
      this.port = null;
    }
  }

  public isConnected(): boolean {
    return this.port !== null && (this.port.readable !== null || this.port.writable !== null);
  }

  public async startReading(): Promise<void> {
    if (!this.port || !this.port.readable) {
      return;
    }

    if (this.isReading) return;
    this.isReading = true;

    try {
      while (this.port && this.port.readable && this.isReading) {
        this.reader = this.port.readable.getReader();
        try {
          while (this.isReading) {
            const { value, done } = await this.reader.read();
            if (done) {
              break;
            }
            if (value && value.length > 0) {
              if (this.onDataCallback) {
                this.onDataCallback(value);
              }
            }
          }
        } catch (readErr: any) {
          if (this.isReading) {
            this.log("err", `Seri okuma hatası: ${readErr.message || readErr}`);
          }
        } finally {
          try {
            this.reader.releaseLock();
          } catch {
            // ignore
          }
          this.reader = null;
        }
      }
    } catch (err: any) {
      if (this.isReading) {
        this.log("err", `Okuma akışı kesildi: ${err.message || err}`);
      }
    } finally {
      this.isReading = false;
    }
  }

  public stopReading(): void {
    this.isReading = false;
    if (this.reader) {
      try {
        this.reader.cancel();
      } catch {
        // ignore
      }
    }
  }

  public async write(data: Uint8Array | string): Promise<void> {
    if (!this.port || !this.port.writable) {
      throw new Error("Port yazılabilir durumda değil.");
    }

    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;

    const writer = this.port.writable.getWriter();
    try {
      await writer.write(bytes);
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Hardware Pin Manipulation for Bootloader & Reset triggering:
   * DTR (Data Terminal Ready) and RTS (Ready to Send)
   */
  public async setSignals(signals: { dataTerminalReady?: boolean; requestToSend?: boolean; break?: boolean }): Promise<void> {
    if (!this.port || typeof this.port.setSignals !== "function") {
      return;
    }
    try {
      await this.port.setSignals(signals);
    } catch (err: any) {
      console.warn("setSignals error:", err);
    }
  }

  /**
   * ESP32 / ESP8266 Classic Hardware Auto-Reset Sequence:
   * RTS is connected to EN/Reset, DTR is connected to GPIO0 (Boot) via transistors
   */
  public async resetEspIntoBootloader(): Promise<void> {
    this.log("sys", "ESP otomatik bootloader sekansı uygulanıyor (DTR/RTS)...");
    await this.setSignals({ dataTerminalReady: false, requestToSend: true });
    await new Promise((r) => setTimeout(r, 100));
    await this.setSignals({ dataTerminalReady: true, requestToSend: false });
    await new Promise((r) => setTimeout(r, 250));
    await this.setSignals({ dataTerminalReady: false, requestToSend: false });
    await new Promise((r) => setTimeout(r, 100));
    this.log("sys", "ESP bootloader tetikleme tamamlandı.");
  }

  /**
   * ESP32 / ESP8266 Hard Reset into User Code
   */
  public async hardResetEsp(): Promise<void> {
    this.log("sys", "Donanımsal Reset atılıyor (EN/Reset)...");
    await this.setSignals({ dataTerminalReady: false, requestToSend: true });
    await new Promise((r) => setTimeout(r, 150));
    await this.setSignals({ dataTerminalReady: false, requestToSend: false });
    await new Promise((r) => setTimeout(r, 100));
    this.log("success", "Cihaz yeniden başlatıldı.");
  }

  /**
   * AVR / Arduino Uno/Nano DTR Pulse Reset (Triggers Optiboot Bootloader)
   */
  public async resetAvrIntoBootloader(): Promise<void> {
    this.log("sys", "Arduino/AVR bootloader reset sekansı gönderiliyor (DTR pulse)...");
    await this.setSignals({ dataTerminalReady: false });
    await new Promise((r) => setTimeout(r, 100));
    await this.setSignals({ dataTerminalReady: true });
    await new Promise((r) => setTimeout(r, 200));
    await this.setSignals({ dataTerminalReady: false });
    await new Promise((r) => setTimeout(r, 50));
  }

  /**
   * RP2040 1200 bps Touch (Triggers USB Mass Storage Bootloader)
   */
  public async rp2040Touch1200Bps(): Promise<void> {
    this.log("sys", "RP2040 1200 bps USB bootloader touch sinyali gönderiliyor...");
    if (this.port) {
      try {
        await this.close();
      } catch {
        // ignore
      }
    }
    // Reopen at 1200 baud then close
    if (this.port) {
      await this.port.open({ baudRate: 1200 });
      await new Promise((r) => setTimeout(r, 200));
      await this.port.close();
      this.log("success", "RP2040 bootloader tetiklendi. Kart RPI-RP2 sürücüsü olarak belirecektir.");
    }
  }
}
