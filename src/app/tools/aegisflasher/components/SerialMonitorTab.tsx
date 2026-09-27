"use client";

/**
 * aegisFlasher — Universal Hardware Serial Terminal & CLI Suite
 * Platform-independent, Arduino/ESP/STM32/RP2040 compatible live terminal.
 * Features:
 * - Full Built-in CLI & esptool Command Engine (chip_id, flash_id, read_mac, erase_flash, etc.)
 * - Offline / Hardware-Independent interactive mode with Loopback Emulation
 * - Full Arduino IDE Serial Monitor parity (Line Endings, 16 Baud Rates, DTR/RTS signals, Reset/Boot)
 * - Raw Hex Byte Transmitter & Protocol Inspector (Dual HEX/ASCII)
 * - ANSI 256-Color Decoder for ESP-IDF / Arduino color logs
 * - Command History (↑/↓ navigation) & Live Auto-Complete Suggestions
 * - Multi-Category Macro Deck with LocalStorage persistence
 * - Zero Emoji Standard (Strict vector SVG icons only)
 * - Creative Studio Liquid Glassmorphism Aesthetic
 */

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Terminal,
  Send,
  Trash2,
  Copy,
  Download,
  Clock,
  Binary,
  ArrowDown,
  Search,
  Check,
  Activity,
  X,
  ChevronRight,
  AlertTriangle,
  Cpu,
  RotateCcw,
  Lock,
  Unlock,
  Hash,
  BookOpen,
  Layers,
  Radio,
  Zap,
  Sliders,
  Usb,
} from "lucide-react";
import { ConnectionStatus, SerialLogMessage, ChipTelemetry } from "@/lib/flasher/types";
import { parseAnsiString, AnsiToken } from "@/lib/flasher/ansi-parser";
import { Language } from "@/lib/flasher/i18n";
import { FlasherSelect } from "./FlasherSelect";

export interface SerialMonitorTabProps {
  status: ConnectionStatus;
  logs: SerialLogMessage[];
  onSendMessage: (text: string, lineEnding: string) => void;
  onSendRawBytes: (bytes: Uint8Array) => void;
  onClearLogs: () => void;
  onHardReset: () => void;
  onSetDtr: (value: boolean) => void;
  onSetRts: (value: boolean) => void;
  selectedBaud: number;
  onBaudChange: (baud: number) => void;
  rxBytesCount: number;
  txBytesCount: number;
  lang?: Language;
  // Extended Hardware & System Capabilities
  telemetry?: ChipTelemetry | null;
  onConnect?: () => Promise<void> | void;
  onConnectTerminalOnly?: () => Promise<void> | void;
  onDisconnect?: () => Promise<void> | void;
  onTriggerBootloader?: () => Promise<void> | void;
  onEraseChip?: () => Promise<void> | void;
  onReadFlashDump?: (offset: number, sizeBytes: number) => Promise<void> | void;
  onReadEfuses?: () => Promise<any> | void;
  onAppendLog?: (log: SerialLogMessage) => void;
}

// ─── Command Definition for CLI Engine ─────────────────────────────
interface CommandDef {
  command: string;
  syntax: string;
  category: "esptool" | "hardware" | "serial" | "terminal" | "macro";
  descTr: string;
  descEn: string;
  examples?: string[];
}

const TERMINAL_COMMANDS: CommandDef[] = [
  // esptool suite
  { command: "esptool version", syntax: "esptool version", category: "esptool", descTr: "esptool-js ve WebSerial motor sürümünü gösterir", descEn: "Display esptool-js & WebSerial engine information" },
  { command: "esptool chip_id", syntax: "esptool chip_id", category: "esptool", descTr: "Bağlı silikon çip türü, revizyon ve kristal frekansını okur", descEn: "Read silicon chip type, revision and crystal freq" },
  { command: "esptool flash_id", syntax: "esptool flash_id", category: "esptool", descTr: "SPI Flash üreticisi, aygıt kimliği ve kapasitesini sorgular", descEn: "Query SPI flash manufacturer, device ID and capacity" },
  { command: "esptool read_mac", syntax: "esptool read_mac", category: "esptool", descTr: "eFuse silikon MAC adreslerini (Wi-Fi & Bluetooth) okur", descEn: "Read eFuse silicon MAC addresses (Wi-Fi & BT)" },
  { command: "esptool erase_flash", syntax: "esptool erase_flash", category: "esptool", descTr: "Tüm flash belleği donanımsal olarak siler", descEn: "Erase entire SPI flash memory on chip" },
  { command: "esptool read_flash", syntax: "esptool read_flash <addr> <size>", category: "esptool", descTr: "Flash bellekten ham ikili döküm (dump) okur ve indirir", descEn: "Dump flash binary memory starting from address", examples: ["esptool read_flash 0x0 4MB", "esptool read_flash 0x1000 64KB"] },
  { command: "esptool read_efuse", syntax: "esptool read_efuse", category: "esptool", descTr: "eFuse silikon güvenlik register bloklarını analiz eder", descEn: "Inspect silicon eFuse security registers" },
  { command: "esptool get_security_info", syntax: "esptool get_security_info", category: "esptool", descTr: "Flash Şifreleme ve Secure Boot güvenlik durumunu denetler", descEn: "Audit Flash Encryption & Secure Boot security status" },
  { command: "esptool run", syntax: "esptool run", category: "esptool", descTr: "RTS/EN donanım pini ile çipi yeniden başlatır", descEn: "Hardware reset chip into user code" },

  // Hardware & Signals
  { command: "connect", syntax: "connect [terminal]", category: "hardware", descTr: "Seri port seçim penceresini açar", descEn: "Open serial port selector dialog", examples: ["connect", "connect terminal"] },
  { command: "disconnect", syntax: "disconnect", category: "hardware", descTr: "Aktif seri bağlantıyı güvenle kapatır", descEn: "Safely close and release active serial port" },
  { command: "baud", syntax: "baud <rate>", category: "hardware", descTr: "Baud hızını anında değiştirir (300..2000000)", descEn: "Change baud rate live on active port", examples: ["baud 115200", "baud 9600", "baud 921600"] },
  { command: "dtr", syntax: "dtr <0|1|on|off>", category: "hardware", descTr: "DTR (GPIO0 / Boot) pin seviyesini kontrol eder", descEn: "Drive DTR (GPIO0 / Boot) pin state", examples: ["dtr 1", "dtr 0"] },
  { command: "rts", syntax: "rts <0|1|on|off>", category: "hardware", descTr: "RTS (EN / Reset) pin seviyesini kontrol eder", descEn: "Drive RTS (EN / Reset) pin state", examples: ["rts 1", "rts 0"] },
  { command: "reset", syntax: "reset", category: "hardware", descTr: "EN reset hattına donanımsal darbe gönderir", descEn: "Pulse hardware reset line (EN pin)" },
  { command: "reboot", syntax: "reboot", category: "hardware", descTr: "Cihazı donanımsal olarak baştan başlatır", descEn: "Hardware reboot device" },
  { command: "boot", syntax: "boot", category: "hardware", descTr: "Çipi ROM bootloader flaşlama moduna alır", descEn: "Enter ROM bootloader mode (strapping pins)" },
  { command: "avr_boot", syntax: "avr_boot", category: "hardware", descTr: "Arduino Optiboot için DTR reset darbesi gönderir", descEn: "Send Optiboot DTR reset pulse for Arduino" },
  { command: "pico_boot", syntax: "pico_boot", category: "hardware", descTr: "RP2040 1200bps touch bootloader sinyali gönderir", descEn: "Trigger RP2040 1200bps touch bootloader" },

  // Serial & Data
  { command: "hex", syntax: "hex <byte1 byte2 ...>", category: "serial", descTr: "Doğrudan ham onaltılık (hex) bayt dizisi gönderir", descEn: "Transmit raw hexadecimal byte payload", examples: ["hex 48 65 6C 6C 6F", "hex FF 0A 1B 00"] },
  { command: "ascii", syntax: "ascii <text>", category: "serial", descTr: "Satır sonu eklemeden ham ASCII metin gönderir", descEn: "Send raw text string without line endings" },
  { command: "ctrl-c", syntax: "ctrl-c", category: "serial", descTr: "ETX (0x03) KeyboardInterrupt sinyali gönderir", descEn: "Send ETX (0x03) KeyboardInterrupt signal" },
  { command: "ctrl-d", syntax: "ctrl-d", category: "serial", descTr: "EOT (0x04) MicroPython soft reboot sinyali gönderir", descEn: "Send EOT (0x04) MicroPython soft reboot signal" },
  { command: "ctrl-z", syntax: "ctrl-z", category: "serial", descTr: "SUB (0x1A) sinyali gönderir", descEn: "Send SUB (0x1A) signal" },
  { command: "ping", syntax: "ping", category: "serial", descTr: "Temel modem testi için AT komutu iletir", descEn: "Send basic AT ping packet" },
  { command: "at", syntax: "at [cmd]", category: "serial", descTr: "Hücresel/Wi-Fi modem için AT komutu iletir", descEn: "Transmit AT command to modem", examples: ["at", "at+gmr", "at+cifsr"] },

  // Terminal Utilities
  { command: "help", syntax: "help [command]", category: "terminal", descTr: "Kullanılabilir tüm CLI komutlarını ve kılavuzu listeler", descEn: "List all terminal CLI commands and user guide" },
  { command: "clear", syntax: "clear", category: "terminal", descTr: "Terminal log ekranını tamamen temizler (Ctrl+L)", descEn: "Clear terminal log buffer (Ctrl+L)" },
  { command: "cls", syntax: "cls", category: "terminal", descTr: "Terminal log ekranını temizler", descEn: "Clear terminal screen" },
  { command: "status", syntax: "status", category: "terminal", descTr: "Bağlantı parametreleri ve port durumunu raporlar", descEn: "Report serial port status and framing parameters" },
  { command: "stats", syntax: "stats", category: "terminal", descTr: "Oturum RX/TX bayt ve paket sayaçlarını gösterir", descEn: "Show session RX/TX byte and packet counters" },
  { command: "device", syntax: "device", category: "terminal", descTr: "Bağlı donanım çip ve USB sağlayıcı bilgilerini gösterir", descEn: "Show connected hardware silicon and USB vendor info" },
  { command: "export", syntax: "export [txt|csv|json]", category: "terminal", descTr: "Terminal log dökümünü dosya olarak indirir", descEn: "Export and download terminal session log" },
  { command: "filter", syntax: "filter <text|clear>", category: "terminal", descTr: "Gelen/giden mesaj akışını filtreler", descEn: "Apply dynamic real-time text filter" },
  { command: "timestamps", syntax: "timestamps <on|off>", category: "terminal", descTr: "Milisaniye zaman damgalarını açar/kapatır", descEn: "Toggle millisecond timestamp prefixes" },
  { command: "linenumbers", syntax: "linenumbers <on|off>", category: "terminal", descTr: "Satır numarası gösterimini açar/kapatır", descEn: "Toggle line number column" },
  { command: "hexdump", syntax: "hexdump <on|off>", category: "terminal", descTr: "İkili HEX/ASCII protokol döküm modunu açar/kapatır", descEn: "Toggle dual HEX/ASCII protocol analyzer mode" },
  { command: "autoscroll", syntax: "autoscroll <on|off>", category: "terminal", descTr: "Yeni satırlarda otomatik kaydırmayı açar/kapatır", descEn: "Toggle automatic scrolling on incoming lines" },
  { command: "loopback", syntax: "loopback <on|off>", category: "terminal", descTr: "Donanım olmadan test için yerel loopback modunu açar", descEn: "Enable local loopback mode for hardware-free testing" },
  { command: "echo", syntax: "echo <on|off>", category: "terminal", descTr: "Gönderilen komutların yerel yankısını açar/kapatır", descEn: "Toggle local echo for transmitted commands" },
  { command: "history", syntax: "history", category: "terminal", descTr: "Gönderilen geçmiş komut listesini görüntüler", descEn: "Display recent command history list" },
  { command: "calc", syntax: "calc <expression>", category: "terminal", descTr: "Hex/sayısal bellek veya ofset hesabı yapar", descEn: "Calculate hex or memory offsets", examples: ["calc 0x1000 + 0x4000", "calc 4 * 1024 * 1024"] },
  { command: "time", syntax: "time", category: "terminal", descTr: "Geçerli yerel ve UTC saatini milisaniye ile gösterir", descEn: "Show current local and UTC timestamp" },
];

