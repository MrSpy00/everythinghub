/**
 * aegisFlasher STM32 USART Bootloader Protocol Engine (AN3155)
 * Pure TypeScript implementation for STM32F103, STM32F407, STM32G0 etc.
 */

import { ChipTelemetry, SerialLogMessage } from "./types";

export const STM32_CHIP_IDS: Record<number, string> = {
  0x0410: "STM32F103 (Medium Density, Cortex-M3 72MHz 'BluePill')",
  0x0414: "STM32F103 (High Density, Cortex-M3 72MHz)",
  0x0412: "STM32F103 (Low Density)",
  0x0413: "STM32F407 / STM32F417 (Cortex-M4 168MHz FPU)",
  0x0423: "STM32F401 (Cortex-M4 'BlackPill')",
  0x0431: "STM32F411 (Cortex-M4 'BlackPill')",
  0x0444: "STM32G031 / STM32G071 (Cortex-M0+ 64MHz)",
  0x0452: "STM32F746 / STM32F756 (Cortex-M7 216MHz)",
};

const ACK = 0x79;
const NACK = 0x1f;
const SYNC_BYTE = 0x7f;

const _CMD_GET = 0x00;
const _CMD_GET_VERSION = 0x01;
const CMD_GET_ID = 0x02;
const _CMD_READ_MEMORY = 0x11;
const _CMD_GO = 0x21;
const _CMD_WRITE_MEMORY = 0x31;
const _CMD_ERASE = 0x43;
const _CMD_EXT_ERASE = 0x44;

export interface Stm32Callbacks {
  onLog: (msg: SerialLogMessage) => void;
  onProgress: (percent: number, writtenBytes: number, totalBytes: number) => void;
}

export class Stm32FlasherEngine {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private callbacks: Stm32Callbacks;

  constructor(callbacks: Stm32Callbacks) {
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

  private async sendAndExpectAck(bytes: Uint8Array, timeoutMs: number = 1000): Promise<Uint8Array> {
    if (!this.writer || !this.reader) {
      throw new Error("Port akışları hazır değil.");
    }

    await this.writer.write(bytes);

    const received: number[] = [];
    const startTime = Date.now();

    while (received.length === 0) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`STM32 zaman aşımı (${timeoutMs}ms). Yanıt alınamadı.`);
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

    if (received[0] === NACK) {
      throw new Error("STM32 komutu NACK (0x1F) ile reddetti.");
    }
    if (received[0] !== ACK) {
      throw new Error(`STM32 beklenmeyen yanıt döndürdü: 0x${received[0].toString(16)}`);
    }

    return new Uint8Array(received);
  }

  /**
   * Connect to STM32 in System Memory Bootloader Mode (BOOT0=1, BOOT1=0)
   */
  public async connectAndDetect(
    port: any,
    baudRate: number = 115200
  ): Promise<{ telemetry: ChipTelemetry }> {
    this.port = port;
    this.log("sys", `STM32 USART bootloader bağlanıyor (${baudRate} baud, 8E1/8N1)...`);

    await port.open({
      baudRate,
      dataBits: 8,
      parity: "even", // STM32 AN3155 specifies even parity
      stopBits: 1,
      bufferSize: 8192,
    });

    this.writer = port.writable.getWriter();
    this.reader = port.readable.getReader();

    try {
      // Step 1: Send Init Sync Byte (0x7F)
      this.log("sys", "STM32 senkronizasyon baytı (0x7F) gönderiliyor...");
      let synced = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await this.writer.write(new Uint8Array([SYNC_BYTE]));
          const resp = await this.readBytes(1, 500);
          if (resp[0] === ACK || resp[0] === NACK) {
            synced = true;
            this.log("success", "STM32 bootloader ile senkronizasyon sağlandı (ACK).");
            break;
          }
        } catch {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      if (!synced) {
        throw new Error("STM32 senkronize edilemedi. Lütfen BOOT0 pinini 3.3V (HIGH)'a çekip Reset atın.");
      }

      // Step 2: Get Chip ID (0x02 0xFD)
      this.log("sys", "STM32 Chip ID okunuyor...");
      await this.sendAndExpectAck(new Uint8Array([CMD_GET_ID, 0xfd]));
      const lenBytes = await this.readBytes(1, 500);
      const numBytes = lenBytes[0] + 1;
      const chipIdBytes = await this.readBytes(numBytes, 500);
      await this.readBytes(1, 300); // Final ACK

      let chipIdNumber = 0;
      if (numBytes >= 2) {
        chipIdNumber = (chipIdBytes[0] << 8) | chipIdBytes[1];
      }

      const modelName = STM32_CHIP_IDS[chipIdNumber] || `STM32 (PID: 0x${chipIdNumber.toString(16).padStart(4, "0").toUpperCase()})`;
      this.log("success", `STM32 çipi tespit edildi: ${modelName}`);

      const telemetry: ChipTelemetry = {
        family: "STM32F103",
        modelName,
        chipId: `0x${chipIdNumber.toString(16).toUpperCase()}`,
        flashSize: "64KB - 512KB",
        features: ["ARM Cortex-M Core", "USART Bootloader AN3155", "Hardware CRC", "DMA Support"],
        detectedAt: new Date(),
      };

      return { telemetry };
    } finally {
      // Keep port open if needed, or close
    }
  }

  private async readBytes(count: number, timeoutMs: number = 1000): Promise<Uint8Array> {
    const received: number[] = [];
    const startTime = Date.now();

    while (received.length < count) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Okuma zaman aşımı (${count} bayt bekleniyordu, ${received.length} alındı).`);
      }
      const readPromise = this.reader.read();
      const timeoutPromise = new Promise<{ value?: Uint8Array; done: boolean }>((resolve) =>
        setTimeout(() => resolve({ done: true }), Math.max(10, timeoutMs - (Date.now() - startTime)))
      );
      const res = await Promise.race([readPromise, timeoutPromise]);
      if (res.value) {
        for (let i = 0; i < res.value.length; i++) {
          received.push(res.value[i]);
        }
      }
    }
    return new Uint8Array(received);
  }

  public async close(): Promise<void> {
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
    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // ignore
      }
    }
  }
}
