/**
 * aegisFlasher RP2040 / Raspberry Pi Pico UF2 Generator & Parser
 * Converts raw binary to UF2 format and triggers USB Mass Storage bootloader
 */

const UF2_MAGIC_START0 = 0x0a324655;
const UF2_MAGIC_START1 = 0x9e5d5157;
const UF2_MAGIC_END = 0x0ab16f30;
export const RP2040_FAMILY_ID = 0xe48bff56;
export const RP2040_FLASH_BASE = 0x10000000;

export class Uf2Engine {
  /**
   * Check if a buffer is a valid UF2 file
   */
  public static isUf2(buffer: Uint8Array): boolean {
    if (buffer.length < 512) return false;
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const magic0 = view.getUint32(0, true);
    const magic1 = view.getUint32(4, true);
    const magicEnd = view.getUint32(508, true);
    return magic0 === UF2_MAGIC_START0 && magic1 === UF2_MAGIC_START1 && magicEnd === UF2_MAGIC_END;
  }

  /**
   * Convert raw binary data into RP2040 / Pico compatible UF2 format
   */
  public static convertBinToUf2(
    binData: Uint8Array,
    targetAddress: number = RP2040_FLASH_BASE,
    familyId: number = RP2040_FAMILY_ID
  ): Uint8Array {
    const numBlocks = Math.ceil(binData.length / 256);
    const uf2Buffer = new Uint8Array(numBlocks * 512);
    const dataView = new DataView(uf2Buffer.buffer);

    for (let i = 0; i < numBlocks; i++) {
      const blockOffset = i * 512;
      const binOffset = i * 256;
      const chunkBytes = Math.min(256, binData.length - binOffset);

      // Header
      dataView.setUint32(blockOffset + 0, UF2_MAGIC_START0, true);
      dataView.setUint32(blockOffset + 4, UF2_MAGIC_START1, true);
      dataView.setUint32(blockOffset + 8, 0x00002000, true); // Flag: familyID present
      dataView.setUint32(blockOffset + 12, targetAddress + binOffset, true); // Target flash address
      dataView.setUint32(blockOffset + 16, 256, true); // Payload size
      dataView.setUint32(blockOffset + 20, i, true); // Block sequence index
      dataView.setUint32(blockOffset + 24, numBlocks, true); // Total blocks
      dataView.setUint32(blockOffset + 28, familyId, true); // Family ID

      // Payload (256 bytes)
      uf2Buffer.set(binData.subarray(binOffset, binOffset + chunkBytes), blockOffset + 32);

      // Footer
      dataView.setUint32(blockOffset + 508, UF2_MAGIC_END, true);
    }

    return uf2Buffer;
  }

  /**
   * Extract raw binary data from UF2 container
   */
  public static extractBinFromUf2(uf2Buffer: Uint8Array): Uint8Array {
    if (!this.isUf2(uf2Buffer)) {
      throw new Error("Geçersiz UF2 dosyası.");
    }

    const numBlocks = Math.floor(uf2Buffer.length / 512);
    const view = new DataView(uf2Buffer.buffer, uf2Buffer.byteOffset, uf2Buffer.byteLength);
    const chunks: { address: number; data: Uint8Array }[] = [];
    let minAddr = Infinity;
    let maxAddr = 0;

    for (let i = 0; i < numBlocks; i++) {
      const blockOffset = i * 512;
      const targetAddr = view.getUint32(blockOffset + 12, true);
      const payloadSize = view.getUint32(blockOffset + 16, true);
      const payload = uf2Buffer.subarray(blockOffset + 32, blockOffset + 32 + payloadSize);

      chunks.push({ address: targetAddr, data: payload });
      if (targetAddr < minAddr) minAddr = targetAddr;
      if (targetAddr + payloadSize > maxAddr) maxAddr = targetAddr + payloadSize;
    }

    const totalLength = maxAddr - minAddr;
    const flat = new Uint8Array(totalLength);
    flat.fill(0xff);

    for (const chunk of chunks) {
      flat.set(chunk.data, chunk.address - minAddr);
    }

    return flat;
  }

  /**
   * Trigger RP2040 into Bootloader Mode via 1200 bps CDC touch
   */
  public static async triggerPicoBootloader(port: any): Promise<void> {
    try {
      await port.open({ baudRate: 1200 });
      await new Promise((r) => setTimeout(r, 200));
      await port.close();
    } catch (err: any) {
      console.warn("Pico 1200bps touch error:", err);
    }
  }
}
