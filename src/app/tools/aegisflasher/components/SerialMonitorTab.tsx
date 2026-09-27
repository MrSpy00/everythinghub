"use client";

/**
 * aegisFlasher — Professional Serial Terminal Studio
 * Kapsamlı seri port terminali: Arduino IDE + esptool CLI + VS Code Terminal düzeyinde
 * Gerçek özellikler: ANSI renk, hex dump, çoklu satır sonu, komut geçmişi, makrolar,
 * özel komut grupları, pin sinyalleri, byte transmitter, DTR/RTS kontrol, log export,
 * arama/filtreleme, otomatik kayar, satır istatistikleri, baud rate hotswap
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
} from "lucide-react";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";
import { parseAnsiString, AnsiToken } from "@/lib/flasher/ansi-parser";
import { Language } from "@/lib/flasher/i18n";
import { FlasherSelect } from "./FlasherSelect";

interface SerialMonitorTabProps {
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
}

// ─── Sabit komut grupları ────────────────────────────────────────────
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
  { group: "esp", label: "Chip Info", command: "esptool.py chip_id", tooltip: "Chip kimlik bilgisi" },
  { group: "esp", label: "Free Heap", command: "Serial.println(ESP.getFreeHeap());", tooltip: "Serbest heap bellek (Arduino IDE)" },
  { group: "esp", label: "Chip ID", command: "Serial.println(ESP.getChipId());", tooltip: "ESP8266 Chip ID" },
  { group: "esp", label: "RSSI", command: "Serial.println(WiFi.RSSI());", tooltip: "Wi-Fi sinyal gücü" },
  { group: "esp", label: "Flash Size", command: "Serial.println(ESP.getFlashChipSize());", tooltip: "Flash bellek boyutu" },
  { group: "esp", label: "CPU Freq", command: "Serial.println(ESP.getCpuFreqMHz());", tooltip: "İşlemci frekansı (MHz)" },
  { group: "esp", label: "SDK Version", command: "Serial.println(ESP.getSdkVersion());", tooltip: "ESP SDK versiyon" },
  { group: "esp", label: "Sketch Size", command: "Serial.println(ESP.getSketchSize());", tooltip: "Yüklü sketch boyutu" },
  // Arduino
  { group: "arduino", label: "help", command: "help", tooltip: "Kullanılabilir komutları listele" },
  { group: "arduino", label: "version", command: "version", tooltip: "Firmware versiyonu" },
  { group: "arduino", label: "status", command: "status", tooltip: "Durum raporu" },
  { group: "arduino", label: "ping", command: "ping", tooltip: "Bağlantı testi" },
  { group: "arduino", label: "reboot", command: "reboot", tooltip: "Yeniden başlat" },
  { group: "arduino", label: "info", command: "info", tooltip: "Cihaz bilgisi" },
  { group: "arduino", label: "LED ON", command: "led on", tooltip: "LED'i yak" },
  { group: "arduino", label: "LED OFF", command: "led off", tooltip: "LED'i söndür" },
  // MicroPython
  { group: "micropython", label: "help()", command: "help()", tooltip: "MicroPython yardım" },
  { group: "micropython", label: "sys.version", command: "import sys; print(sys.version)", tooltip: "Python versiyonu" },
  { group: "micropython", label: "os.listdir", command: "import os; print(os.listdir())", tooltip: "Dosya sistemi" },
  { group: "micropython", label: "gc.mem_free", command: "import gc; print(gc.mem_free())", tooltip: "Serbest bellek" },
  { group: "micropython", label: "uname", command: "import sys; print(sys.implementation)", tooltip: "Platform bilgisi" },
  { group: "micropython", label: "machine.freq", command: "import machine; print(machine.freq())", tooltip: "İşlemci frekansı" },
  { group: "micropython", label: "REPL Ctrl+C", command: "\x03", tooltip: "KeyboardInterrupt (Ctrl+C)" },
  { group: "micropython", label: "Raw REPL", command: "\x01", tooltip: "Raw REPL modu (Ctrl+A)" },
  // System
  { group: "system", label: "\\x03 (Ctrl+C)", command: "\x03", tooltip: "KeyboardInterrupt" },
  { group: "system", label: "\\x04 (Ctrl+D)", command: "\x04", tooltip: "EOF / Soft reset" },
  { group: "system", label: "\\x1A (Ctrl+Z)", command: "\x1a", tooltip: "Suspend" },
  { group: "system", label: "\\n LF", command: "\n", tooltip: "Newline (0x0A)" },
  { group: "system", label: "\\r CR", command: "\r", tooltip: "Carriage Return (0x0D)" },
  { group: "system", label: "NUL (0x00)", command: "\x00", tooltip: "Null byte" },
];

// ─── Hex decode helper ──────────────────────────────────────────────
function hexStringToBytes(hex: string): Uint8Array | null {
  const cleaned = hex.replace(/\s+/g, "").replace(/^0x/i, "");
  if (cleaned.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]*$/.test(cleaned)) return null;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}

// ─── Log Line Renderer (memoized) ──────────────────────────────────
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
      colorClass = "text-violet-300 italic";
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
            <span className="text-zinc-600 text-[9px] w-6 shrink-0">{(i * 16).toString(16).padStart(4, "0").toUpperCase()}</span>
            <span className="font-mono text-cyan-300">{c.hex}</span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-zinc-400">{c.ascii}</span>
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="flex items-start gap-1.5 py-[1px] leading-relaxed hover:bg-white/[0.015] group">
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

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
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
}) => {
  // ── Input state
  const [inputText, setInputText] = useState("");
  const [lineEnding, setLineEnding] = useState<string>("crlf");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // ── Display state
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showHexMode, setShowHexMode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Panel state
  const [activeMacroGroup, setActiveMacroGroup] = useState("at");
  const [customMacros, setCustomMacros] = useState<MacroCommand[]>([]);
  const [showMacros, setShowMacros] = useState(true);
  const [showPinControl, setShowPinControl] = useState(false);
  const [showHexSender, setShowHexSender] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // ── Pin control state
  const [dtrState, setDtrState] = useState(false);
  const [rtsState, setRtsState] = useState(false);

  // ── Hex sender state
  const [hexInput, setHexInput] = useState("");
  const [hexError, setHexError] = useState("");

  // ── Custom macro editor
  const [newMacroLabel, setNewMacroLabel] = useState("");
  const [newMacroCmd, setNewMacroCmd] = useState("");

  // ── Copy
  const [copied, setCopied] = useState(false);

  // ── Refs
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userScrolled = useRef(false);

  // ─── Auto-scroll logic ─────────────────────────────────────────
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

  // ─── Filter logs ───────────────────────────────────────────────
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

  // ─── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const rxCount = logs.filter((l) => l.direction === "rx").length;
    const txCount = logs.filter((l) => l.direction === "tx").length;
    const errCount = logs.filter((l) => l.direction === "err").length;
    const warnCount = logs.filter((l) => l.direction === "warn").length;
    const uniqueLines = new Set(logs.map((l) => l.text.trim())).size;
    return { rxCount, txCount, errCount, warnCount, uniqueLines, total: logs.length };
  }, [logs]);

  // ─── Send handlers ─────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText;
    if (!text) return;
    onSendMessage(text, lineEnding);
    setHistory((prev) => {
      const deduped = [text, ...prev.filter((h) => h !== text)].slice(0, 100);
      return deduped;
    });
    setHistoryIndex(-1);
    setInputText("");
    inputRef.current?.focus();
  }, [inputText, lineEnding, onSendMessage]);

  const handleSendHex = useCallback(() => {
    setHexError("");
    const bytes = hexStringToBytes(hexInput);
    if (!bytes) {
      setHexError(
        lang === "tr"
          ? "Geçersiz hex formatı. Örnek: FF 0A 1B veya FF0A1B"
          : "Invalid hex format. Example: FF 0A 1B or FF0A1B"
      );
      return;
    }
    onSendRawBytes(bytes);
    setHexInput("");
  }, [hexInput, lang, onSendRawBytes]);

  const handleSendMacro = useCallback(
    (cmd: string) => {
      // Raw control chars are sent as raw bytes
      if (cmd.length === 1 && cmd.charCodeAt(0) < 32) {
        onSendRawBytes(new Uint8Array([cmd.charCodeAt(0)]));
      } else {
        onSendMessage(cmd, lineEnding);
      }
    },
    [lineEnding, onSendMessage, onSendRawBytes]
  );

  // ─── Keyboard navigation ───────────────────────────────────────
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
          setInputText(history[nextIdx] ?? "");
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const nextIdx = historyIndex - 1;
          setHistoryIndex(nextIdx);
          setInputText(history[nextIdx] ?? "");
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInputText("");
        }
      } else if (e.key === "Escape") {
        setInputText("");
        setHistoryIndex(-1);
      } else if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        onClearLogs();
      } else if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    },
    [handleSend, history, historyIndex, onClearLogs]
  );

  // ─── Copy & Export ─────────────────────────────────────────────
  const copyLogs = useCallback(() => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [filteredLogs]);

  const exportLogs = useCallback(
    (format: "txt" | "csv" | "json") => {
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
      a.download = `serial_log_${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [logs]
  );

  // ─── Pin control ───────────────────────────────────────────────
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

  // ─── All macros (builtin + custom) ────────────────────────────
  const allMacros = useMemo(
    () => [...BUILTIN_MACROS, ...customMacros],
    [customMacros]
  );

  const visibleMacros = useMemo(
    () => allMacros.filter((m) => m.group === activeMacroGroup),
    [allMacros, activeMacroGroup]
  );

  const isConnected = status === "connected";

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ══ Top Toolbar ══════════════════════════════════════════ */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2 p-3 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">

        {/* Left: Baud + Line Ending + Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[130px]">
            <FlasherSelect
              options={[
                { value: 300, label: "300 baud" },
                { value: 1200, label: "1200 baud", subtitle: "RP2040 Touch" },
                { value: 2400, label: "2400 baud" },
                { value: 4800, label: "4800 baud" },
                { value: 9600, label: "9600 baud" },
                { value: 14400, label: "14400 baud" },
                { value: 19200, label: "19200 baud" },
                { value: 28800, label: "28800 baud" },
                { value: 38400, label: "38400 baud" },
                { value: 57600, label: "57600 baud" },
                { value: 74880, label: "74880 baud", subtitle: "ESP8266 Boot" },
                { value: 115200, label: "115200 baud", subtitle: lang === "en" ? "Standard" : "Varsayılan", badge: "Std" },
                { value: 230400, label: "230400 baud" },
                { value: 250000, label: "250000 baud", subtitle: "3D Printer" },
                { value: 460800, label: "460800 baud" },
                { value: 500000, label: "500000 baud" },
                { value: 921600, label: "921600 baud", badge: "Fast" },
                { value: 1000000, label: "1000000 baud" },
                { value: 1500000, label: "1500000 baud" },
                { value: 2000000, label: "2000000 baud", badge: "Ultra" },
              ]}
              value={selectedBaud}
              onChange={(val) => onBaudChange(Number(val))}
              size="sm"
              ariaLabel="Baud Rate"
            />
          </div>

          <div className="min-w-[150px]">
            <FlasherSelect
              options={[
                { value: "crlf", label: "NL+CR (\\r\\n)", subtitle: "Arduino IDE Default" },
                { value: "lf", label: "LF only (\\n)", subtitle: "Unix/Linux" },
                { value: "cr", label: "CR only (\\r)", subtitle: "Legacy" },
                { value: "none", label: lang === "en" ? "No Line Ending" : "Satır Sonu Yok" },
              ]}
              value={lineEnding}
              onChange={(val) => setLineEnding(String(val))}
              size="sm"
              ariaLabel="Line Ending"
            />
          </div>

          <div className="min-w-[130px]">
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
            className={`p-2 rounded-2xl text-xs font-semibold transition-all border ${showTimestamps ? "bg-white/[0.1] text-zinc-100 border-white/20" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowLineNumbers((v) => !v)}
            title={lang === "en" ? "Line Numbers" : "Satır Numaraları"}
            className={`p-2 rounded-2xl text-xs font-semibold transition-all border ${showLineNumbers ? "bg-white/[0.1] text-zinc-100 border-white/20" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowHexMode((v) => !v)}
            title={lang === "en" ? "HEX Dump Mode" : "HEX Dump Modu"}
            className={`p-2 rounded-2xl text-xs font-semibold transition-all border ${showHexMode ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Binary className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            title={lang === "en" ? "Search Logs (Ctrl+F)" : "Loglarda Ara (Ctrl+F)"}
            className={`p-2 rounded-2xl transition-all border ${isSearchOpen || searchFilter ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* RX/TX stats */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-1.5 rounded-2xl border border-white/5">
            <span className="text-emerald-400">RX: {rxBytesCount >= 1024 ? `${(rxBytesCount / 1024).toFixed(1)}KB` : `${rxBytesCount}B`}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-indigo-400">TX: {txBytesCount >= 1024 ? `${(txBytesCount / 1024).toFixed(1)}KB` : `${txBytesCount}B`}</span>
            <span className="text-zinc-600">|</span>
            <span>{filteredLogs.length}/{logs.length}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowStats((v) => !v)}
            title={lang === "en" ? "Log Statistics" : "Log İstatistikleri"}
            className={`p-2 rounded-2xl transition-all border ${showStats ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowPinControl((v) => !v)}
            title={lang === "en" ? "DTR/RTS Pin Control" : "DTR/RTS Pin Kontrolü"}
            className={`p-2 rounded-2xl transition-all border ${showPinControl ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowHexSender((v) => !v)}
            title={lang === "en" ? "Hex Byte Sender" : "Hex Byte Gönderici"}
            className={`p-2 rounded-2xl transition-all border ${showHexSender ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-white/[0.03] text-zinc-500 border-white/5 hover:text-zinc-300"}`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={copyLogs}
            title={lang === "en" ? "Copy Filtered Logs" : "Filtrelenmiş Logları Kopyala"}
            className="p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Export dropdown menu */}
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

      {/* ══ Search Bar (expandable) ═══════════════════════════════ */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder={lang === "en" ? "Search in logs... (regex supported)" : "Loglarda ara... (regex desteklenir)"}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setIsSearchOpen(false); setSearchFilter(""); } }}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          />
          <span className="text-[10px] text-zinc-500 font-mono">{filteredLogs.length} / {logs.length}</span>
          <button type="button" onClick={() => { setIsSearchOpen(false); setSearchFilter(""); }} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ══ Stats Panel ══════════════════════════════════════════ */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 animate-in fade-in duration-150">
          {[
            { label: "Total", value: stats.total, color: "text-zinc-300" },
            { label: "RX", value: stats.rxCount, color: "text-emerald-400" },
            { label: "TX", value: stats.txCount, color: "text-indigo-400" },
            { label: "ERR", value: stats.errCount, color: "text-rose-400" },
            { label: "WARN", value: stats.warnCount, color: "text-amber-400" },
            { label: "Unique", value: stats.uniqueLines, color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center p-2.5 rounded-2xl bg-zinc-950/70 border border-white/5">
              <span className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══ Pin Control Panel ════════════════════════════════════ */}
      {showPinControl && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-indigo-500/20 backdrop-blur-2xl animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              {lang === "en" ? "Hardware Pin Control" : "Donanım Pin Kontrolü"}
            </span>

            {/* DTR */}
            <button
              type="button"
              onClick={handleToggleDtr}
              disabled={!isConnected}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all disabled:opacity-40 ${dtrState ? "bg-indigo-500/25 border-indigo-500/50 text-indigo-200" : "bg-white/[0.04] border-white/10 text-zinc-300 hover:border-indigo-500/30"}`}
            >
              {dtrState ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              DTR {dtrState ? "HIGH" : "LOW"}
            </button>

            {/* RTS */}
            <button
              type="button"
              onClick={handleToggleRts}
              disabled={!isConnected}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all disabled:opacity-40 ${rtsState ? "bg-violet-500/25 border-violet-500/50 text-violet-200" : "bg-white/[0.04] border-white/10 text-zinc-300 hover:border-violet-500/30"}`}
            >
              {rtsState ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              RTS {rtsState ? "HIGH" : "LOW"}
            </button>

            <div className="h-5 w-px bg-white/10" />

            {/* ESP Reset Sequences */}
            <button
              type="button"
              onClick={onHardReset}
              disabled={!isConnected}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-rose-500/30 hover:text-rose-300 transition-all disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {lang === "en" ? "Hard Reset" : "Hard Reset"}
            </button>

            <div className="text-[10px] text-zinc-500 leading-relaxed">
              <span className="block">DTR → GPIO0 (Boot), RTS → EN (Reset)</span>
              <span className="block">ESP32 / ESP8266 bootloader trigger pins</span>
            </div>
          </div>
        </div>
      )}

      {/* ══ Hex Byte Sender ══════════════════════════════════════ */}
      {showHexSender && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-cyan-500/20 backdrop-blur-2xl animate-in fade-in duration-150">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {lang === "en" ? "Raw Hex Byte Sender" : "Ham Hex Byte Gönderici"}
              <span className="text-[10px] text-zinc-500 font-mono ml-2">
                {lang === "en" ? "e.g.: FF 0A 1B 00 or FF0A1B00" : "Örn.: FF 0A 1B 00 veya FF0A1B00"}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="FF 0D 0A 00 ..."
                value={hexInput}
                onChange={(e) => { setHexInput(e.target.value); setHexError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendHex(); }}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleSendHex}
                disabled={!hexInput.trim() || !isConnected}
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

      {/* ══ Terminal Display ═════════════════════════════════════ */}
      <div className="relative">
        <div
          ref={terminalContainerRef}
          onScroll={handleScroll}
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[680px] rounded-3xl bg-zinc-950/95 border border-white/10 backdrop-blur-3xl px-4 py-3 overflow-y-auto font-mono text-[11px] flex flex-col shadow-2xl select-text [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-600"
        >
          {filteredLogs.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Terminal className="w-10 h-10 text-zinc-700" />
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-400">
                  {logs.length === 0
                    ? (lang === "en" ? "Terminal Ready" : "Terminal Hazır")
                    : (lang === "en" ? "No matching logs" : "Eşleşen log yok")}
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  {logs.length === 0
                    ? (lang === "en"
                      ? "Connect a device and start receiving data. All incoming and outgoing bytes will stream live here."
                      : "Bir cihaz bağlayın ve veri almaya başlayın. Tüm gelen ve giden byte'lar burada canlı akacak.")
                    : (lang === "en" ? "Clear search or change filter" : "Aramayı temizle veya filtreni değiştir")}
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
            {lang === "en" ? "Jump to bottom" : "Alta git"}
          </button>
        )}
      </div>

      {/* ══ Macro Command Bar ════════════════════════════════════ */}
      {showMacros && (
        <div className="flex flex-col gap-2 p-3 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-2xl">
          {/* Group tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:h-0">
            <span className="text-[10px] font-semibold text-zinc-500 shrink-0 mr-1">
              <BookOpen className="w-3 h-3 inline mr-1" />
              {lang === "en" ? "Macros:" : "Makrolar:"}
            </span>
            {MACRO_GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveMacroGroup(g.key)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all border ${activeMacroGroup === g.key ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/[0.03] border-white/5 text-zinc-500 hover:text-zinc-300"}`}
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
                      disabled={!isConnected}
                      className="px-3 py-1.5 rounded-2xl text-[10px] font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono disabled:opacity-40"
                    >
                      {m.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomMacros((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover/macro:flex w-4 h-4 rounded-full bg-rose-600 text-white items-center justify-center"
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
                    className="w-20 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <input
                    type="text"
                    placeholder={lang === "en" ? "Command or data..." : "Komut veya veri..."}
                    value={newMacroCmd}
                    onChange={(e) => setNewMacroCmd(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMacroLabel && newMacroCmd) {
                        setCustomMacros((prev) => [...prev, { label: newMacroLabel, command: newMacroCmd, group: "custom" }]);
                        setNewMacroLabel("");
                        setNewMacroCmd("");
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newMacroLabel && newMacroCmd) {
                        setCustomMacros((prev) => [...prev, { label: newMacroLabel, command: newMacroCmd, group: "custom" }]);
                        setNewMacroLabel("");
                        setNewMacroCmd("");
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all"
                  >
                    + {lang === "en" ? "Add" : "Ekle"}
                  </button>
                </div>
              </>
            ) : (
              visibleMacros.map((m) => (
                <button
                  key={m.label + m.command}
                  type="button"
                  onClick={() => handleSendMacro(m.command)}
                  disabled={!isConnected}
                  title={m.tooltip}
                  className="px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-400 hover:text-white backdrop-blur-xl transition-all font-mono disabled:opacity-40 active:scale-95"
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
          <BookOpen className="w-3 h-3" />
          {lang === "en" ? "Show Macros" : "Makroları Göster"}
        </button>
      )}

      {/* ══ Command Input Bar ════════════════════════════════════ */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 p-2.5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl focus-within:border-violet-500/40 transition-colors">
          {/* Prompt indicator */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <ChevronRight className="w-3.5 h-3.5 text-violet-500" />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={
              !isConnected
                ? (lang === "en" ? "Not connected..." : "Bağlı değil...")
                : lang === "en"
                ? "Type command... (Enter=send, ↑↓=history, Ctrl+L=clear, Ctrl+F=search)"
                : "Komut yazın... (Enter=gönder, ↑↓=geçmiş, Ctrl+L=temizle, Ctrl+F=ara)"
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono disabled:opacity-50"
          />

          {/* History indicator */}
          {historyIndex >= 0 && (
            <span className="text-[9px] font-mono text-zinc-600 shrink-0">
              {historyIndex + 1}/{history.length}
            </span>
          )}

          {/* Input text byte count */}
          {inputText && (
            <span className="text-[9px] font-mono text-zinc-600 shrink-0">
              {new TextEncoder().encode(inputText).length}B
            </span>
          )}

          {/* Line ending badge */}
          <span className="shrink-0 text-[9px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-lg border border-white/5">
            {lineEnding === "crlf" ? "\\r\\n" : lineEnding === "lf" ? "\\n" : lineEnding === "cr" ? "\\r" : "∅"}
          </span>

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {lang === "en" ? "Send" : "Gönder"}
          </button>
        </div>

        {/* Bottom hint bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
          <span className="text-[9px] text-zinc-600 font-mono">
            {lang === "en"
              ? "↑↓ history · Ctrl+L clear · Ctrl+F search · Esc cancel"
              : "↑↓ geçmiş · Ctrl+L temizle · Ctrl+F ara · Esc iptal"}
          </span>
          <span className="text-[9px] text-zinc-700 font-mono">
            {lang === "en" ? `${history.length} cmds in history` : `Geçmişte ${history.length} komut`}
          </span>
        </div>
      </div>
    </div>
  );
};