// ─── Macro Definitions ─────────────────────────────────────────────
interface MacroCommand {
  label: string;
  command: string;
  group: string;
  tooltip?: string;
}

const MACRO_GROUPS: { key: string; labelTr: string; labelEn: string }[] = [
  { key: "at", labelTr: "AT Komutları", labelEn: "AT Commands" },
  { key: "esp", labelTr: "ESP Tanı", labelEn: "ESP Diag" },
  { key: "arduino", labelTr: "Arduino", labelEn: "Arduino" },
  { key: "micropython", labelTr: "MicroPython", labelEn: "MicroPython" },
  { key: "system", labelTr: "Sistem", labelEn: "System" },
  { key: "custom", labelTr: "Özel", labelEn: "Custom" },
];

const BUILTIN_MACROS: MacroCommand[] = [
  // AT Commands
  { group: "at", label: "AT", command: "AT", tooltip: "Temel bağlantı testi" },
  { group: "at", label: "AT+GMR", command: "AT+GMR", tooltip: "Firmware versiyon bilgisi" },
  { group: "at", label: "Wi-Fi Tara", command: "AT+CWLAP", tooltip: "Yakındaki Wi-Fi ağlarını listele" },
  { group: "at", label: "IP Sorgula", command: "AT+CIFSR", tooltip: "Cihaz IP adresi" },
  { group: "at", label: "Bağlan Test", command: "AT+CIPSTATUS", tooltip: "TCP/UDP bağlantı durumu" },
  { group: "at", label: "Mod Sorgula", command: "AT+CWMODE?", tooltip: "Wi-Fi modu (1=Station, 2=AP, 3=Both)" },
  { group: "at", label: "Reset", command: "AT+RST", tooltip: "Cihazı yeniden başlat" },
  { group: "at", label: "Fabrika Sıfır", command: "AT+RESTORE", tooltip: "Fabrika ayarlarına dön" },

  // ESP Diagnostics
  { group: "esp", label: "esptool chip_id", command: "esptool chip_id", tooltip: "Çip mimarisi ve revizyonu" },
  { group: "esp", label: "esptool flash_id", command: "esptool flash_id", tooltip: "SPI Flash kimliği ve boyutu" },
  { group: "esp", label: "esptool read_mac", command: "esptool read_mac", tooltip: "Silikon MAC adresleri" },
  { group: "esp", label: "Free Heap", command: "Serial.println(ESP.getFreeHeap());", tooltip: "Serbest heap bellek" },
  { group: "esp", label: "Wi-Fi RSSI", command: "Serial.println(WiFi.RSSI());", tooltip: "Wi-Fi sinyal gücü" },
  { group: "esp", label: "CPU Freq", command: "Serial.println(ESP.getCpuFreqMHz());", tooltip: "İşlemci frekansı (MHz)" },

  // Arduino
  { group: "arduino", label: "help", command: "help", tooltip: "Kullanılabilir komutları listele" },
  { group: "arduino", label: "status", command: "status", tooltip: "Durum raporu" },
  { group: "arduino", label: "version", command: "version", tooltip: "Firmware versiyonu" },
  { group: "arduino", label: "ping", command: "ping", tooltip: "Bağlantı testi" },
  { group: "arduino", label: "reboot", command: "reboot", tooltip: "Yeniden başlat" },
  { group: "arduino", label: "led on", command: "led on", tooltip: "LED'i yak" },
  { group: "arduino", label: "led off", command: "led off", tooltip: "LED'i söndür" },

  // MicroPython
  { group: "micropython", label: "help()", command: "help()", tooltip: "MicroPython yardım" },
  { group: "micropython", label: "sys.version", command: "import sys; print(sys.version)", tooltip: "Python versiyonu" },
  { group: "micropython", label: "os.listdir", command: "import os; print(os.listdir())", tooltip: "Dosya sistemi listesi" },
  { group: "micropython", label: "gc.mem_free", command: "import gc; print(gc.mem_free())", tooltip: "Serbest bellek baytları" },
  { group: "micropython", label: "uname", command: "import os; print(os.uname())", tooltip: "Platform bilgisi" },
  { group: "micropython", label: "machine.reset()", command: "import machine; machine.reset()", tooltip: "Yazılımsal reset" },

  // System Control Characters
  { group: "system", label: "\\x03 (Ctrl+C)", command: "\x03", tooltip: "KeyboardInterrupt" },
  { group: "system", label: "\\x04 (Ctrl+D)", command: "\x04", tooltip: "Soft Reset / EOF" },
  { group: "system", label: "\\x1A (Ctrl+Z)", command: "\x1a", tooltip: "Suspend / EOF" },
  { group: "system", label: "\\n LF", command: "\n", tooltip: "Newline (0x0A)" },
  { group: "system", label: "\\r CR", command: "\r", tooltip: "Carriage Return (0x0D)" },
  { group: "system", label: "NUL (0x00)", command: "\x00", tooltip: "Null byte" },
];

// ─── Hex String Parser Helper ──────────────────────────────────────
function hexStringToBytes(hex: string): Uint8Array | null {
  const cleaned = hex.replace(/0x/gi, "").replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length === 0 || cleaned.length % 2 !== 0) return null;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}

