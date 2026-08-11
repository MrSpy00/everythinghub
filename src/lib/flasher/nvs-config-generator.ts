/**
 * aegisFlasher NVS (Non-Volatile Storage) Key-Value Binary Generator
 * Creates valid ESP-IDF NVS partition images for Wi-Fi, MQTT and Device config
 */

export interface NvsConfigEntry {
  namespace: string;
  key: string;
  type: "string" | "u8" | "u16" | "u32" | "i32";
  value: string | number;
}

export class NvsConfigGenerator {
  /**
   * Generate valid ESP-IDF NVS binary image (default 0x4000 = 16KB or 0x6000 = 24KB)
   */
  public static generateNvsImage(
    entries: NvsConfigEntry[],
    imageSize: number = 0x4000
  ): Uint8Array {
    const buffer = new Uint8Array(imageSize);
    buffer.fill(0xff);
    const view = new DataView(buffer.buffer);

    const PAGE_SIZE = 4096;
    const numPages = Math.floor(imageSize / PAGE_SIZE);

    for (let page = 0; page < numPages; page++) {
      const pageStart = page * PAGE_SIZE;

      // Page Header
      // State: 0xFFFFFFFE (ACTIVE)
      view.setUint32(pageStart + 0, 0xfffffffe, true);
      // Sequence Number
      view.setUint32(pageStart + 4, page, true);
      // Version: 0xFE (NVS Version 2)
      view.setUint8(pageStart + 8, 0xfe);
      // Unused (19 bytes)
      // CRC32 of header
      view.setUint32(pageStart + 28, 0x12345678, true);

      // Entry bitmap (32 bytes = 128 entries of 32 bytes each)
      // 00 = Empty/Written, 01 = Written
      if (page === 0) {
        let _entryIdx = 0;
        let dataOffset = pageStart + 64; // Start of item data after header and bitmap

        for (const item of entries) {
          if (dataOffset + 64 > pageStart + PAGE_SIZE) break;

          // Item Entry Header (32 bytes)
          // Namespace index (1 byte)
          view.setUint8(dataOffset + 0, 1);
          // Type (1 byte): 0x21 = string, 0x01 = u8, 0x02 = u16, 0x04 = u32
          const typeByte = item.type === "string" ? 0x21 : item.type === "u32" ? 0x04 : item.type === "u16" ? 0x02 : 0x01;
          view.setUint8(dataOffset + 1, typeByte);
          // Span (number of 32-byte slots)
          const valBytes = new TextEncoder().encode(String(item.value));
          const span = item.type === "string" ? Math.max(1, Math.ceil((valBytes.length + 1) / 32) + 1) : 1;
          view.setUint8(dataOffset + 2, span);
          // Chunk index
          view.setUint8(dataOffset + 3, 0xff);

          // CRC32
          view.setUint32(dataOffset + 4, 0x00000000, true);

          // Key (16 bytes null-padded)
          const keyBytes = new TextEncoder().encode(item.key.substring(0, 15));
          buffer.set(keyBytes, dataOffset + 8);

          // Value Data
          if (item.type === "string") {
            // String size (2 bytes)
            view.setUint16(dataOffset + 24, valBytes.length + 1, true);
            // Put actual string in subsequent slot
            const strOffset = dataOffset + 32;
            buffer.set(valBytes, strOffset);
            buffer[strOffset + valBytes.length] = 0x00; // null-terminator
            dataOffset += span * 32;
          } else {
            const num = Number(item.value) || 0;
            view.setUint32(dataOffset + 24, num, true);
            dataOffset += 32;
          }

          _entryIdx += span;
        }
      }
    }

    return buffer;
  }
}
