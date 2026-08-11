/**
 * aegisFlasher ESP-IDF Partition Table Engine & Memory Map Generator
 * Generates official partition CSVs, binary partition tables, and validates flash bounds
 */

import { PartitionTableEntry } from "./types";

export const PARTITION_PRESETS: { id: string; name: string; flashSize: string; entries: PartitionTableEntry[] }[] = [
  {
    id: "default_4mb",
    name: "Standart 4MB (Tek Uygulama + NVS + SPIFFS)",
    flashSize: "4MB",
    entries: [
      { id: "p1", name: "nvs", type: "data", subType: "nvs", offset: 0x9000, size: 0x6000, flags: "", color: "#3b82f6" },
      { id: "p2", name: "phy_init", type: "data", subType: "phy", offset: 0xf000, size: 0x1000, flags: "", color: "#6366f1" },
      { id: "p3", name: "factory", type: "app", subType: "factory", offset: 0x10000, size: 0x180000, flags: "", color: "#10b981" },
      { id: "p4", name: "spiffs", type: "data", subType: "spiffs", offset: 0x190000, size: 0x270000, flags: "", color: "#f59e0b" },
    ],
  },
  {
    id: "ota_4mb",
    name: "Standart 4MB Çift OTA (App0 + App1 + Otadata + NVS + SPIFFS)",
    flashSize: "4MB",
    entries: [
      { id: "p1", name: "nvs", type: "data", subType: "nvs", offset: 0x9000, size: 0x4000, flags: "", color: "#3b82f6" },
      { id: "p2", name: "otadata", type: "data", subType: "otadata", offset: 0xd000, size: 0x2000, flags: "", color: "#8b5cf6" },
      { id: "p3", name: "phy_init", type: "data", subType: "phy", offset: 0xf000, size: 0x1000, flags: "", color: "#6366f1" },
      { id: "p4", name: "app0", type: "app", subType: "ota_0", offset: 0x10000, size: 0x140000, flags: "", color: "#10b981" },
      { id: "p5", name: "app1", type: "app", subType: "ota_1", offset: 0x150000, size: 0x140000, flags: "", color: "#06b6d4" },
      { id: "p6", name: "spiffs", type: "data", subType: "spiffs", offset: 0x290000, size: 0x170000, flags: "", color: "#f59e0b" },
    ],
  },
  {
    id: "huge_app_4mb",
    name: "Geniş Uygulama 4MB (3.1MB Tek App + NVS + LittleFS)",
    flashSize: "4MB",
    entries: [
      { id: "p1", name: "nvs", type: "data", subType: "nvs", offset: 0x9000, size: 0x6000, flags: "", color: "#3b82f6" },
      { id: "p2", name: "phy_init", type: "data", subType: "phy", offset: 0xf000, size: 0x1000, flags: "", color: "#6366f1" },
      { id: "p3", name: "app0", type: "app", subType: "factory", offset: 0x10000, size: 0x320000, flags: "", color: "#10b981" },
      { id: "p4", name: "littlefs", type: "data", subType: "littlefs", offset: 0x330000, size: 0xd0000, flags: "", color: "#ec4899" },
    ],
  },
  {
    id: "s3_8mb",
    name: "ESP32-S3 8MB Çift OTA + 3.8MB LittleFS",
    flashSize: "8MB",
    entries: [
      { id: "p1", name: "nvs", type: "data", subType: "nvs", offset: 0x9000, size: 0x4000, flags: "", color: "#3b82f6" },
      { id: "p2", name: "otadata", type: "data", subType: "otadata", offset: 0xd000, size: 0x2000, flags: "", color: "#8b5cf6" },
      { id: "p3", name: "phy_init", type: "data", subType: "phy", offset: 0xf000, size: 0x1000, flags: "", color: "#6366f1" },
      { id: "p4", name: "app0", type: "app", subType: "ota_0", offset: 0x10000, size: 0x200000, flags: "", color: "#10b981" },
      { id: "p5", name: "app1", type: "app", subType: "ota_1", offset: 0x210000, size: 0x200000, flags: "", color: "#06b6d4" },
      { id: "p6", name: "littlefs", type: "data", subType: "littlefs", offset: 0x410000, size: 0x3f0000, flags: "", color: "#ec4899" },
    ],
  },
  {
    id: "s3_16mb",
    name: "ESP32-S3 16MB Büyük Medya / Model Alanı",
    flashSize: "16MB",
    entries: [
      { id: "p1", name: "nvs", type: "data", subType: "nvs", offset: 0x9000, size: 0x6000, flags: "", color: "#3b82f6" },
      { id: "p2", name: "otadata", type: "data", subType: "otadata", offset: 0xf000, size: 0x2000, flags: "", color: "#8b5cf6" },
      { id: "p3", name: "app0", type: "app", subType: "ota_0", offset: 0x20000, size: 0x400000, flags: "", color: "#10b981" },
      { id: "p4", name: "app1", type: "app", subType: "ota_1", offset: 0x420000, size: 0x400000, flags: "", color: "#06b6d4" },
      { id: "p5", name: "storage", type: "data", subType: "littlefs", offset: 0x820000, size: 0x7e0000, flags: "", color: "#ec4899" },
    ],
  },
];

