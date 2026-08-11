/**
 * aegisFlasher AVR & Arduino (STK500v1 / Optiboot) Protocol Engine
 * Pure TypeScript implementation of STK500v1 flasher and Intel HEX parser
 */

import { ChipTelemetry, SerialLogMessage } from "./types";

export interface Stk500Callbacks {
  onLog: (msg: SerialLogMessage) => void;
  onProgress: (percent: number, writtenBytes: number, totalBytes: number) => void;
}

// STK500v1 Constants
const STK_OK = 0x10;
const STK_INSYNC = 0x14;
const STK_GET_SYNC = 0x30;
const STK_ENTER_PROGMODE = 0x50;
const STK_LEAVE_PROGMODE = 0x51;
const STK_LOAD_ADDRESS = 0x55;
const STK_PROG_PAGE = 0x64;
const CRC_EOP = 0x20;

export interface IntelHexParsed {
  data: Uint8Array;
  startAddress: number;
  endAddress: number;
  totalBytes: number;
}

export class Stk500FlasherEngine {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private callbacks: Stk500Callbacks;

  constructor(callbacks: Stk500Callbacks) {
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
   * Parse Intel HEX text file into flat binary buffer
   */
  public static parseIntelHex(hexString: string): IntelHexParsed {
    const lines = hexString.split(/\r?\n/);
    const memory = new Map<number, number>();
    let extendedAddress = 0;
    let minAddr = Infinity;
    let maxAddr = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();
      if (!line.startsWith(":")) continue;

      const byteCount = parseInt(line.substring(1, 3), 16);
      const address = parseInt(line.substring(3, 7), 16);
      const recordType = parseInt(line.substring(7, 9), 16);

      if (recordType === 0x00) {
        // Data record
        const baseAddr = extendedAddress + address;
        for (let i = 0; i < byteCount; i++) {
          const byteVal = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
          const targetAddr = baseAddr + i;
          memory.set(targetAddr, byteVal);
          if (targetAddr < minAddr) minAddr = targetAddr;
          if (targetAddr > maxAddr) maxAddr = targetAddr;
        }
      } else if (recordType === 0x01) {
        // End of File
        break;
      } else if (recordType === 0x02) {
        // Extended Segment Address
        extendedAddress = parseInt(line.substring(9, 13), 16) << 4;
      } else if (recordType === 0x04) {
        // Extended Linear Address
        extendedAddress = parseInt(line.substring(9, 13), 16) << 16;
      }
    }

    if (minAddr === Infinity) {
      minAddr = 0;
      maxAddr = 0;
    }

    const totalBytes = maxAddr > 0 ? maxAddr - minAddr + 1 : 0;
    const data = new Uint8Array(totalBytes);
    for (let i = 0; i < totalBytes; i++) {
      data[i] = memory.get(minAddr + i) ?? 0xff;
    }

    return {
      data,
      startAddress: minAddr,
      endAddress: maxAddr,
      totalBytes,
    };
  }

