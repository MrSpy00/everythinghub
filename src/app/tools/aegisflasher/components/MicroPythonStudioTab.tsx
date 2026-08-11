"use client";

import React, { useState } from "react";
import {
  FileCode,
  Folder,
  Play,
  Save,
  Trash2,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Terminal,
  Cpu,
  Sparkles,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { ConnectionStatus, SerialLogMessage } from "@/lib/flasher/types";
import { Language, useTranslation } from "@/lib/flasher/i18n";

interface MicroPythonStudioTabProps {
  status: ConnectionStatus;
  logs: SerialLogMessage[];
  onSendMessage: (text: string, lineEnding: string) => void;
  lang: Language;
}

interface RemoteFile {
  name: string;
  sizeBytes: number;
  isDir: boolean;
}

const DEFAULT_FILES: RemoteFile[] = [
  { name: "boot.py", sizeBytes: 154, isDir: false },
  { name: "main.py", sizeBytes: 540, isDir: false },
  { name: "config.json", sizeBytes: 88, isDir: false },
  { name: "lib", sizeBytes: 0, isDir: true },
];

const SAMPLE_MAIN_PY = `# MicroPython aegisStudio Live Script
import machine
import time

led = machine.Pin(2, machine.Pin.OUT)
print("[aegisStudio] Heartbeat Script Started on ESP32/Pico!")

for i in range(10):
    led.value(1)
    time.sleep(0.2)
    led.value(0)
    time.sleep(0.2)
    print(f"Cycle {i+1}/10: LED toggled successfully.")

print("[aegisStudio] Diagnostic routine complete.")
`;

export const MicroPythonStudioTab: React.FC<MicroPythonStudioTabProps> = ({
  status,
  logs,
  onSendMessage,
  lang,
}) => {
  const t = useTranslation(lang);
  const [fileList, setFileList] = useState<RemoteFile[]>(DEFAULT_FILES);
  const [activeFileName, setActiveFileName] = useState<string>("main.py");
  const [codeContent, setCodeContent] = useState<string>(SAMPLE_MAIN_PY);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inRawRepl, setInRawRepl] = useState<boolean>(false);

  // Send Raw REPL sequence to run code
  const handleSaveAndRun = () => {
    if (status !== "connected") {
      toast.error("Önce seri port üzerinden karta bağlanmalısınız.");
      return;
    }

    setIsRunning(true);
    toast.info("MicroPython Raw REPL moduna geçiliyor ve kod yükleniyor...");

    // Send Ctrl-C (Interrupt), Ctrl-A (Raw REPL), Send code, Ctrl-D (Soft Reboot & Run), Ctrl-B (Exit Raw REPL)
    onSendMessage("\x03\x03", "none");
    setTimeout(() => {
      onSendMessage("\x01", "none"); // Enter raw REPL
      setTimeout(() => {
        onSendMessage(codeContent, "none");
        setTimeout(() => {
          onSendMessage("\x04", "none"); // Execute
          setTimeout(() => {
            onSendMessage("\x02", "none"); // Exit raw REPL
            setIsRunning(false);
            toast.success("Kod cihaza yüklendi ve çalıştırılıyor!");
          }, 300);
        }, 300);
      }, 200);
    }, 200);
  };

  const handleCreateNewFile = () => {
    const filename = prompt("Yeni dosya adı girin (Örn: sensor.py, config.json):", "script.py");
    if (!filename) return;

    setFileList((prev) => [...prev, { name: filename, sizeBytes: 0, isDir: false }]);
    setActiveFileName(filename);
    setCodeContent(`# ${filename}\nprint("Running ${filename}...")\n`);
    toast.success(`'${filename}' oluşturuldu.`);
  };

  const handleDeleteFile = (name: string) => {
    if (confirm(`'${name}' dosyasını silmek istediğinize emin misiniz?`)) {
      setFileList(fileList.filter((f) => f.name !== name));
      if (activeFileName === name) {
        setActiveFileName("main.py");
        setCodeContent(SAMPLE_MAIN_PY);
      }
      toast.success(`'${name}' silindi.`);
    }
  };

  const handleDownloadFileLocally = () => {
    const blob = new Blob([codeContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`'${activeFileName}' bilgisayarınıza indirildi.`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-zinc-100 flex items-center gap-2">
              {t("mpy_title")}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Python 3 / Raw REPL
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("mpy_desc")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAndRun}
            disabled={isRunning || status !== "connected"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-amber-600/30 hover:bg-amber-600/45 border border-amber-500/50 backdrop-blur-xl shadow-xl transition-all active:scale-95 disabled:opacity-40"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
            )}
            <span>{t("mpy_save_and_run")}</span>
          </button>
        </div>
      </div>

      {/* Main IDE Workspace: Left File Tree | Right Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Remote Filesystem Tree */}
        <div className="lg:col-span-1 flex flex-col p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-400" />
              {t("mpy_file_tree")}
            </span>
            <button
              type="button"
              onClick={handleCreateNewFile}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all"
              title={t("mpy_new_file")}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {fileList.map((file) => (
              <div
                key={file.name}
                onClick={() => {
                  if (!file.isDir) setActiveFileName(file.name);
                }}
                className={`group cursor-pointer flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  activeFileName === file.name
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-sm"
                    : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-900/90 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {file.isDir ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                  <span className="text-xs font-mono font-medium truncate">{file.name}</span>
                </div>

                {!file.isDir && file.name !== "main.py" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Code Editor & Live Terminal */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-400" />
                {activeFileName}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                ({codeContent.split("\n").length} satır • {new TextEncoder().encode(codeContent).length} bayt)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadFileLocally}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
                title="Yerel Olarak İndir"
              >
                <Download className="w-3.5 h-3.5" />
                İndir
              </button>
            </div>
          </div>

          {/* Code Textarea Area */}
          <div className="relative w-full rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-3xl p-4 shadow-2xl flex flex-col">
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder={t("mpy_editor_placeholder")}
              className="w-full h-80 bg-transparent text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Live REPL Output Log Screen */}
          <div className="flex flex-col p-4 rounded-3xl bg-zinc-950/90 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                {t("mpy_terminal_output")}
              </span>
            </div>
            <div className="w-full h-32 overflow-y-auto font-mono text-xs text-emerald-300/90 flex flex-col gap-0.5">
              {logs.slice(-15).map((l) => (
                <div key={l.id} className="leading-tight">
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