export class PartitionTableEngine {
  /**
   * Convert partition entries to standard ESP-IDF CSV format
   */
  public static toCsv(entries: PartitionTableEntry[]): string {
    let csv = `# ESP-IDF Partition Table\n# Name, Type, SubType, Offset, Size, Flags\n`;
    for (const e of entries) {
      const typeStr = e.type;
      const subTypeStr = e.subType;
      const offsetHex = `0x${e.offset.toString(16)}`;
      const sizeHex = `0x${e.size.toString(16)}`;
      csv += `${e.name}, ${typeStr}, ${subTypeStr}, ${offsetHex}, ${sizeHex}, ${e.flags || ""}\n`;
    }
    return csv;
  }

  /**
   * Validate partitions for overlaps and flash boundary
   */
  public static validate(
    entries: PartitionTableEntry[],
    maxFlashBytes: number = 4 * 1024 * 1024
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Sort by offset
    const sorted = [...entries].sort((a, b) => a.offset - b.offset);

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];

      if (cur.offset < 0x9000) {
        errors.push(`[${cur.name}] Bölüm başlangıç adresi (0x${cur.offset.toString(16)}) 0x9000'den küçük olamaz (Bootloader ve Bölüm Tablosu için ayrılmıştır).`);
      }

      if (cur.type === "app" && cur.offset % 0x10000 !== 0) {
        warnings.push(`[${cur.name}] Uygulama (app) bölümleri 64KB (0x10000) sınırına hizalı olmalıdır (Mevcut: 0x${cur.offset.toString(16)}).`);
      }

      const curEnd = cur.offset + cur.size;
      if (curEnd > maxFlashBytes) {
        errors.push(`[${cur.name}] Flash sınırını aşıyor: ${(curEnd / 1024 / 1024).toFixed(2)} MB > ${(maxFlashBytes / 1024 / 1024).toFixed(2)} MB.`);
      }

      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        if (curEnd > next.offset) {
          errors.push(`[Çakışma!] ${cur.name} (Bitiş: 0x${curEnd.toString(16)}) ile ${next.name} (Başlangıç: 0x${next.offset.toString(16)}) bellek alanında çakışıyor.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate official binary partition table image (0xC00 / 3072 bytes)
   */
  public static generateBinary(entries: PartitionTableEntry[]): Uint8Array {
    const buffer = new Uint8Array(0xc00); // 3KB table size
    buffer.fill(0xff);
    const view = new DataView(buffer.buffer);

    let offset = 0;
    for (const e of entries) {
      if (offset + 32 > 0xc00) break;

      // Magic word 0x50AA
      view.setUint16(offset + 0, 0x50aa, true);

      // Type
      const typeByte = e.type === "app" ? 0x00 : 0x01;
      view.setUint8(offset + 2, typeByte);

      // Subtype mapping
      let subTypeByte = 0x00;
      if (e.subType === "factory") subTypeByte = 0x00;
      else if (e.subType === "ota_0") subTypeByte = 0x10;
      else if (e.subType === "ota_1") subTypeByte = 0x11;
      else if (e.subType === "otadata") subTypeByte = 0x00;
      else if (e.subType === "nvs") subTypeByte = 0x02;
      else if (e.subType === "phy") subTypeByte = 0x01;
      else if (e.subType === "spiffs" || e.subType === "littlefs") subTypeByte = 0x82;

      view.setUint8(offset + 3, subTypeByte);

      // Offset (4 bytes)
      view.setUint32(offset + 4, e.offset, true);

      // Size (4 bytes)
      view.setUint32(offset + 8, e.size, true);

      // Name (16 bytes, ASCII null-terminated)
      const nameBytes = new TextEncoder().encode(e.name.substring(0, 16));
      buffer.set(nameBytes, offset + 12);

      // Flags (4 bytes)
      view.setUint32(offset + 28, 0x00000000, true);

      offset += 32;
    }

    return buffer;
  }
}
