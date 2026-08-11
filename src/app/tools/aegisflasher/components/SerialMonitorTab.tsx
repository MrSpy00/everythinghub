"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";

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
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const logsEndRef = useRef<HTMLDivElement>(null);

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
    const fullText = logs.map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportLogs = () => {
    const fullText = logs.map((l) => `[${l.timestamp}] [${l.direction.toUpperCase()}] ${l.text}`).join("\n");
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegisFlasher_serial_log_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ANSI escape sequences styling helper
  const renderLogLine = (log: SerialLogMessage) => {
    let colorClass = "text-zinc-200";
    if (log.direction === "err") colorClass = "text-rose-400 font-semibold";
    else if (log.direction === "warn") colorClass = "text-amber-400";
    else if (log.direction === "success") colorClass = "text-emerald-400 font-semibold";
    else if (log.direction === "sys") colorClass = "text-violet-400";
    else if (log.direction === "tx") colorClass = "text-cyan-400";

    return (
      <div key={log.id} className="flex items-start gap-2 py-0.5 font-mono text-xs leading-relaxed hover:bg-white/[0.02] px-1 rounded">
        {showTimestamps && (
          <span className="text-[10px] text-zinc-500 select-none font-mono shrink-0">
            [{log.timestamp}]
          </span>
        )}
        <span
          className={`shrink-0 text-[10px] uppercase font-bold select-none px-1 rounded ${
            log.direction === "tx"
              ? "bg-cyan-500/15 text-cyan-400"
              : log.direction === "rx"
              ? "bg-zinc-800 text-zinc-400"
              : log.direction === "sys"
              ? "bg-violet-500/15 text-violet-400"
              : log.direction === "err"
              ? "bg-rose-500/15 text-rose-400"
              : log.direction === "warn"
              ? "bg-amber-500/15 text-amber-400"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {log.direction}
        </span>
        <span className={`break-all whitespace-pre-wrap flex-1 ${colorClass}`}>
          {log.text}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-2xl">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Baud Rate */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <select
              aria-label="Seri Monitör Aktif Baud Hızı"
              value={selectedBaud}
              onChange={(e) => onBaudChange(Number(e.target.value))}
              className="bg-transparent text-zinc-200 focus:outline-none text-xs"
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
          </div>

          {/* Line Ending */}
          <select
            aria-label="Satır Sonu Karakteri Seçimi"
            value={lineEnding}
            onChange={(e) => setLineEnding(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="crlf">Hem NL hem CR (\r\n)</option>
            <option value="lf">Yalnızca NL (\n)</option>
            <option value="cr">Yalnızca CR (\r)</option>
            <option value="none">Satır Sonu Yok</option>
          </select>

          {/* Toggles */}
          <button
            type="button"
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
              showTimestamps
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-zinc-900 text-zinc-400 border border-white/5"
            }`}
          >
            <Clock className="w-3 h-3" />
            Zaman
          </button>

          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
              autoScroll
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-zinc-900 text-zinc-400 border border-white/5"
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            Oto-Kaydır
          </button>
        </div>

        {/* Right Action Icons & Metrics */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-white/5">
            <span>RX: {(rxBytesCount / 1024).toFixed(1)}KB</span>
            <span>•</span>
            <span>TX: {(txBytesCount / 1024).toFixed(1)}KB</span>
          </div>

          <button
            type="button"
            onClick={copyLogs}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
            title="Tüm Logları Kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={exportLogs}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
            title="Log Dosyasını İndir (.log)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Terminali Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Display Screen */}
      <div className="relative w-full h-[460px] rounded-3xl bg-zinc-950/90 border border-white/10 backdrop-blur-3xl p-4 overflow-y-auto font-mono text-xs flex flex-col shadow-inner select-text">
        {logs.length === 0 ? (
          <div className="m-auto flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
            <Terminal className="w-8 h-8 text-zinc-600 animate-pulse" />
            <span>Seri monitör hazır. Cihaza bağlanıldığında loglar burada canlı akacaktır.</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {logs.map(renderLogLine)}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Quick Macro Buttons Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-zinc-400 mr-1">Hızlı Komutlar:</span>
        <button
          type="button"
          onClick={onHardReset}
          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all"
        >
          Reset (EN)
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("AT", lineEnding)}
          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all font-mono"
        >
          AT
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("AT+GMR", lineEnding)}
          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all font-mono"
        >
          AT+GMR
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("AT+CWLAP", lineEnding)}
          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all font-mono"
        >
          AT+CWLAP
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("help", lineEnding)}
          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all font-mono"
        >
          help
        </button>
        <button
          type="button"
          onClick={() => onSendMessage("version", lineEnding)}
          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-zinc-900 border border-white/10 hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all font-mono"
        >
          version
        </button>
      </div>

      {/* Bottom Command Input Bar */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-2xl">
        <input
          type="text"
          placeholder="Seri porta komut veya veri gönder (Örn: AT, help, wifi setup)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 hover:border-violet-400 transition-all disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5 text-violet-300" />
          Gönder
        </button>
      </div>
    </div>
  );
};
