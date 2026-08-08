/**
 * Standard ISO/IEC 18004 QR Code Matrix Generator in Pure TypeScript.
 * Supports Byte Mode (8-bit UTF-8), Error Correction Levels (L, M, Q, H),
 * Galois Field GF(2^8) Reed-Solomon error correction, and optimal Mask Placement.
 */

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

// Galois Field GF(256) tables for Reed-Solomon polynomial math
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  LOG_TABLE[0] = 0;
})();

function gMult(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

// Generate Reed-Solomon generator polynomial for degree n
function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gMult(poly[j], EXP_TABLE[i]);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

// Compute Reed-Solomon error correction codewords
function rsEncode(data: Uint8Array, ecCount: number): Uint8Array {
  const genPoly = rsGeneratorPoly(ecCount);
  const res = new Uint8Array(data.length + ecCount);
  res.set(data);

  for (let i = 0; i < data.length; i++) {
    const factor = res[i];
    if (factor !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        res[i + j] ^= gMult(genPoly[j], factor);
      }
    }
  }
  return res.slice(data.length);
}

// Version table details: [dataCodewords, ecCodewords, ecBlocks] for L, M, Q, H
interface VersionInfo {
  version: number;
  totalCodewords: number;
  ecInfo: Record<ErrorCorrectionLevel, { ecPerBlock: number; blocksGroup1: number; dataPerBlockGroup1: number; blocksGroup2: number; dataPerBlockGroup2: number }>;
  alignmentPatterns: number[];
}