  private async sendCommand(cmd: Uint8Array, expectedResponseLength: number = 2, timeoutMs: number = 1000): Promise<Uint8Array> {
    if (!this.writer || !this.reader) {
      throw new Error("Port akışları açık değil.");
    }

    await this.writer.write(cmd);

    const received: number[] = [];
    const startTime = Date.now();

    while (received.length < expectedResponseLength) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`STK500 zaman aşımı (${timeoutMs}ms). Yanıt alınamadı.`);
      }

      const readPromise = this.reader.read();
      const timeoutPromise = new Promise<{ value?: Uint8Array; done: boolean }>((resolve) =>
        setTimeout(() => resolve({ done: true }), Math.max(10, timeoutMs - (Date.now() - startTime)))
      );

      const result = await Promise.race([readPromise, timeoutPromise]);
      if (result.value) {
        for (let i = 0; i < result.value.length; i++) {
          received.push(result.value[i]);
        }
      }
    }

    return new Uint8Array(received);
  }

  /**
   * Flash Intel HEX file to Arduino / ATmega328P / ATmega2560 via STK500v1
   */
  public async flashHex(
    port: any,
    hexContent: string,
    options: {
      baudRate?: number; // 115200 for Uno / Optiboot, 57600 for older Nano
      pageSize?: number; // 128 bytes for ATmega328P, 256 for ATmega2560
      targetChip?: "ATmega328P" | "ATmega2560" | "ATmega32U4";
    } = {}
  ): Promise<ChipTelemetry> {
    this.port = port;
    const baudRate = options.baudRate || 115200;
    const pageSize = options.pageSize || 128;
    const chipName = options.targetChip || "ATmega328P";

    this.log("sys", `Arduino (${chipName}) STK500v1 başlatılıyor (${baudRate} baud, ${pageSize}B sayfa)...`);

    // Parse Intel HEX
    const parsed = Stk500FlasherEngine.parseIntelHex(hexContent);
    this.log("sys", `HEX ayrıştırıldı: ${parsed.totalBytes} bayt (${Math.ceil(parsed.totalBytes / pageSize)} sayfa).`);

    if (parsed.totalBytes === 0) {
      throw new Error("HEX dosyası boş veya geçersiz format.");
    }

    // Open port
    await port.open({ baudRate, bufferSize: 8192 });

    this.writer = port.writable.getWriter();
    this.reader = port.readable.getReader();

    try {
      // Step 1: DTR Pulse to reset Arduino into Optiboot bootloader
      this.log("sys", "DTR darbesi ile bootloader tetikleniyor...");
      if (typeof port.setSignals === "function") {
        await port.setSignals({ dataTerminalReady: false });
        await new Promise((r) => setTimeout(r, 100));
        await port.setSignals({ dataTerminalReady: true });
        await new Promise((r) => setTimeout(r, 200));
        await port.setSignals({ dataTerminalReady: false });
        await new Promise((r) => setTimeout(r, 100));
      }

      // Step 2: Sync with bootloader (STK_GET_SYNC)
      this.log("sys", "Bootloader senkronizasyonu deneniyor (STK_GET_SYNC)...");
      let synced = false;
      for (let attempt = 1; attempt <= 10; attempt++) {
        try {
          const syncCmd = new Uint8Array([STK_GET_SYNC, CRC_EOP]);
          const resp = await this.sendCommand(syncCmd, 2, 400);
          if (resp[0] === STK_INSYNC && resp[1] === STK_OK) {
            synced = true;
            this.log("success", `Arduino bootloader senkronize edildi (Deneme ${attempt}).`);
            break;
          }
        } catch {
          await new Promise((r) => setTimeout(r, 50));
        }
      }

      if (!synced) {
        throw new Error("Arduino senkronize edilemedi. Baud hızını (115200 vs 57600) veya kart tipini kontrol edin.");
      }

      // Step 3: Enter Programming Mode
      this.log("sys", "Programlama moduna giriliyor...");
      const enterProgCmd = new Uint8Array([STK_ENTER_PROGMODE, CRC_EOP]);
      const enterResp = await this.sendCommand(enterProgCmd, 2, 500);
      if (enterResp[0] !== STK_INSYNC || enterResp[1] !== STK_OK) {
        throw new Error("Programlama moduna girilemedi.");
      }

      // Step 4: Write pages
      const totalPages = Math.ceil(parsed.totalBytes / pageSize);
      this.log("sys", `Flash yazılıyor: Toplam ${totalPages} sayfa...`);

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pageOffset = pageIdx * pageSize;
        const wordAddress = pageOffset / 2; // STK500 uses 16-bit word addresses

        // Set address
        const addrLow = wordAddress & 0xff;
        const addrHigh = (wordAddress >> 8) & 0xff;
        const loadAddrCmd = new Uint8Array([STK_LOAD_ADDRESS, addrLow, addrHigh, CRC_EOP]);
        const addrResp = await this.sendCommand(loadAddrCmd, 2, 300);
        if (addrResp[0] !== STK_INSYNC || addrResp[1] !== STK_OK) {
          throw new Error(`Adres yükleme hatası (Sayfa ${pageIdx + 1}).`);
        }

        // Prepare page data
        const pageData = new Uint8Array(pageSize);
        for (let i = 0; i < pageSize; i++) {
          const byteIdx = pageOffset + i;
          pageData[i] = byteIdx < parsed.totalBytes ? parsed.data[byteIdx] : 0xff;
        }

        // Program page command
        const progPageHeader = new Uint8Array([
          STK_PROG_PAGE,
          (pageSize >> 8) & 0xff,
          pageSize & 0xff,
          0x46, // 'F' for Flash
        ]);

        const fullProgCmd = new Uint8Array(progPageHeader.length + pageSize + 1);
        fullProgCmd.set(progPageHeader, 0);
        fullProgCmd.set(pageData, progPageHeader.length);
        fullProgCmd[fullProgCmd.length - 1] = CRC_EOP;

        const progResp = await this.sendCommand(fullProgCmd, 2, 1000);
        if (progResp[0] !== STK_INSYNC || progResp[1] !== STK_OK) {
          throw new Error(`Sayfa ${pageIdx + 1} yazılırken hata oluştu.`);
        }

        const writtenBytes = Math.min((pageIdx + 1) * pageSize, parsed.totalBytes);
        const percent = Math.round((writtenBytes / parsed.totalBytes) * 100);
        this.callbacks.onProgress(percent, writtenBytes, parsed.totalBytes);
      }

      // Step 5: Leave Programming Mode
      this.log("sys", "Programlama modundan çıkılıyor...");
      const leaveProgCmd = new Uint8Array([STK_LEAVE_PROGMODE, CRC_EOP]);
      await this.sendCommand(leaveProgCmd, 2, 500);

      this.log("success", `Arduino ${chipName} başarıyla flaşlandı (%100 tamamlandı).`);

      const telemetry: ChipTelemetry = {
        family: (chipName === "ATmega2560" ? "AVR-ATmega2560" : "AVR-ATmega328P") as any,
        modelName: `AVR ${chipName} (8-bit RISC)`,
        flashSize: chipName === "ATmega2560" ? "256KB" : "32KB",
        flashSizeInBytes: chipName === "ATmega2560" ? 256 * 1024 : 32 * 1024,
        features: ["8-bit AVR Core", "16MHz Crystal", "Optiboot STK500v1", "EEPROM Support"],
        detectedAt: new Date(),
      };

      return telemetry;
    } finally {
      if (this.reader) {
        try {
          this.reader.releaseLock();
        } catch {
          // ignore
        }
      }
      if (this.writer) {
        try {
          this.writer.releaseLock();
        } catch {
          // ignore
        }
      }
      try {
        await port.close();
      } catch {
        // ignore
      }
    }
  }
}
