/**
 * aegisFlasher ANSI Escape Sequence Parser
 * High-performance terminal color & formatting tokenizer for Web Serial console
 */

export interface AnsiToken {
  text: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const ANSI_COLOR_MAP_16: Record<number, string> = {
  30: "#18181b", // Black
  31: "#f87171", // Red
  32: "#4ade80", // Green
  33: "#facc15", // Yellow
  34: "#60a5fa", // Blue
  35: "#c084fc", // Magenta / Purple
  36: "#22d3ee", // Cyan
  37: "#f4f4f5", // White
  90: "#71717a", // Bright Black / Gray
  91: "#ef4444", // Bright Red
  92: "#22c55e", // Bright Green
  93: "#eab308", // Bright Yellow
  94: "#3b82f6", // Bright Blue
  95: "#a855f7", // Bright Magenta
  96: "#06b6d4", // Bright Cyan
  97: "#ffffff", // Bright White
};

const ANSI_BG_MAP_16: Record<number, string> = {
  40: "rgba(0,0,0,0.5)",
  41: "rgba(239,68,68,0.2)",
  42: "rgba(34,197,94,0.2)",
  43: "rgba(234,179,8,0.2)",
  44: "rgba(59,130,246,0.2)",
  45: "rgba(168,85,247,0.2)",
  46: "rgba(6,182,212,0.2)",
  47: "rgba(244,244,245,0.2)",
  100: "rgba(113,113,122,0.3)",
  101: "rgba(239,68,68,0.3)",
  102: "rgba(34,197,94,0.3)",
  103: "rgba(234,179,8,0.3)",
  104: "rgba(59,130,246,0.3)",
  105: "rgba(168,85,247,0.3)",
  106: "rgba(6,182,212,0.3)",
  107: "rgba(255,255,255,0.3)",
};

export function parseAnsiString(rawText: string): AnsiToken[] {
  if (!rawText) return [];

  // Match ANSI escape codes: \x1b[...m or \u001b[...m
  const regex = /(?:\x1b|\u001b)\[([\d;]*)m/g;
  const tokens: AnsiToken[] = [];

  let lastIndex = 0;
  let currentColor: string | undefined = undefined;
  let currentBg: string | undefined = undefined;
  let isBold = false;
  let isDim = false;
  let isItalic = false;
  let isUnderline = false;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    const textChunk = rawText.slice(lastIndex, match.index);
    if (textChunk.length > 0) {
      tokens.push({
        text: textChunk,
        color: currentColor,
        backgroundColor: currentBg,
        bold: isBold,
        dim: isDim,
        italic: isItalic,
        underline: isUnderline,
      });
    }

    const codeString = match[1] || "0";
    const codes = codeString.split(";").map((c) => parseInt(c, 10) || 0);

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];

      if (code === 0) {
        // Reset all
        currentColor = undefined;
        currentBg = undefined;
        isBold = false;
        isDim = false;
        isItalic = false;
        isUnderline = false;
      } else if (code === 1) {
        isBold = true;
      } else if (code === 2) {
        isDim = true;
      } else if (code === 3) {
        isItalic = true;
      } else if (code === 4) {
        isUnderline = true;
      } else if (code === 22) {
        isBold = false;
        isDim = false;
      } else if (code === 23) {
        isItalic = false;
      } else if (code === 24) {
        isUnderline = false;
      } else if (code === 39) {
        currentColor = undefined;
      } else if (code === 49) {
        currentBg = undefined;
      } else if (ANSI_COLOR_MAP_16[code]) {
        currentColor = ANSI_COLOR_MAP_16[code];
      } else if (ANSI_BG_MAP_16[code]) {
        currentBg = ANSI_BG_MAP_16[code];
      } else if (code === 38 && codes[i + 1] === 5 && codes[i + 2] !== undefined) {
        // 256 color foreground: \x1b[38;5;Nm
        const colorIndex = codes[i + 2];
        currentColor = get256Color(colorIndex);
        i += 2;
      } else if (code === 48 && codes[i + 1] === 5 && codes[i + 2] !== undefined) {
        // 256 color background: \x1b[48;5;Nm
        const colorIndex = codes[i + 2];
        currentBg = get256Color(colorIndex);
        i += 2;
      } else if (code === 38 && codes[i + 1] === 2 && codes[i + 4] !== undefined) {
        // 24-bit TrueColor: \x1b[38;2;R;G;Bm
        currentColor = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
        i += 4;
      } else if (code === 48 && codes[i + 1] === 2 && codes[i + 4] !== undefined) {
        // 24-bit TrueColor background: \x1b[48;2;R;G;Bm
        currentBg = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
        i += 4;
      }
    }

    lastIndex = regex.lastIndex;
  }

  // Trailing text chunk
  if (lastIndex < rawText.length) {
    const trailingChunk = rawText.slice(lastIndex);
    if (trailingChunk.length > 0) {
      tokens.push({
        text: trailingChunk,
        color: currentColor,
        backgroundColor: currentBg,
        bold: isBold,
        dim: isDim,
        italic: isItalic,
        underline: isUnderline,
      });
    }
  }

  return tokens;
}

function get256Color(index: number): string {
  if (index < 16) {
    const stdMap = [
      "#000000", "#cd0000", "#00cd00", "#cdcd00", "#0000ee", "#cd00cd", "#00cdcd", "#e5e5e5",
      "#7f7f7f", "#ff0000", "#00ff00", "#ffff00", "#5c5cff", "#ff00ff", "#00ffff", "#ffffff"
    ];
    return stdMap[index] || "#ffffff";
  }
  if (index >= 232 && index <= 255) {
    const gray = Math.round(((index - 232) / 23) * 255);
    return `rgb(${gray}, ${gray}, ${gray})`;
  }
  // 6x6x6 color cube
  const colorIndex = index - 16;
  const r = Math.floor(colorIndex / 36);
  const g = Math.floor((colorIndex % 36) / 6);
  const b = colorIndex % 6;
  const conv = (v: number) => (v === 0 ? 0 : 55 + v * 40);
  return `rgb(${conv(r)}, ${conv(g)}, ${conv(b)})`;
}