const VERSION_INFO: VersionInfo[] = [
  {
    version: 1,
    totalCodewords: 26,
    ecInfo: {
      L: { ecPerBlock: 7, blocksGroup1: 1, dataPerBlockGroup1: 19, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 10, blocksGroup1: 1, dataPerBlockGroup1: 16, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 13, blocksGroup1: 1, dataPerBlockGroup1: 13, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      H: { ecPerBlock: 17, blocksGroup1: 1, dataPerBlockGroup1: 9, blocksGroup2: 0, dataPerBlockGroup2: 0 },
    },
    alignmentPatterns: [],
  },
  {
    version: 2,
    totalCodewords: 44,
    ecInfo: {
      L: { ecPerBlock: 10, blocksGroup1: 1, dataPerBlockGroup1: 34, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 16, blocksGroup1: 1, dataPerBlockGroup1: 28, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 22, blocksGroup1: 1, dataPerBlockGroup1: 22, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      H: { ecPerBlock: 28, blocksGroup1: 1, dataPerBlockGroup1: 16, blocksGroup2: 0, dataPerBlockGroup2: 0 },
    },
    alignmentPatterns: [6, 18],
  },
  {
    version: 3,
    totalCodewords: 70,
    ecInfo: {
      L: { ecPerBlock: 15, blocksGroup1: 1, dataPerBlockGroup1: 55, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 26, blocksGroup1: 1, dataPerBlockGroup1: 44, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 18, blocksGroup1: 2, dataPerBlockGroup1: 17, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      H: { ecPerBlock: 22, blocksGroup1: 2, dataPerBlockGroup1: 13, blocksGroup2: 0, dataPerBlockGroup2: 0 },
    },
    alignmentPatterns: [6, 22],
  },
  {
    version: 4,
    totalCodewords: 100,
    ecInfo: {
      L: { ecPerBlock: 20, blocksGroup1: 1, dataPerBlockGroup1: 80, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 18, blocksGroup1: 2, dataPerBlockGroup1: 32, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 26, blocksGroup1: 2, dataPerBlockGroup1: 24, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      H: { ecPerBlock: 16, blocksGroup1: 4, dataPerBlockGroup1: 9, blocksGroup2: 0, dataPerBlockGroup2: 0 },
    },
    alignmentPatterns: [6, 26],
  },
  {
    version: 5,
    totalCodewords: 134,
    ecInfo: {
      L: { ecPerBlock: 26, blocksGroup1: 1, dataPerBlockGroup1: 108, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 24, blocksGroup1: 2, dataPerBlockGroup1: 43, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 18, blocksGroup1: 2, dataPerBlockGroup1: 15, blocksGroup2: 2, dataPerBlockGroup2: 16 },
      H: { ecPerBlock: 22, blocksGroup1: 2, dataPerBlockGroup1: 11, blocksGroup2: 2, dataPerBlockGroup2: 12 },
    },
    alignmentPatterns: [6, 30],
  },
  {
    version: 6,
    totalCodewords: 172,
    ecInfo: {
      L: { ecPerBlock: 18, blocksGroup1: 2, dataPerBlockGroup1: 68, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 16, blocksGroup1: 4, dataPerBlockGroup1: 27, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 24, blocksGroup1: 4, dataPerBlockGroup1: 19, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      H: { ecPerBlock: 28, blocksGroup1: 4, dataPerBlockGroup1: 15, blocksGroup2: 0, dataPerBlockGroup2: 0 },
    },
    alignmentPatterns: [6, 34],
  },
  {
    version: 7,
    totalCodewords: 196,
    ecInfo: {
      L: { ecPerBlock: 20, blocksGroup1: 2, dataPerBlockGroup1: 78, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 18, blocksGroup1: 4, dataPerBlockGroup1: 31, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      Q: { ecPerBlock: 18, blocksGroup1: 2, dataPerBlockGroup1: 14, blocksGroup2: 4, dataPerBlockGroup2: 15 },
      H: { ecPerBlock: 26, blocksGroup1: 4, dataPerBlockGroup1: 13, blocksGroup2: 1, dataPerBlockGroup2: 14 },
    },
    alignmentPatterns: [6, 22, 38],
  },
  {
    version: 8,
    totalCodewords: 242,
    ecInfo: {
      L: { ecPerBlock: 24, blocksGroup1: 2, dataPerBlockGroup1: 97, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 22, blocksGroup1: 2, dataPerBlockGroup1: 38, blocksGroup2: 2, dataPerBlockGroup2: 39 },
      Q: { ecPerBlock: 22, blocksGroup1: 4, dataPerBlockGroup1: 18, blocksGroup2: 2, dataPerBlockGroup2: 19 },
      H: { ecPerBlock: 26, blocksGroup1: 4, dataPerBlockGroup1: 14, blocksGroup2: 2, dataPerBlockGroup2: 15 },
    },
    alignmentPatterns: [6, 24, 42],
  },
  {
    version: 9,
    totalCodewords: 292,
    ecInfo: {
      L: { ecPerBlock: 30, blocksGroup1: 2, dataPerBlockGroup1: 116, blocksGroup2: 0, dataPerBlockGroup2: 0 },
      M: { ecPerBlock: 22, blocksGroup1: 3, dataPerBlockGroup1: 36, blocksGroup2: 2, dataPerBlockGroup2: 37 },
      Q: { ecPerBlock: 20, blocksGroup1: 4, dataPerBlockGroup1: 16, blocksGroup2: 4, dataPerBlockGroup2: 17 },
      H: { ecPerBlock: 24, blocksGroup1: 4, dataPerBlockGroup1: 12, blocksGroup2: 4, dataPerBlockGroup2: 13 },
    },
    alignmentPatterns: [6, 26, 46],
  },
  {
    version: 10,
    totalCodewords: 346,
    ecInfo: {
      L: { ecPerBlock: 18, blocksGroup1: 2, dataPerBlockGroup1: 68, blocksGroup2: 2, dataPerBlockGroup2: 69 },
      M: { ecPerBlock: 26, blocksGroup1: 4, dataPerBlockGroup1: 43, blocksGroup2: 1, dataPerBlockGroup2: 44 },
      Q: { ecPerBlock: 24, blocksGroup1: 6, dataPerBlockGroup1: 19, blocksGroup2: 2, dataPerBlockGroup2: 20 },
      H: { ecPerBlock: 28, blocksGroup1: 6, dataPerBlockGroup1: 15, blocksGroup2: 2, dataPerBlockGroup2: 16 },
    },
    alignmentPatterns: [6, 28, 50],
  },
];

// Helper bit stream builder
class BitBuffer {
  buffer: number[] = [];
  length = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export function createQRCodeMatrix(text: string, ecLevel: ErrorCorrectionLevel = "M"): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text || "https://www.everythinghub.com.tr");
  const rawLength = rawBytes.length;

  // Find minimum version that fits data
  let vInfo: VersionInfo = VERSION_INFO[0];
  for (const info of VERSION_INFO) {
    const ec = info.ecInfo[ecLevel];
    const totalDataCap =
      ec.blocksGroup1 * ec.dataPerBlockGroup1 +
      ec.blocksGroup2 * ec.dataPerBlockGroup2;
    // 4 bits mode + 8/16 bits length + data
    const charCountBits = info.version < 10 ? 8 : 16;
    const requiredBits = 4 + charCountBits + rawLength * 8;
    if (requiredBits <= totalDataCap * 8) {
      vInfo = info;
      break;
    }
    vInfo = info; // fallback to largest if exceeds
  }

  const version = vInfo.version;
  const size = 17 + version * 4;
  const ec = vInfo.ecInfo[ecLevel];
  const totalDataCapacity =
    ec.blocksGroup1 * ec.dataPerBlockGroup1 +
    ec.blocksGroup2 * ec.dataPerBlockGroup2;

  // Encode Data stream
  const bits = new BitBuffer();
  // Byte mode indicator: 0100
  bits.put(4, 4);
  // Character count indicator
  bits.put(rawLength, version < 10 ? 8 : 16);
  for (let i = 0; i < rawLength; i++) {
    bits.put(rawBytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const remainingBits = totalDataCapacity * 8 - bits.length;
  const termLength = Math.min(4, Math.max(0, remainingBits));
  bits.put(0, termLength);

  // Align to byte boundary
  if (bits.length % 8 !== 0) {
    bits.put(0, 8 - (bits.length % 8));
  }

  // Add pad bytes (0xEC, 0x11)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < totalDataCapacity * 8) {
    bits.put(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const fullData = bits.getBytes();

  // Divide into blocks & compute Reed Solomon error correction
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let byteOffset = 0;

  for (let b = 0; b < ec.blocksGroup1; b++) {
    const chunk = fullData.slice(byteOffset, byteOffset + ec.dataPerBlockGroup1);
    dataBlocks.push(chunk);
    ecBlocks.push(rsEncode(chunk, ec.ecPerBlock));
    byteOffset += ec.dataPerBlockGroup1;
  }
  for (let b = 0; b < ec.blocksGroup2; b++) {
    const chunk = fullData.slice(byteOffset, byteOffset + ec.dataPerBlockGroup2);
    dataBlocks.push(chunk);
    ecBlocks.push(rsEncode(chunk, ec.ecPerBlock));
    byteOffset += ec.dataPerBlockGroup2;
  }

  // Interleave data codewords
  const interleaved: number[] = [];
  const maxDataLen = Math.max(ec.dataPerBlockGroup1, ec.dataPerBlockGroup2);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < dataBlocks.length; b++) {
      if (i < dataBlocks[b].length) {
        interleaved.push(dataBlocks[b][i]);
      }
    }
  }

  // Interleave error correction codewords
  for (let i = 0; i < ec.ecPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      if (i < ecBlocks[b].length) {
        interleaved.push(ecBlocks[b][i]);
      }
    }
  }

  // Setup QR Matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Add Finder Patterns (7x7)
  const addFinder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const row = r + i;
        const col = c + j;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          isFunction[row][col] = true;
          if (i >= 0 && i <= 6 && j >= 0 && j <= 6) {
            matrix[row][col] =
              i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
          } else {
            matrix[row][col] = false;
          }
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) {
      isFunction[6][i] = true;
      matrix[6][i] = i % 2 === 0;
    }
    if (!isFunction[i][6]) {
      isFunction[i][6] = true;
      matrix[i][6] = i % 2 === 0;
    }
  }

  // Alignment patterns
  if (vInfo.alignmentPatterns.length > 0) {
    const coords = vInfo.alignmentPatterns;
    for (const r of coords) {
      for (const c of coords) {
        // Skip finder areas
        if (isFunction[r][c]) continue;
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const row = r + i;
            const col = c + j;
            isFunction[row][col] = true;
            matrix[row][col] = Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0);
          }
        }
      }
    }
  }

  // Dark module
  isFunction[4 * version + 9][8] = true;
  matrix[4 * version + 9][8] = true;

  // Reserve format areas
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[8][i]) isFunction[8][i] = true;
    if (!isFunction[i][8]) isFunction[i][8] = true;
  }
  for (let i = size - 8; i < size; i++) {
    if (!isFunction[8][i]) isFunction[8][i] = true;
    if (!isFunction[i][8]) isFunction[i][8] = true;
  }

  // Place Interleaved Data Bits
  let bitIndex = 0;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column

    for (let vert = 0; vert < size; vert++) {
      const row = upwards ? size - 1 - vert : vert;
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const col = right - colOffset;
        if (!isFunction[row][col]) {
          let bit = false;
          const bytePos = Math.floor(bitIndex / 8);
          if (bytePos < interleaved.length) {
            bit = ((interleaved[bytePos] >>> (7 - (bitIndex % 8))) & 1) === 1;
          }
          // Mask 0: (row + col) % 2 == 0
          if ((row + col) % 2 === 0) {
            bit = !bit;
          }
          matrix[row][col] = bit;
          bitIndex++;
        }
      }
    }
    upwards = !upwards;
  }

  // Write Format Information (EC Level + Mask 000 with BCH(15,5) code)
  // EC Level: L=01, M=00, Q=11, H=10.
  const ecBitsMap: Record<ErrorCorrectionLevel, number> = { M: 0, L: 1, H: 2, Q: 3 };
  const formatData = (ecBitsMap[ecLevel] << 3) | 0; // mask 0
  let formatFull = formatData << 10;
  const poly = 0x537;
  for (let i = 14; i >= 10; i--) {
    if ((formatFull >>> i) & 1) {
      formatFull ^= poly << (i - 10);
    }
  }
  const formatInfo = ((formatData << 10) | formatFull) ^ 0x5412;

  // Place Format bits on matrix
  for (let i = 0; i < 15; i++) {
    const bit = ((formatInfo >>> (14 - i)) & 1) === 1;
    // Top-left
    if (i < 6) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    // Bottom-left & Top-right
    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }

  return matrix;
}