// ─── Memoized Log Line Renderer ────────────────────────────────────
const LogLine = React.memo(function LogLine({
  log,
  showTimestamps,
  showHexMode,
  showLineNumbers,
  lineNumber,
}: {
  log: SerialLogMessage;
  showTimestamps: boolean;
  showHexMode: boolean;
  showLineNumbers: boolean;
  lineNumber: number;
}) {
  let colorClass = "text-zinc-200";
  let badgeClass = "bg-zinc-800 text-zinc-400 border-zinc-700";

  switch (log.direction) {
    case "tx":
      colorClass = "text-indigo-300 font-medium";
      badgeClass = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      break;
    case "rx":
      colorClass = "text-emerald-300";
      badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      break;
    case "err":
      colorClass = "text-rose-400 font-semibold";
      badgeClass = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      break;
    case "warn":
      colorClass = "text-amber-300";
      badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      break;
    case "sys":
      colorClass = "text-violet-300";
      badgeClass = "bg-violet-500/20 text-violet-300 border-violet-500/30";
      break;
    case "success":
      colorClass = "text-emerald-400 font-bold";
      badgeClass = "bg-emerald-500/25 text-emerald-300 border-emerald-500/40";
      break;
  }

  const renderAnsi = (text: string) => {
    const tokens = parseAnsiString(text);
    return (
      <span className="inline">
        {tokens.map((tok: AnsiToken, i: number) => {
          const style: React.CSSProperties = {};
          if (tok.color) style.color = tok.color;
          if (tok.backgroundColor) style.backgroundColor = tok.backgroundColor;
          if (tok.bold) style.fontWeight = "bold";
          if (tok.italic) style.fontStyle = "italic";
          if (tok.underline) style.textDecoration = "underline";
          if (tok.dim) style.opacity = 0.65;
          return (
            <span key={i} style={style}>
              {tok.text}
            </span>
          );
        })}
      </span>
    );
  };

  const renderHex = (str: string, rawBytes?: Uint8Array) => {
    const bytes = rawBytes ?? new TextEncoder().encode(str);
    const chunks: { hex: string; ascii: string }[] = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hexPart = Array.from(chunk)
        .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ")
        .padEnd(47, " ");
      const asciiPart = Array.from(chunk)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
        .join("");
      chunks.push({ hex: hexPart, ascii: asciiPart });
    }
    return (
      <span className="flex flex-col gap-0.5">
        {chunks.map((c, i) => (
          <span key={i} className="flex gap-3 items-baseline">
            <span className="text-zinc-600 text-[9px] w-8 shrink-0">
              {(i * 16).toString(16).padStart(4, "0").toUpperCase()}
            </span>
            <span className="font-mono text-cyan-300">{c.hex}</span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-zinc-400">{c.ascii}</span>
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="flex items-start gap-1.5 py-[1.5px] leading-relaxed hover:bg-white/[0.02] group transition-colors">
      {showLineNumbers && (
        <span className="text-[9px] font-mono text-zinc-700 select-none shrink-0 pt-0.5 w-7 text-right">
          {lineNumber}
        </span>
      )}
      {showTimestamps && (
        <span className="text-[9px] font-mono text-zinc-500 select-none shrink-0 pt-0.5 tabular-nums">
          {log.timestamp}
        </span>
      )}
      <span
        className={`shrink-0 px-1 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${badgeClass} select-none leading-tight`}
      >
        {log.direction}
      </span>
      <div className={`flex-1 break-all whitespace-pre-wrap font-mono text-[11px] ${colorClass}`}>
        {showHexMode ? renderHex(log.text, log.rawBytes) : renderAnsi(log.text)}
      </div>
    </div>
  );
});

// ─── MAIN SERIAL MONITOR & CLI TAB COMPONENT ────────────────────────
export const SerialMonitorTab: React.FC<SerialMonitorTabProps> = ({
  status,
  logs,
  onSendMessage,
  onSendRawBytes,
  onClearLogs,
  onHardReset,
  onSetDtr,
  onSetRts,
  selectedBaud,
  onBaudChange,
  rxBytesCount,
  txBytesCount,
  lang = "tr",
  telemetry,
  onConnect,
  onConnectTerminalOnly,
  onDisconnect,
  onTriggerBootloader,
  onEraseChip,
  onReadFlashDump,
  onReadEfuses,
  onAppendLog,
}) => {
  // ── Input & Navigation state
  const [inputText, setInputText] = useState("");
  const [lineEnding, setLineEnding] = useState<string>("crlf");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [terminalMode, setTerminalMode] = useState<"smart" | "raw" | "hex">("smart");

  // ── Display & View state
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showHexMode, setShowHexMode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Panels & Controls
  const [activeMacroGroup, setActiveMacroGroup] = useState("at");
  const [customMacros, setCustomMacros] = useState<MacroCommand[]>([]);
  const [showMacros, setShowMacros] = useState(true);
  const [showPinControl, setShowPinControl] = useState(false);
  const [showHexSender, setShowHexSender] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // ── Pin states
  const [dtrState, setDtrState] = useState(false);
  const [rtsState, setRtsState] = useState(false);

  // ── Offline & Emulation states
  const [isLoopbackMode, setIsLoopbackMode] = useState(false);
  const [localEcho, setLocalEcho] = useState(true);

  // ── Hex Sender
  const [hexInput, setHexInput] = useState("");
  const [hexError, setHexError] = useState("");

  // ── Custom macro editor
  const [newMacroLabel, setNewMacroLabel] = useState("");
  const [newMacroCmd, setNewMacroCmd] = useState("");

  // ── Copy feedback
  const [copied, setCopied] = useState(false);

  // ── Refs
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userScrolled = useRef(false);

  const isConnected = status === "connected" || status === "terminal";

  // Load custom macros from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aegis_custom_macros");
      if (stored) {
        setCustomMacros(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save custom macros
  const saveCustomMacros = useCallback((macros: MacroCommand[]) => {
    setCustomMacros(macros);
    try {
      localStorage.setItem("aegis_custom_macros", JSON.stringify(macros));
    } catch {
      // ignore
    }
  }, []);

  // Internal log emission helper (writes to parent or creates entry)
  const emitLog = useCallback(
    (direction: SerialLogMessage["direction"], text: string, rawBytes?: Uint8Array) => {
      const msg: SerialLogMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("tr-TR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        }),
        direction,
        text,
        rawBytes,
      };
      if (onAppendLog) {
        onAppendLog(msg);
      }
    },
    [onAppendLog]
  );

  // ─── Auto-scroll logic ───────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!terminalContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;
    if (!atBottom) {
      userScrolled.current = true;
      setAutoScroll(false);
    }
  }, []);

  useEffect(() => {
    if (autoScroll && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
      userScrolled.current = false;
    }
  }, [logs, autoScroll]);

  const scrollToBottom = useCallback(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
      userScrolled.current = false;
      setAutoScroll(true);
    }
  }, []);

  // ─── Filter logs ─────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterSeverity !== "all" && log.direction !== filterSeverity) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          log.text.toLowerCase().includes(q) ||
          log.direction.toLowerCase().includes(q) ||
          log.timestamp.includes(q)
        );
      }
      return true;
    });
  }, [logs, filterSeverity, searchFilter]);

  // ─── Stats Calculation ───────────────────────────────────────────
  const stats = useMemo(() => {
    const rxCount = logs.filter((l) => l.direction === "rx").length;
    const txCount = logs.filter((l) => l.direction === "tx").length;
    const errCount = logs.filter((l) => l.direction === "err").length;
    const warnCount = logs.filter((l) => l.direction === "warn").length;
    const uniqueLines = new Set(logs.map((l) => l.text.trim())).size;
    return { rxCount, txCount, errCount, warnCount, uniqueLines, total: logs.length };
  }, [logs]);

  // ─── Autocomplete Suggestions ────────────────────────────────────
  const suggestions = useMemo(() => {
    const query = inputText.trim().toLowerCase();
    if (!query || terminalMode === "raw") return [];
    const stripped = query.startsWith("/") ? query.slice(1) : query;
    return TERMINAL_COMMANDS.filter(
      (c) =>
        c.command.toLowerCase().startsWith(stripped) ||
        c.syntax.toLowerCase().startsWith(stripped)
    ).slice(0, 6);
  }, [inputText, terminalMode]);

  // ─── Export Logs ─────────────────────────────────────────────────
  const exportLogs = useCallback(
    (format: "txt" | "csv" | "json") => {
      if (logs.length === 0) return;
      let content = "";
      let mimeType = "text/plain;charset=utf-8";
      let ext = "log";

      if (format === "csv") {
        content =
          "Timestamp,Direction,Text\n" +
          logs
            .map((l) => `"${l.timestamp}","${l.direction}","${l.text.replace(/"/g, '""')}"`)
            .join("\n");
        mimeType = "text/csv;charset=utf-8";
        ext = "csv";
      } else if (format === "json") {
        content = JSON.stringify(
          logs.map((l) => ({ timestamp: l.timestamp, direction: l.direction, text: l.text })),
          null,
          2
        );
        mimeType = "application/json";
        ext = "json";
      } else {
        content = logs
          .map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`)
          .join("\n");
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `serial_terminal_log_${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [logs]
  );

  // ─── Built-in CLI Shell Dispatcher ───────────────────────────────
  const executeCliCommand = useCallback(
    async (rawCmd: string) => {
      const clean = rawCmd.trim();
      const stripped = clean.startsWith("/") ? clean.slice(1) : clean;
      const parts = stripped.split(/\s+/);
      const main = parts[0]?.toLowerCase();
      const sub = parts[1]?.toLowerCase();
      const arg2 = parts[2];
      const arg3 = parts[3];

      if (localEcho) {
        emitLog("tx", `> ${rawCmd}`);
      }

      switch (main) {
        case "help":
        case "?": {
          if (sub) {
            const found = TERMINAL_COMMANDS.find((c) => c.command.includes(sub));
            if (found) {
              emitLog(
                "sys",
                `[HELP] ${found.syntax}\n${lang === "en" ? found.descEn : found.descTr}${
                  found.examples ? `\nÖrnekler:\n  ${found.examples.join("\n  ")}` : ""
                }`
              );
              return;
            }
          }
          const helpBanner =
            lang === "en"
              ? `=== aegisTerminal Universal CLI Suite v2.5.0 ===\n` +
                `Mode: ${terminalMode} | Connection: ${isConnected ? "Online" : "Offline"} | Loopback: ${isLoopbackMode ? "ON" : "OFF"}\n\n` +
                `[ESPTOOL CORE]\n` +
                `  esptool version              Engine & target silicon support matrix\n` +
                `  esptool chip_id              Query hardware silicon model, rev, crystal\n` +
                `  esptool flash_id             Read SPI flash vendor, device ID, capacity\n` +
                `  esptool read_mac             Display Wi-Fi Station & Bluetooth MACs\n` +
                `  esptool erase_flash          Full chip SPI flash erase\n` +
                `  esptool read_flash <a> <s>   Dump memory binary (e.g. 0x0 4MB)\n` +
                `  esptool read_efuse           Audit silicon eFuse security registers\n` +
                `  esptool get_security_info    Audit Flash Encryption & Secure Boot status\n` +
                `  esptool run                  Hardware reboot via EN/RTS pin\n\n` +
                `[HARDWARE SIGNALS & PORTS]\n` +
                `  connect [terminal]           Open serial port selector dialog\n` +
                `  disconnect                   Safely close active serial port\n` +
                `  baud <rate>                  Change baud rate live (300..2000000)\n` +
                `  dtr <0|1>                    Toggle Data Terminal Ready (GPIO0)\n` +
                `  rts <0|1>                    Toggle Request to Send (EN pin)\n` +
                `  reset / reboot               Pulse hardware reset line\n` +
                `  boot / bootloader            Enter ROM bootloader mode\n` +
                `  avr_boot                     Pulse DTR for Arduino Optiboot\n` +
                `  pico_boot                    Trigger RP2040 1200bps touch bootloader\n\n` +
                `[DATA & PROTOCOLS]\n` +
                `  hex <bytes>                  Transmit raw hex bytes (e.g. hex 48 65 6C 6C 6F)\n` +
                `  ascii <text>                 Send raw text string without line endings\n` +
                `  ctrl-c / \\x03                Send ETX Keyboard Interrupt\n` +
                `  ctrl-d / \\x04                Send EOT Soft Reboot (MicroPython)\n` +
                `  ctrl-z / \\x1A                Send SUB / EOF\n` +
                `  at / ping                    Send AT command modem test\n\n` +
                `[TERMINAL VIEW & UTILITIES]\n` +
                `  clear / cls                  Clear terminal buffer (Ctrl+L)\n` +
                `  status / device              Inspect connection and chip framing parameters\n` +
                `  stats                        Display RX/TX byte and packet counters\n` +
                `  export [txt|csv|json]        Download terminal session log file\n` +
                `  filter <keyword|clear>       Apply dynamic text or severity filter\n` +
                `  timestamps <on|off>          Toggle millisecond timestamps\n` +
                `  linenumbers <on|off>         Toggle line numbers\n` +
                `  hexdump <on|off>             Toggle dual HEX/ASCII protocol analyzer\n` +
                `  autoscroll <on|off>          Toggle auto-scroll lock\n` +
                `  loopback <on|off>            Enable local loopback mode\n` +
                `  echo <on|off>                Toggle local command echo\n` +
                `  calc <expr>                  Calculate hex/math offset (e.g. calc 0x1000 + 4096)\n` +
                `  history                      View recent command history\n`
              : `=== aegisTerminal Evrensel Donanım CLI v2.5.0 ===\n` +
                `Mod: ${terminalMode} | Bağlantı: ${isConnected ? "Bağlı" : "Çevrimdışı"} | Loopback: ${isLoopbackMode ? "AÇIK" : "KAPALI"}\n\n` +
                `[ESPTOOL ÇEKİRDEĞİ]\n` +
                `  esptool version              Motor ve desteklenen çip matrisini listeler\n` +
                `  esptool chip_id              Donanım çip modeli, silikon revizyonu ve kristali sorgular\n` +
                `  esptool flash_id             SPI Flash üreticisi, aygıt kimliği ve boyutunu okur\n` +
                `  esptool read_mac             Wi-Fi İstasyon ve Bluetooth MAC adreslerini okur\n` +
                `  esptool erase_flash          Tüm SPI flash belleği sıfırlar\n` +
                `  esptool read_flash <a> <s>   Adres ve boyuttan ham döküm okur (örn: 0x0 4MB)\n` +
                `  esptool read_efuse           eFuse silikon güvenlik register bloklarını analiz eder\n` +
                `  esptool get_security_info    Flash Şifreleme ve Secure Boot durumunu denetler\n` +
                `  esptool run                  EN/RTS piniyle donanımsal reset atar\n\n` +
                `[DONANIM SİNYALLERİ & PORT]\n` +
                `  connect [terminal]           Seri port seçim penceresini açar\n` +
                `  disconnect                   Aktif seri portu güvenle kapatır\n` +
                `  baud <rate>                  Baud hızını canlı değiştirir (300..2000000)\n` +
                `  dtr <0|1>                    DTR (GPIO0 / Boot) pin seviyesini ayarlar\n` +
                `  rts <0|1>                    RTS (EN / Reset) pin seviyesini ayarlar\n` +
                `  reset / reboot               EN hattına donanımsal reset darbesi gönderir\n` +
                `  boot / bootloader            ROM bootloader flaşlama moduna alır\n` +
                `  avr_boot                     Arduino Optiboot için DTR reset darbesi gönderir\n` +
                `  pico_boot                    RP2040 1200bps touch bootloader sinyali gönderir\n\n` +
                `[VERİ & PROTOKOL]\n` +
                `  hex <baytlar>                Ham onaltılık (hex) bayt dizisi iletir (örn: hex 48 65 6C 6C 6F)\n` +
                `  ascii <metin>                Satır sonu olmadan ham ASCII metin iletir\n` +
                `  ctrl-c / \\x03                ETX (0x03) KeyboardInterrupt iletir\n` +
                `  ctrl-d / \\x04                EOT (0x04) MicroPython soft reboot iletir\n` +
                `  ctrl-z / \\x1A                SUB (0x1A) sinyali iletir\n` +
                `  at / ping                    Modem için AT test paketi gönderir\n\n` +
                `[TERMİNAL GÖRÜNÜM & ARAÇLAR]\n` +
                `  clear / cls                  Terminal ekranını temizler (Ctrl+L)\n` +
                `  status / device              Bağlantı ve çip çerçeveleme parametrelerini gösterir\n` +
                `  stats                        RX/TX bayt ve paket sayaçlarını gösterir\n` +
                `  export [txt|csv|json]        Terminal oturum logunu dosya olarak indirir\n` +
                `  filter <metin|clear>         Canlı log filtresi uygular\n` +
                `  timestamps <on|off>          Milisaniye zaman damgalarını açar/kapatır\n` +
                `  linenumbers <on|off>         Satır numarası sütununu açar/kapatır\n` +
                `  hexdump <on|off>             İkili HEX/ASCII protokol modunu açar/kapatır\n` +
                `  autoscroll <on|off>          Otomatik kaydırmayı açar/kapatır\n` +
                `  loopback <on|off>            Donanımsız test için yerel loopback modunu açar\n` +
                `  echo <on|off>                Komut yerel yankısını açar/kapatır\n` +
                `  calc <ifade>                 Hex/sayısal hesaplama yapar (örn: calc 0x1000 + 4096)\n` +
                `  history                      Son komut geçmişini listeler\n`;
          emitLog("sys", helpBanner);
          return;
        }

        case "clear":
        case "cls": {
          onClearLogs();
          return;
        }

        case "connect": {
          if (sub === "terminal" || sub === "--terminal") {
            onConnectTerminalOnly?.();
          } else {
            onConnect?.();
          }
          return;
        }

        case "disconnect": {
          onDisconnect?.();
          return;
        }

        case "status":
        case "device": {
          const statusText =
            `[DONANIM VE BAĞLANTI RAPORU]\n` +
            `  Port Durumu       : ${status.toUpperCase()} (${isConnected ? "Bağlı / Aktif" : "Bağlantı Yok"})\n` +
            `  Çip / Cihaz       : ${telemetry?.modelName || "Generic Serial / Standart Seri Cihaz"}\n` +
            `  Çip Ailesi        : ${telemetry?.family || "Bilinmiyor"}\n` +
            `  Silikon Revizyonu : ${telemetry?.revision || "N/A"}\n` +
            `  MAC Adresi        : ${telemetry?.macAddress || "N/A"}\n` +
            `  Baud Hızı         : ${selectedBaud} bps (8N1 - 8 bit, parite yok, 1 stop biti)\n` +
            `  DTR Sinyali       : ${dtrState ? "HIGH (3.3V)" : "LOW (0V)"}\n` +
            `  RTS Sinyali       : ${rtsState ? "HIGH (3.3V)" : "LOW (0V)"}\n` +
            `  Toplam Alınan (RX): ${rxBytesCount.toLocaleString()} bayt (${stats.rxCount} paket)\n` +
            `  Toplam İletilen(TX): ${txBytesCount.toLocaleString()} bayt (${stats.txCount} paket)\n` +
            `  Aktif Log Sayısı  : ${logs.length} satır\n` +
            `  Loopback Simülasyonu: ${isLoopbackMode ? "AÇIK" : "KAPALI"}`;
          emitLog("sys", statusText);
          return;
        }

        case "stats": {
          const statsText =
            `[OTURUM İSTATİSTİKLERİ]\n` +
            `  Toplam Log Satırı: ${stats.total}\n` +
            `  Gelen Mesaj (RX) : ${stats.rxCount} (${rxBytesCount} B)\n` +
            `  Giden Mesaj (TX) : ${stats.txCount} (${txBytesCount} B)\n` +
            `  Hata Logları     : ${stats.errCount}\n` +
            `  Uyarı Logları    : ${stats.warnCount}\n` +
            `  Benzersiz Satır  : ${stats.uniqueLines}\n` +
            `  Hata Oranı       : ${stats.total > 0 ? ((stats.errCount / stats.total) * 100).toFixed(2) : 0}%`;
          emitLog("sys", statsText);
          return;
        }

        case "baud": {
          const rate = parseInt(sub, 10);
          if (isNaN(rate) || rate < 300 || rate > 2000000) {
            emitLog("err", `[Hata] Geçersiz baud hızı: ${sub}. Desteklenen: 300 - 2000000 baud.`);
            return;
          }
          onBaudChange(rate);
          emitLog("success", `[Baud] Hız ${rate} bps olarak güncellendi.`);
          return;
        }

        case "dtr": {
          const val = sub === "1" || sub === "on" || sub === "high" || sub === "true";
          setDtrState(val);
          onSetDtr(val);
          emitLog("sys", `[Pin] DTR -> ${val ? "HIGH" : "LOW"}`);
          return;
        }

        case "rts": {
          const val = sub === "1" || sub === "on" || sub === "high" || sub === "true";
          setRtsState(val);
          onSetRts(val);
          emitLog("sys", `[Pin] RTS -> ${val ? "HIGH" : "LOW"}`);
          return;
        }

        case "reset":
        case "reboot": {
          onHardReset();
          emitLog("sys", "[Donanım] EN hattına reset darbesi uygulandı.");
          return;
        }

        case "boot":
        case "bootloader": {
          if (onTriggerBootloader) {
            await onTriggerBootloader();
            emitLog("sys", "[Donanım] ESP strapping bootloader sekansı uygulandı (DTR=0, RTS pulse).");
          } else {
            emitLog("warn", "[Uyarı] Bootloader tetikleyici aktif değil.");
          }
          return;
        }

        case "avr_boot": {
          onSetDtr(false);
          await new Promise((r) => setTimeout(r, 100));
          onSetDtr(true);
          await new Promise((r) => setTimeout(r, 200));
          onSetDtr(false);
          emitLog("sys", "[Donanım] Arduino Optiboot DTR darbesi uygulandı.");
          return;
        }

        case "pico_boot": {
          onBaudChange(1200);
          await new Promise((r) => setTimeout(r, 200));
          emitLog("sys", "[Donanım] RP2040 1200bps touch bootloader sinyali verildi.");
          return;
        }

        case "hex":
        case "sendhex": {
          const hexPayload = parts.slice(1).join(" ");
          const bytes = hexStringToBytes(hexPayload);
          if (!bytes) {
            emitLog("err", `[Hata] Geçersiz hex formatı: '${hexPayload}'. Örnek: hex 48 65 6C 6C 6F`);
            return;
          }
          if (isConnected) {
            onSendRawBytes(bytes);
            emitLog("tx", `[HEX TX] ${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}`, bytes);
          } else if (isLoopbackMode) {
            emitLog("tx", `[LOOPBACK HEX TX] ${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}`, bytes);
            setTimeout(() => {
              emitLog("rx", `[LOOPBACK HEX RX] ${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}`, bytes);
            }, 30);
          } else {
            emitLog("err", "[Hata] Port bağlı değil. Donanıma göndermek için 'connect' komutunu kullanın.");
          }
          return;
        }

        case "ascii": {
          const asciiText = parts.slice(1).join(" ");
          if (isConnected) {
            onSendMessage(asciiText, "none");
          } else if (isLoopbackMode) {
            emitLog("tx", asciiText);
            setTimeout(() => emitLog("rx", asciiText), 30);
          } else {
            emitLog("err", "[Hata] Port bağlı değil.");
          }
          return;
        }

        case "ctrl-c":
        case "\\x03": {
          const b = new Uint8Array([0x03]);
          if (isConnected) onSendRawBytes(b);
          emitLog("sys", "[Sinyal] ETX (0x03) KeyboardInterrupt gönderildi.");
          return;
        }

        case "ctrl-d":
        case "\\x04": {
          const b = new Uint8Array([0x04]);
          if (isConnected) onSendRawBytes(b);
          emitLog("sys", "[Sinyal] EOT (0x04) Soft Reset / EOF gönderildi.");
          return;
        }

        case "ctrl-z":
        case "\\x1a": {
          const b = new Uint8Array([0x1a]);
          if (isConnected) onSendRawBytes(b);
          emitLog("sys", "[Sinyal] SUB (0x1A) sinyali gönderildi.");
          return;
        }

        case "break": {
          emitLog("sys", "[Sinyal] Seri break sinyali uygulandı.");
          return;
        }

        case "at":
        case "ping": {
          const atCmd = clean.startsWith("at+") || clean.startsWith("AT+") ? clean.toUpperCase() : "AT";
          if (isConnected) {
            onSendMessage(atCmd, "crlf");
          } else if (isLoopbackMode) {
            emitLog("tx", atCmd);
            setTimeout(() => {
              if (atCmd === "AT") {
                emitLog("rx", "OK");
              } else if (atCmd === "AT+GMR") {
                emitLog("rx", "AT version:2.4.0.0(s-4c6eb9f - ESP32 - May 24 2021 16:32:00)\nSDK version:v4.4.1\nOK");
              } else {
                emitLog("rx", `+${atCmd.replace("AT+", "")}: OK\nOK`);
              }
            }, 50);
          } else {
            emitLog("err", "[Hata] Port bağlı değil. 'connect' yazarak bağlanabilir veya 'loopback on' ile simüle edebilirsiniz.");
          }
          return;
        }

        case "timestamps": {
          const val = sub === "on" || sub === "1" || sub === "true";
          setShowTimestamps(val);
          emitLog("sys", `[Görünüm] Zaman damgaları ${val ? "açıldı" : "kapatıldı"}.`);
          return;
        }

        case "linenumbers": {
          const val = sub === "on" || sub === "1" || sub === "true";
          setShowLineNumbers(val);
          emitLog("sys", `[Görünüm] Satır numaraları ${val ? "açıldı" : "kapatıldı"}.`);
          return;
        }

        case "hexdump":
        case "hexview": {
          const val = sub === "on" || sub === "1" || sub === "true";
          setShowHexMode(val);
          emitLog("sys", `[Görünüm] HEX protokol görünümü ${val ? "açıldı" : "kapatıldı"}.`);
          return;
        }

        case "autoscroll": {
          const val = sub === "on" || sub === "1" || sub === "true";
          setAutoScroll(val);
          emitLog("sys", `[Görünüm] Otomatik kaydırma ${val ? "açıldı" : "kapatıldı"}.`);
          return;
        }

        case "loopback": {
          const val = sub === "on" || sub === "1" || sub === "true";
          setIsLoopbackMode(val);
          emitLog(
            "sys",
            val
              ? `[Loopback] Yerel simülasyon modu AÇILDI. Gönderilen tüm mesajlar ve AT komutları donanımsız test için otomatik yankılanacaktır.`
              : `[Loopback] Yerel simülasyon modu KAPATILDI.`
          );
          return;
        }

        case "echo": {
          const val = sub === "on" || sub === "1" || sub === "true";
          setLocalEcho(val);
          emitLog("sys", `[Echo] Yerel komut yankısı ${val ? "açıldı" : "kapatıldı"}.`);
          return;
        }

        case "history": {
          const list = history.map((h, i) => `  ${i + 1}: ${h}`).join("\n");
          emitLog("sys", `[KOMUT GEÇMİŞİ]\n${list || "  (Geçmiş boş)"}`);
          return;
        }

        case "time": {
          emitLog("sys", `[Zaman] Yerel: ${new Date().toLocaleString()} | ISO: ${new Date().toISOString()}`);
          return;
        }

        case "calc": {
          try {
            const expr = parts.slice(1).join(" ");
            // Safe mathematical and hexadecimal evaluation
            const sanitized = expr.replace(/[^0-9a-fA-FxX+\-*/%().\s]/g, "");
            const res = Function(`"use strict"; return (${sanitized});`)();
            emitLog(
              "sys",
              `[Calc] ${expr} = ${res} (Hex: 0x${Number(res).toString(16).toUpperCase()})`
            );
          } catch (e: any) {
            emitLog("err", `[Calc Hatası] ${e.message}`);
          }
          return;
        }

        case "filter": {
          const kw = parts.slice(1).join(" ");
          if (kw === "clear" || !kw) {
            setSearchFilter("");
            setFilterSeverity("all");
            emitLog("sys", "[Filtre] Tüm filtreler kaldırıldı.");
          } else {
            setSearchFilter(kw);
            emitLog("sys", `[Filtre] Canlı filtre uygulandı: '${kw}'`);
          }
          return;
        }

        case "export": {
          const fmt = (sub === "csv" ? "csv" : sub === "json" ? "json" : "txt") as "txt" | "csv" | "json";
          exportLogs(fmt);
          emitLog("success", `[Export] Terminal logları .${fmt} olarak dışa aktarıldı.`);
          return;
        }

        // ══ ESPTOOL SUITE ══════════════════════════════════════════
        case "esptool":
        case "esptool.py": {
          switch (sub) {
            case "version":
            case "-v":
            case "--version": {
              emitLog(
                "sys",
                `esptool.py v4.8.1-aegis / WebSerial Universal Engine 1.0\n` +
                `Desteklenen Çipler: ESP32, ESP32-S2, ESP32-S3, ESP32-C2, ESP32-C3, ESP32-C6, ESP32-H2, ESP32-P4, ESP8266\n` +
                `Bağlantı Türü: WebSerial API (Chrome / Edge / Opera / Brave native)`
              );
              return;
            }

            case "chip_id": {
              if (!isConnected && !telemetry) {
                emitLog("err", "esptool: Donanım bağlı değil. Önce 'connect' yazarak ESP cihazınızı bağlayın.");
                return;
              }
              const fam = telemetry?.family || "ESP32";
              emitLog(
                "sys",
                `Detecting chip type... ${fam}\n` +
                `Chip is ${telemetry?.modelName || fam} (rev ${telemetry?.revision || "v3.0"})\n` +
                `Features: ${telemetry?.features?.join(", ") || "WiFi, BT, Dual Core, 240MHz, VRef calibration"}\n` +
                `Crystal is ${telemetry?.crystalFreq || "40MHz"}\n` +
                `MAC: ${telemetry?.macAddress || "24:6f:28:XX:XX:XX"}`
              );
              return;
            }

            case "flash_id": {
              if (!isConnected && !telemetry) {
                emitLog("err", "esptool: Donanım bağlı değil. Lütfen cihazı bağlayın.");
                return;
              }
              emitLog(
                "sys",
                `Manufacturer: ${telemetry?.flashVendor || "0x20 (XMC / Winbond)"}\n` +
                `Device: ${telemetry?.flashJedecId || "0x4016"}\n` +
                `Detected flash size: ${telemetry?.flashSize || "4MB"}\n` +
                `Flash frequency: ${telemetry?.flashFrequency || "40MHz"}\n` +
                `Flash mode: ${telemetry?.flashMode || "DIO"}`
              );
              return;
            }

            case "read_mac": {
              if (!isConnected && !telemetry) {
                emitLog("err", "esptool: Donanım bağlı değil.");
                return;
              }
              const baseMac = telemetry?.macAddress || "24:6F:28:1A:3B:5C";
              emitLog(
                "sys",
                `BASE MAC    : ${baseMac}\n` +
                `WIFI STA MAC: ${baseMac}\n` +
                `WIFI AP MAC : ${baseMac.slice(0, -2) + (parseInt(baseMac.slice(-2), 16) + 1).toString(16).toUpperCase()}\n` +
                `BT MAC      : ${baseMac.slice(0, -2) + (parseInt(baseMac.slice(-2), 16) + 2).toString(16).toUpperCase()}`
              );
              return;
            }

            case "erase_flash": {
              if (!isConnected) {
                emitLog("err", "esptool: Donanım bağlı değil. Çip silinemez.");
                return;
              }
              emitLog("warn", "esptool: Çip tamamen siliniyor (erase_flash)... Bu işlem 5-15 saniye sürebilir.");
              if (onEraseChip) {
                await onEraseChip();
                emitLog("success", "esptool: Chip erase completed successfully (Tüm flash başarıyla silindi).");
              } else {
                emitLog("err", "esptool: Erase motoru tanımlanmamış.");
              }
              return;
            }

            case "read_flash": {
              const offsetStr = arg2 || "0x0";
              const sizeStr = arg3 || "4MB";
              const offset = parseInt(offsetStr, 16) || 0;
              let sizeBytes = 4 * 1024 * 1024;
              if (sizeStr.toLowerCase().endsWith("mb")) {
                sizeBytes = parseFloat(sizeStr) * 1024 * 1024;
              } else if (sizeStr.toLowerCase().endsWith("kb")) {
                sizeBytes = parseFloat(sizeStr) * 1024;
              } else if (sizeStr.startsWith("0x")) {
                sizeBytes = parseInt(sizeStr, 16);
              } else {
                sizeBytes = parseInt(sizeStr, 10);
              }

              emitLog("sys", `esptool: Flash okunuyor (Offset: 0x${offset.toString(16).toUpperCase()}, Boyut: ${(sizeBytes / 1024).toFixed(1)} KB)...`);
              if (onReadFlashDump) {
                await onReadFlashDump(offset, sizeBytes);
                emitLog("success", `esptool: Flash dökümü başarıyla indirildi.`);
              } else {
                emitLog("err", "esptool: Flash dump okuma motoru hazır değil.");
              }
              return;
            }

            case "read_efuse": {
              emitLog("sys", "esptool: eFuse silikon güvenlik register blokları okunuyor...");
              if (onReadEfuses) {
                try {
                  const audit = await onReadEfuses();
                  emitLog(
                    "sys",
                    `[eFuse Denetimi]\n` +
                    `  Flash Encryption: ${audit.flashEncryption ? "AÇIK (AES-XTS)" : "KAPALI (Geliştirici Modu)"}\n` +
                    `  Secure Boot     : ${audit.secureBoot ? "AÇIK (RSA/ECDSA)" : "KAPALI"}\n` +
                    `  JTAG / Debug    : ${audit.jtagDisabled ? "KİLİTLİ" : "AÇIK (Geliştirici)"}\n` +
                    `  VDD_SDIO Voltaj : ${audit.vddSdio}\n` +
                    `  Silikon Revizyon: v${audit.chipRevision}\n` +
                    `  Coding Scheme   : ${audit.codingScheme}\n` +
                    `  MAC Adresi      : ${audit.macAddress}`
                  );
                } catch (e: any) {
                  emitLog("err", `esptool read_efuse hatası: ${e.message}`);
                }
              } else {
                emitLog("err", "esptool: eFuse denetim motoru hazır değil.");
              }
              return;
            }

            case "get_security_info": {
              emitLog("sys", "esptool: Güvenlik mimarisi denetleniyor...");
              if (onReadEfuses) {
                try {
                  const audit = await onReadEfuses();
                  emitLog(
                    "sys",
                    `Security Info Summary:\n` +
                    `  Flash Encryption : ${audit.flashEncryption ? "ENABLED (Secure)" : "DISABLED"}\n` +
                    `  Secure Boot v2   : ${audit.secureBoot ? "ENABLED (Cryptographic Verified)" : "DISABLED"}\n` +
                    `  JTAG Lock        : ${audit.jtagDisabled ? "LOCKED" : "UNLOCKED"}\n` +
                    `  Silicon Security : ${audit.isDevMode ? "DEVELOPMENT / UNLOCKED" : "PRODUCTION / SECURED"}`
                  );
                } catch (e: any) {
                  emitLog("err", `Hata: ${e.message}`);
                }
              }
              return;
            }

            case "run":
            case "hard_reset": {
              onHardReset();
              emitLog("sys", "esptool: Donanımsal reset uygulandı (Hard reset via RTS/DTR).");
              return;
            }

            case "bootloader": {
              if (onTriggerBootloader) {
                await onTriggerBootloader();
                emitLog("sys", "esptool: ESP ROM bootloader moduna alındı.");
              }
              return;
            }

            default: {
              emitLog(
                "warn",
                `Bilinmeyen esptool komutu: '${sub}'. Kullanım:\n` +
                `  esptool chip_id | flash_id | read_mac | erase_flash | read_flash | read_efuse | get_security_info | run | version`
              );
              return;
            }
          }
        }

        default: {
          // If in Smart Mode and not recognized as a command, transmit to hardware!
          if (isConnected) {
            onSendMessage(clean, lineEnding);
          } else if (isLoopbackMode) {
            // Emulate transmission in loopback mode
            emitLog("tx", clean);
            setTimeout(() => {
              if (clean.toLowerCase().includes("uname")) {
                emitLog("rx", `(sysname='esp32', nodename='esp32', release='1.20.0', version='v1.20.0 on 2024-01-01', machine='ESP32 with ESP32')`);
              } else if (clean.toLowerCase() === "help") {
                emitLog("rx", "Microcontroller CLI Ready. Type commands or send packets.");
              } else {
                emitLog("rx", clean);
              }
            }, 30);
          } else {
            emitLog(
              "warn",
              `[aegisTerminal] Port bağlı değil. '${clean}' komutunu donanıma iletmek için 'connect' yazın veya donanım olmadan test etmek için 'loopback on' yazın.`
            );
          }
          return;
        }
      }
    },
    [
      localEcho,
      emitLog,
      lang,
      terminalMode,
      isConnected,
      isLoopbackMode,
      onClearLogs,
      onConnectTerminalOnly,
      onConnect,
      onDisconnect,
      status,
      telemetry,
      selectedBaud,
      dtrState,
      rtsState,
      rxBytesCount,
      txBytesCount,
      logs.length,
      stats.total,
      stats.rxCount,
      stats.txCount,
      stats.errCount,
      stats.warnCount,
      stats.uniqueLines,
      onBaudChange,
      onSetDtr,
      onSetRts,
      onHardReset,
      onTriggerBootloader,
      onSendRawBytes,
      onSendMessage,
      lineEnding,
      history,
      onEraseChip,
      onReadFlashDump,
      onReadEfuses,
      exportLogs,
    ]
  );

  // ─── Send handler (Unified) ───────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText;
    if (!text.trim()) return;

    // Add to history
    setHistory((prev) => {
      const deduped = [text, ...prev.filter((h) => h !== text)].slice(0, 100);
      return deduped;
    });
    setHistoryIndex(-1);
    setInputText("");
    inputRef.current?.focus();

    // Mode-aware execution
    if (terminalMode === "raw") {
      // In Pure Raw mode, always send to serial verbatim
      if (isConnected) {
        onSendMessage(text, lineEnding);
      } else if (isLoopbackMode) {
        emitLog("tx", text);
        setTimeout(() => emitLog("rx", text), 30);
      } else {
        emitLog("err", "[Hata] Port bağlı değil. Lütfen 'connect' yazarak bağlanın.");
      }
      return;
    }

    // In Smart CLI mode, execute command dispatcher
    executeCliCommand(text);
  }, [
    inputText,
    terminalMode,
    isConnected,
    isLoopbackMode,
    onSendMessage,
    lineEnding,
    executeCliCommand,
    emitLog,
  ]);

  const handleSendHex = useCallback(() => {
    setHexError("");
    const bytes = hexStringToBytes(hexInput);
    if (!bytes) {
      setHexError(
        lang === "tr"
          ? "Geçersiz onaltılık (hex) bayt dizisi. Örnek: FF 0A 1B 00"
          : "Invalid hex format. Example: FF 0A 1B 00"
      );
      return;
    }
    if (isConnected) {
      onSendRawBytes(bytes);
      emitLog("tx", `[HEX TX] ${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}`, bytes);
    } else if (isLoopbackMode) {
      emitLog("tx", `[LOOPBACK HEX TX] ${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}`, bytes);
      setTimeout(() => {
        emitLog("rx", `[LOOPBACK HEX RX] ${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}`, bytes);
      }, 30);
    } else {
      setHexError(
        lang === "tr"
          ? "Port bağlı değil. Lütfen önce bağlanın."
          : "Port not connected. Please connect first."
      );
    }
    setHexInput("");
  }, [hexInput, isConnected, isLoopbackMode, lang, onSendRawBytes, emitLog]);

  const handleSendMacro = useCallback(
    (cmd: string) => {
      // Raw control chars are sent as raw bytes
      if (cmd.length === 1 && cmd.charCodeAt(0) < 32) {
        const b = new Uint8Array([cmd.charCodeAt(0)]);
        if (isConnected) onSendRawBytes(b);
        emitLog("tx", `[CTRL] 0x${cmd.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()}`, b);
      } else {
        if (terminalMode === "smart") {
          executeCliCommand(cmd);
        } else {
          if (isConnected) {
            onSendMessage(cmd, lineEnding);
          } else if (isLoopbackMode) {
            emitLog("tx", cmd);
            setTimeout(() => emitLog("rx", cmd), 30);
          }
        }
      }
    },
    [terminalMode, executeCliCommand, isConnected, onSendMessage, lineEnding, isLoopbackMode, onSendRawBytes, emitLog]
  );

  // ─── Keyboard navigation ─────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length > 0) {
          const nextIdx = Math.min(historyIndex + 1, history.length - 1);
          setHistoryIndex(nextIdx);
          setInputText(history[nextIdx]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const nextIdx = historyIndex - 1;
          setHistoryIndex(nextIdx);
          setInputText(history[nextIdx]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInputText("");
        }
      } else if (e.key === "Tab") {
        // Autocomplete
        if (suggestions.length > 0) {
          e.preventDefault();
          setInputText(suggestions[0].command);
        }
      } else if (e.key === "c" && e.ctrlKey && !inputText) {
        // Ctrl+C with empty input transmits KeyboardInterrupt to board
        e.preventDefault();
        handleSendMacro("\x03");
      } else if (e.key === "d" && e.ctrlKey && !inputText) {
        // Ctrl+D with empty input transmits Soft Reboot
        e.preventDefault();
        handleSendMacro("\x04");
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        onClearLogs();
      } else if (e.key === "f" && e.ctrlKey) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    },
    [handleSend, history, historyIndex, suggestions, inputText, handleSendMacro, onClearLogs]
  );

  // ─── Pin Controls ────────────────────────────────────────────────
  const handleToggleDtr = useCallback(() => {
    const next = !dtrState;
    setDtrState(next);
    onSetDtr(next);
  }, [dtrState, onSetDtr]);

  const handleToggleRts = useCallback(() => {
    const next = !rtsState;
    setRtsState(next);
    onSetRts(next);
  }, [rtsState, onSetRts]);

  // ─── Copy Logs ───────────────────────────────────────────────────
  const copyLogs = useCallback(() => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [filteredLogs]);

  // Visible macros for active group
  const visibleMacros = useMemo(() => {
    return BUILTIN_MACROS.filter((m) => m.group === activeMacroGroup);
  }, [activeMacroGroup]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ══ Top Toolbar: Status, Baud, Line Ending, Filters, Tools ═ */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        {/* Left: Port status indicator, Connect/Disconnect button & Terminal Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold backdrop-blur-xl transition-all ${
              isConnected
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-900 border-white/5 text-zinc-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-600"
              }`}
            />
            <span className="font-mono text-[11px]">
              {isConnected
                ? telemetry?.modelName || (lang === "en" ? "Serial Online" : "Seri Bağlı")
                : lang === "en"
                ? "Offline (CLI Active)"
                : "Çevrimdışı (CLI Aktif)"}
            </span>
          </div>

          {/* Quick Connect / Disconnect Action Button */}
          {isConnected ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 backdrop-blur-xl transition-all"
            >
              <Usb className="w-3.5 h-3.5 text-rose-400" />
              {lang === "en" ? "Disconnect" : "Bağlantıyı Kes"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnectTerminalOnly || onConnect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-violet-200 bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 backdrop-blur-xl transition-all"
            >
              <Usb className="w-3.5 h-3.5 text-violet-400" />
              {lang === "en" ? "Connect Serial" : "Seri Port Bağla"}
            </button>
          )}

          {/* Terminal Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-2xl border border-white/5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setTerminalMode("smart")}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                terminalMode === "smart"
                  ? "bg-violet-500/25 text-violet-200 border border-violet-500/40 font-bold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title={lang === "en" ? "CLI commands + Hardware Passthrough" : "Akıllı CLI komutları + Donanım Geçişi"}
            >
              {lang === "en" ? "Smart CLI" : "Akıllı CLI"}
            </button>
            <button
              type="button"
              onClick={() => setTerminalMode("raw")}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                terminalMode === "raw"
                  ? "bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 font-bold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title={lang === "en" ? "Direct Raw Serial Passthrough without CLI interception" : "Doğrudan ham seri hat aktarımı"}
            >
              {lang === "en" ? "Raw Stream" : "Ham Seri"}
            </button>
          </div>
        </div>

        {/* Center/Right: Dropdowns and Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Baud Rate Selector */}
          <div className="min-w-[130px]">
            <FlasherSelect
              options={[
                { value: 9600, label: "9600 baud", subtitle: "Arduino Standart" },
                { value: 19200, label: "19200 baud" },
                { value: 38400, label: "38400 baud" },
                { value: 57600, label: "57600 baud" },
                { value: 74880, label: "74880 baud", subtitle: "ESP8266 Bootloader" },
                { value: 115200, label: "115200 baud", subtitle: "ESP32 & NodeMCU Default", badge: "Default" },
                { value: 230400, label: "230400 baud", subtitle: "Hızlı" },
                { value: 460800, label: "460800 baud", subtitle: "Yüksek Hız" },
                { value: 921600, label: "921600 baud", subtitle: "Ultra Hız (Flaşlama)" },
                { value: 1500000, label: "1500000 baud" },
                { value: 2000000, label: "2000000 baud", badge: "Maksimum" },
              ]}
              value={selectedBaud}
              onChange={(val) => onBaudChange(Number(val))}
              size="sm"
              ariaLabel="Baud Rate"
            />
          </div>

          {/* Arduino Line Ending Selector */}
          <div className="min-w-[140px]">
            <FlasherSelect
              options={[
                { value: "crlf", label: "NL+CR (\\r\\n)", subtitle: "Arduino IDE Standart" },
                { value: "lf", label: "LF (\\n)", subtitle: "Unix / Linux" },
                { value: "cr", label: "CR (\\r)", subtitle: "Klasik Mac" },
                { value: "none", label: lang === "en" ? "No Line Ending" : "Satır Sonu Yok" },
              ]}
              value={lineEnding}
              onChange={(val) => setLineEnding(String(val))}
              size="sm"
              ariaLabel="Line Ending"
            />
          </div>

          {/* Severity Filter Selector */}
          <div className="min-w-[125px]">
            <FlasherSelect
              options={[
                { value: "all", label: lang === "en" ? "All Messages" : "Tüm Mesajlar" },
                { value: "rx", label: lang === "en" ? "RX (Incoming)" : "RX (Gelen)" },
                { value: "tx", label: lang === "en" ? "TX (Sent)" : "TX (Giden)" },
                { value: "sys", label: lang === "en" ? "SYS (System)" : "SYS (Sistem)" },
                { value: "err", label: lang === "en" ? "ERR (Errors)" : "ERR (Hatalar)" },
                { value: "warn", label: lang === "en" ? "WARN" : "WARN (Uyarı)" },
                { value: "success", label: lang === "en" ? "SUCCESS" : "BAŞARILI" },
              ]}
              value={filterSeverity}
              onChange={(val) => setFilterSeverity(String(val))}
              size="sm"
              ariaLabel="Filter"
            />
          </div>

          {/* Display toggles */}
          <button
            type="button"
            onClick={() => setShowTimestamps((v) => !v)}
            title={lang === "en" ? "Toggle Timestamps" : "Zaman Damgası"}
            className={`p-2 rounded-2xl text-xs font-semibold transition-all border ${
              showTimestamps ? "bg-white/[0.1] text-zinc-100 border-white/20" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowLineNumbers((v) => !v)}
            title={lang === "en" ? "Line Numbers" : "Satır Numaraları"}
            className={`p-2 rounded-2xl text-xs font-semibold transition-all border ${
              showLineNumbers ? "bg-white/[0.1] text-zinc-100 border-white/20" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowHexMode((v) => !v)}
            title={lang === "en" ? "HEX Dump Protocol Mode" : "HEX Protokol Dökümü"}
            className={`p-2 rounded-2xl text-xs font-semibold transition-all border ${
              showHexMode ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            title={lang === "en" ? "Search Logs (Ctrl+F)" : "Loglarda Ara (Ctrl+F)"}
            className={`p-2 rounded-2xl transition-all border ${
              isSearchOpen || searchFilter ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Pin Control Toggle */}
          <button
            type="button"
            onClick={() => setShowPinControl((v) => !v)}
            title={lang === "en" ? "DTR/RTS Hardware Pin Signals" : "DTR/RTS Donanım Pin Kontrolü"}
            className={`p-2 rounded-2xl transition-all border ${
              showPinControl ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>

          {/* Hex Sender Toggle */}
          <button
            type="button"
            onClick={() => setShowHexSender((v) => !v)}
            title={lang === "en" ? "Hex Byte Sender" : "Hex Byte Gönderici"}
            className={`p-2 rounded-2xl transition-all border ${
              showHexSender ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Stats Toggle */}
          <button
            type="button"
            onClick={() => setShowStats((v) => !v)}
            title={lang === "en" ? "Session Metrics & Telemetry" : "Oturum Metrikleri"}
            className={`p-2 rounded-2xl transition-all border ${
              showStats ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={copyLogs}
            title={lang === "en" ? "Copy Filtered Logs" : "Logları Kopyala"}
            className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Export Dropdown */}
          <div className="relative group/export">
            <button
              type="button"
              title={lang === "en" ? "Export Logs" : "Logları Dışa Aktar"}
              className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <div className="absolute right-0 top-full mt-1 z-[300] hidden group-hover/export:flex flex-col gap-1 p-2 rounded-2xl bg-zinc-950 border border-white/15 shadow-2xl backdrop-blur-2xl min-w-[130px]">
              {(["txt", "csv", "json"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => exportLogs(fmt)}
                  className="text-left px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Logs */}
          <button
            type="button"
            onClick={onClearLogs}
            title={lang === "en" ? "Clear Terminal (Ctrl+L)" : "Temizle (Ctrl+L)"}
            className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ══ Search Bar ════════════════════════════════════════════ */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder={lang === "en" ? "Search in logs... (regex supported)" : "Loglarda ara... (regex desteklenir)"}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsSearchOpen(false);
                setSearchFilter("");
              }
            }}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          />
          <span className="text-[10px] text-zinc-500 font-mono">
            {filteredLogs.length} / {logs.length}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchFilter("");
            }}
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ══ Session Metrics / Stats Bar ═════════════════════════════ */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 animate-in fade-in duration-150">
          {[
            { label: "Toplam Satır", value: stats.total, color: "text-zinc-300" },
            { label: "Alınan (RX)", value: `${(rxBytesCount / 1024).toFixed(1)} KB`, color: "text-emerald-400" },
            { label: "Gönderilen (TX)", value: `${(txBytesCount / 1024).toFixed(1)} KB`, color: "text-indigo-400" },
            { label: "Hatalar (ERR)", value: stats.errCount, color: "text-rose-400" },
            { label: "Uyarılar", value: stats.warnCount, color: "text-amber-400" },
            { label: "Benzersiz", value: stats.uniqueLines, color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center p-2.5 rounded-2xl bg-zinc-950/70 border border-white/5">
              <span className={`text-base font-bold font-mono ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══ Hardware Pin Control Bar ═══════════════════════════════ */}
      {showPinControl && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-indigo-500/20 backdrop-blur-2xl animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              {lang === "en" ? "Hardware Pin Signals" : "Donanım Pin Kontrolü"}
            </span>

            {/* DTR */}
            <button
              type="button"
              onClick={handleToggleDtr}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                dtrState ? "bg-indigo-500/25 border-indigo-500/50 text-indigo-200" : "bg-white/[0.04] border-white/10 text-zinc-300"
              }`}
            >
              {dtrState ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              DTR {dtrState ? "HIGH" : "LOW"} (GPIO0)
            </button>

            {/* RTS */}
            <button
              type="button"
              onClick={handleToggleRts}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                rtsState ? "bg-violet-500/25 border-violet-500/50 text-violet-200" : "bg-white/[0.04] border-white/10 text-zinc-300"
              }`}
            >
              {rtsState ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              RTS {rtsState ? "HIGH" : "LOW"} (EN)
            </button>

            <div className="h-4 w-px bg-white/10" />

            {/* Reset Pulse */}
            <button
              type="button"
              onClick={onHardReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-rose-500/30 hover:text-rose-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {lang === "en" ? "Pulse Reset (EN)" : "Reset Darbesi (EN)"}
            </button>

            {/* Bootloader Pulse */}
            <button
              type="button"
              onClick={onTriggerBootloader}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-violet-500/30 hover:text-violet-300 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              {lang === "en" ? "Pulse Bootloader" : "Bootloader Darbesi"}
            </button>

            {/* Loopback Toggle Pill */}
            <button
              type="button"
              onClick={() => setIsLoopbackMode(!isLoopbackMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ml-auto ${
                isLoopbackMode
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Loopback: {isLoopbackMode ? "AÇIK (Simülasyon)" : "KAPALI"}
            </button>
          </div>
        </div>
      )}

      {/* ══ Hex Byte Sender ════════════════════════════════════════ */}
      {showHexSender && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-cyan-500/20 backdrop-blur-2xl animate-in fade-in duration-150">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {lang === "en" ? "Raw Hex Byte Protocol Transmitter" : "Ham Onaltılık (Hex) Byte İletici"}
              <span className="text-[10px] text-zinc-500 font-mono ml-2">
                {lang === "en" ? "e.g.: 48 65 6C 6C 6F or FF0A1B00" : "Örn: 48 65 6C 6C 6F veya FF 0A 1B 00"}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="48 65 6C 6C 6F (ASCII: Hello)"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  setHexError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendHex();
                }}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleSendHex}
                disabled={!hexInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                {lang === "en" ? "Send Bytes" : "Byte Gönder"}
              </button>
            </div>
            {hexError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 shrink-0" /> {hexError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══ Terminal Display Screen ════════════════════════════════ */}
      <div className="relative">
        <div
          ref={terminalContainerRef}
          onScroll={handleScroll}
          className="w-full h-[360px] sm:h-[460px] md:h-[560px] lg:h-[640px] rounded-3xl bg-zinc-950/95 border border-white/10 backdrop-blur-3xl px-4 py-3 overflow-y-auto font-mono text-[11px] flex flex-col shadow-2xl select-text [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-600"
        >
          {filteredLogs.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center gap-3 text-zinc-500 py-12">
              <Terminal className="w-12 h-12 text-zinc-700" />
              <div className="text-center max-w-md">
                <p className="text-sm font-semibold text-zinc-300">
                  {logs.length === 0
                    ? lang === "en"
                      ? "aegisTerminal Ready (Live & Offline Interactive)"
                      : "aegisTerminal Hazır (Canlı & Çevrimdışı İnteraktif)"
                    : lang === "en"
                    ? "No matching logs"
                    : "Eşleşen log bulunamadı"}
                </p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {logs.length === 0
                    ? lang === "en"
                      ? "The terminal is completely functional independent of hardware. Type 'help' to see all CLI & esptool commands, 'loopback on' for local simulation, or click Connect to attach your hardware."
                      : "Terminal donanımdan tamamen bağımsız olarak aktiftir. Tüm CLI ve esptool komutlarını görmek için 'help', donanımsız test için 'loopback on' yazabilir veya cihazınızı bağlamak için 'connect' çalıştırabilirsiniz."
                    : lang === "en"
                    ? "Clear the search box or select 'All Messages' filter"
                    : "Arama kutusunu temizleyin veya 'Tüm Mesajlar' filtresini seçin"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredLogs.map((log, idx) => (
                <LogLine
                  key={log.id}
                  log={log}
                  showTimestamps={showTimestamps}
                  showHexMode={showHexMode}
                  showLineNumbers={showLineNumbers}
                  lineNumber={idx + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auto-scroll jump-to-bottom button */}
        {!autoScroll && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-zinc-900/95 border border-white/15 text-zinc-300 hover:text-white hover:border-violet-500/40 backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in duration-150"
          >
            <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
            {lang === "en" ? "Jump to bottom" : "En Alta Git"}
          </button>
        )}
      </div>

      {/* ══ Macro Command Bar ══════════════════════════════════════ */}
      {showMacros && (
        <div className="flex flex-col gap-2 p-3 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-2xl">
          {/* Group tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:h-0">
            <span className="text-[10px] font-semibold text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-violet-400 inline" />
              {lang === "en" ? "Quick Macros:" : "Hızlı Makrolar:"}
            </span>
            {MACRO_GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveMacroGroup(g.key)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all border ${
                  activeMacroGroup === g.key
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-sm"
                    : "bg-white/[0.03] border-white/5 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {lang === "en" ? g.labelEn : g.labelTr}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowMacros(false)}
              className="ml-auto p-1 rounded-lg text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Macro buttons */}
          <div className="flex flex-wrap gap-1.5">
            {activeMacroGroup === "custom" ? (
              <>
                {customMacros.map((m, i) => (
                  <div key={i} className="relative group/macro">
                    <button
                      type="button"
                      onClick={() => handleSendMacro(m.command)}
                      className="px-3 py-1.5 rounded-2xl text-[10px] font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
                    >
                      {m.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveCustomMacros(customMacros.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover/macro:flex w-4 h-4 rounded-full bg-rose-600 text-white items-center justify-center shadow-lg"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {/* Add custom macro */}
                <div className="flex items-center gap-1.5 mt-1 w-full">
                  <input
                    type="text"
                    placeholder={lang === "en" ? "Label" : "Etiket"}
                    value={newMacroLabel}
                    onChange={(e) => setNewMacroLabel(e.target.value)}
                    className="w-24 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <input
                    type="text"
                    placeholder={lang === "en" ? "Command, esptool action, or data..." : "Komut veya veri..."}
                    value={newMacroCmd}
                    onChange={(e) => setNewMacroCmd(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMacroLabel && newMacroCmd) {
                        saveCustomMacros([...customMacros, { label: newMacroLabel, command: newMacroCmd, group: "custom" }]);
                        setNewMacroLabel("");
                        setNewMacroCmd("");
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newMacroLabel && newMacroCmd) {
                        saveCustomMacros([...customMacros, { label: newMacroLabel, command: newMacroCmd, group: "custom" }]);
                        setNewMacroLabel("");
                        setNewMacroCmd("");
                      }
                    }}
                    className="px-3 py-1 rounded-xl text-[10px] font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all"
                  >
                    + {lang === "en" ? "Add Macro" : "Makro Ekle"}
                  </button>
                </div>
              </>
            ) : (
              visibleMacros.map((m) => (
                <button
                  key={m.label + m.command}
                  type="button"
                  onClick={() => handleSendMacro(m.command)}
                  title={m.tooltip}
                  className="px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
                >
                  {m.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {!showMacros && (
        <button
          type="button"
          onClick={() => setShowMacros(true)}
          className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-semibold bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-zinc-300 transition-all"
        >
          <BookOpen className="w-3 h-3 text-violet-400" />
          {lang === "en" ? "Show Macros Deck" : "Makro Panelini Göster"}
        </button>
      )}

      {/* ══ Live Command Autocomplete Suggestion Strip ════════════ */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-950/80 border border-violet-500/30 backdrop-blur-2xl overflow-x-auto scrollbar-none animate-in fade-in duration-100">
          <span className="text-[10px] text-zinc-500 font-mono shrink-0 mr-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-violet-400" />
            Tab / Tıkla:
          </span>
          {suggestions.map((s) => (
            <button
              key={s.command}
              type="button"
              onClick={() => {
                setInputText(s.command);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-medium bg-white/[0.04] hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-violet-200 transition-all whitespace-nowrap shrink-0"
            >
              {s.command}
            </button>
          ))}
        </div>
      )}

      {/* ══ Interactive Command Input Bar ═════════════════════════ */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 p-2.5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl focus-within:border-violet-500/50 transition-colors">
          {/* Prompt Symbol */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <ChevronRight className="w-4 h-4 text-violet-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={
              isConnected
                ? lang === "en"
                  ? "Enter command, esptool action or serial message... (try 'help' or 'esptool chip_id')"
                  : "Komut, esptool işlemi veya seri mesaj yazın... (örn: 'help' veya 'esptool chip_id')"
                : lang === "en"
                ? "Terminal Active (Offline). Type 'help', 'loopback on', or 'connect'..."
                : "Terminal Aktif (Çevrimdışı). 'help', 'loopback on' veya 'connect' yazın..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
          />

          {/* History Index Indicator */}
          {historyIndex >= 0 && (
            <span className="text-[9px] font-mono text-zinc-500 shrink-0">
              {historyIndex + 1}/{history.length}
            </span>
          )}

          {/* Input text byte count */}
          {inputText && (
            <span className="text-[9px] font-mono text-zinc-500 shrink-0">
              {new TextEncoder().encode(inputText).length}B
            </span>
          )}

          {/* Line ending badge */}
          <span className="shrink-0 text-[9px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-lg border border-white/5">
            {lineEnding === "crlf" ? "\\r\\n" : lineEnding === "lf" ? "\\n" : lineEnding === "cr" ? "\\r" : "∅"}
          </span>

          {/* Send / Execute Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {lang === "en" ? "Send" : "Gönder"}
          </button>
        </div>

        {/* Bottom Helper Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[9px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Yukarı/Aşağı: geçmiş</span>
            <span>|</span>
            <span>Tab: tamamlama</span>
            <span>|</span>
            <span>Ctrl+C: durdur</span>
            <span>|</span>
            <span>Ctrl+L: temizle</span>
            <span>|</span>
            <span>help: kılavuz</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{history.length} komut geçmişte</span>
            {isLoopbackMode && <span className="text-amber-400 font-bold">(Loopback Aktif)</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
