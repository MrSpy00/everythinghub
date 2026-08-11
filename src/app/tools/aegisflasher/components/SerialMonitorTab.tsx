"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal,
  Send,
  Trash2,
  Copy,
  Download,
  Clock,
  Binary,
  ArrowDown,
  RefreshCw,
  Zap,
  Sliders,
  Check,
  Search,
  Pause,
  Play,
  Filter,
  ChevronDown,
} from "lucide-react";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";
import { parseAnsiString, AnsiToken } from "@/lib/flasher/ansi-parser";

interface SerialMonitorTabProps {
  status: ConnectionStatus;
  logs: SerialLogMessage[];
  onSendMessage: (text: string, lineEnding: string) => void;
  onClearLogs: () => void;
  onHardReset: () => void;
  selectedBaud: number;
  onBaudChange: (baud: number) => void;
  rxBytesCount: number;
  txBytesCount: number;
}

export const SerialMonitorTab: React.FC<SerialMonitorTabProps> = ({
  status,
  logs,
  onSendMessage,
  onClearLogs,
  onHardReset,
  selectedBaud,
  onBaudChange,
  rxBytesCount,
  txBytesCount,
}) => {
  const [inputText, setInputText] = useState("");
  const [lineEnding, setLineEnding] = useState<string>("crlf"); // 'crlf' | 'lf' | 'cr' | 'none'
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);
  const [showHexMode, setShowHexMode] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleSend = () => {
    if (!inputText) return;
    onSendMessage(inputText, lineEnding);
    setHistory((prev) => [inputText, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        setInputText(history[nextIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputText(history[nextIdx] || "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputText("");
      }
    }
  };

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `serial_monitor_log_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert string to hex view string
  const formatHex = (str: string, rawBytes?: Uint8Array) => {
    const bytes = rawBytes || new TextEncoder().encode(str);
    const hexParts: string[] = [];
    const asciiParts: string[] = [];

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      hexParts.push(byte.toString(16).padStart(2, "0").toUpperCase());
      asciiParts.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".");
    }

    return (
      <span className="flex flex-wrap items-center gap-2 text-zinc-400">
        <span className="font-mono text-cyan-300 font-bold">{hexParts.join(" ")}</span>
        <span className="text-zinc-600">|</span>
        <span className="font-mono text-zinc-300">{asciiParts.join("")}</span>
      </span>
    );
  };

  // Filter logs by search and severity
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterSeverity !== "all" && log.direction !== filterSeverity) {
        return false;
      }
      if (searchFilter.trim() !== "") {
        const query = searchFilter.toLowerCase();
        return (
          log.text.toLowerCase().includes(query) ||
          log.direction.toLowerCase().includes(query) ||
          log.timestamp.includes(query)
        );
      }
      return true;
    });
  }, [logs, filterSeverity, searchFilter]);

  // Render ANSI tokenized line
  const renderAnsiContent = (text: string) => {
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

  const renderLogLine = (log: SerialLogMessage) => {
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

    return (
      <div key={log.id} className="flex items-start gap-2 py-0.5 leading-relaxed hover:bg-white/[0.02]">
        {showTimestamps && (
          <span className="text-[10px] font-mono text-zinc-500 select-none shrink-0 pt-0.5">
            {log.timestamp}
          </span>
        )}
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${badgeClass} select-none`}
        >
          {log.direction}
        </span>
        <div className={`flex-1 break-all whitespace-pre-wrap font-mono ${colorClass}`}>
          {showHexMode ? formatHex(log.text, log.rawBytes) : renderAnsiContent(log.text)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Baud Rate */}
          <div className="relative">
            <select
              aria-label="Seri Monitör Aktif Baud Hızı"
              value={selectedBaud}
              onChange={(e) => onBaudChange(Number(e.target.value))}
              className="appearance-none bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-8 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value={9600}>9600 baud</option>
              <option value={19200}>19200 baud</option>
              <option value={38400}>38400 baud</option>
              <option value={57600}>57600 baud</option>
              <option value={74880}>74880 baud (ESP8266 Boot)</option>
              <option value={115200}>115200 baud (Varsayılan)</option>
              <option value={230400}>230400 baud</option>
              <option value={460800}>460800 baud</option>
              <option value={921600}>921600 baud</option>
              <option value={1500000}>1500000 baud</option>
              <option value={2000000}>2000000 baud</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* Line Ending */}
          <div className="relative">
            <select
              aria-label="Satır Sonu Karakteri Seçimi"
              value={lineEnding}
              onChange={(e) => setLineEnding(e.target.value)}
              className="appearance-none bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-8 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="crlf">Hem NL hem CR (\r\n)</option>
              <option value="lf">Yalnızca NL (\n)</option>
              <option value="cr">Yalnızca CR (\r)</option>
              <option value="none">Satır Sonu Yok</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* Direction Filter */}
          <div className="relative">
            <select
              aria-label="Log Yönü ve Önem Derecesi Filtresi"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="appearance-none bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-8 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">Tüm Loglar</option>
              <option value="rx">Gelen (RX)</option>
              <option value="tx">Giden (TX)</option>
              <option value="err">Hatalar (ERR)</option>
              <option value="warn">Uyarılar (WARN)</option>
              <option value="sys">Sistem (SYS)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* Timestamps Toggle */}
          <button
            type="button"
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
              showTimestamps
                ? "bg-white/[0.1] text-zinc-100 border border-white/20 shadow-md backdrop-blur-xl"
                : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-white/[0.06]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Zaman
          </button>

          {/* Hex View Mode Toggle */}
          <button
            type="button"
            onClick={() => setShowHexMode(!showHexMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
              showHexMode
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md backdrop-blur-xl"
                : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-white/[0.06]"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            HEX Modu
          </button>

          {/* Auto Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
              autoScroll
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md backdrop-blur-xl"
                : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-white/[0.06]"
            }`}
          >
            {autoScroll ? <ArrowDown className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {autoScroll ? "Oto-Kaydır" : "Durduruldu"}
          </button>
        </div>

        {/* Right Action Icons & Metrics */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Loglarda filtrele..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none w-36 focus:w-48 transition-all"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-2xl border border-white/5">
            <span>RX: {(rxBytesCount / 1024).toFixed(1)}KB</span>
            <span>•</span>
            <span>TX: {(txBytesCount / 1024).toFixed(1)}KB</span>
          </div>

          <button
            type="button"
            onClick={copyLogs}
            className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] backdrop-blur-xl transition-all shadow-md active:scale-95"
            title="Tüm Logları Kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={exportLogs}
            className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] backdrop-blur-xl transition-all shadow-md active:scale-95"
            title="Log Dosyasını İndir (.log)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 backdrop-blur-xl transition-all shadow-md active:scale-95"
            title="Terminali Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Display Screen */}
      <div
        ref={terminalContainerRef}
        className="relative w-full h-[480px] rounded-3xl bg-zinc-950/90 border border-white/10 backdrop-blur-3xl p-5 overflow-y-auto font-mono text-xs flex flex-col shadow-2xl select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="m-auto flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
            <Terminal className="w-8 h-8 text-zinc-600 animate-pulse" />
            <span>
              {logs.length === 0
                ? "Seri monitör hazır. Cihaza bağlanıldığında loglar burada canlı akacaktır."
                : "Filtre kriterlerine uygun log bulunamadı."}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredLogs.map(renderLogLine)}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Quick Macro Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-zinc-400 mr-1">Hızlı Komutlar:</span>
        <button
          type="button"
          onClick={onHardReset}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all active:scale-95"
        >
          Reset (EN)
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("AT", lineEnding)}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
        >
          AT
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("AT+GMR", lineEnding)}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
        >
          AT+GMR
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("AT+CWLAP", lineEnding)}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
        >
          AT+CWLAP (Wi-Fi Tara)
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("help", lineEnding)}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
        >
          help
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("version", lineEnding)}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
        >
          version
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("wifi", lineEnding)}
          className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white backdrop-blur-xl transition-all font-mono active:scale-95"
        >
          wifi
        </button>
      </div>

      {/* Bottom Command Input Bar */}
      <div className="flex items-center gap-2 p-3 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <input
          type="text"
          placeholder="Komut veya veri yazın... (Geçmiş için Yukarı/Aşağı ok, göndermek için Enter)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/40 backdrop-blur-xl shadow-lg transition-all active:scale-95 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          Gönder
        </button>
      </div>
    </div>
  );
};
