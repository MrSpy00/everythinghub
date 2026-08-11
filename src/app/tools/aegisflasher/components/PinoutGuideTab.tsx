"use client";

import React, { useState } from "react";
import {
  Cpu,
  ShieldAlert,
} from "lucide-react";
import { BOARD_PINOUTS } from "@/lib/flasher/pinout-catalog";
import { Language, useTranslation } from "@/lib/flasher/i18n";

interface PinoutGuideTabProps {
  lang?: Language;
}

export const PinoutGuideTab: React.FC<PinoutGuideTabProps> = ({
  lang = "tr",
}) => {
  const t = useTranslation(lang);
  const [selectedBoardId, setSelectedBoardId] = useState(BOARD_PINOUTS[0].id);

  const currentBoard =
    BOARD_PINOUTS.find((b) => b.id === selectedBoardId) || BOARD_PINOUTS[0];

  const leftPins = currentBoard.pins.filter((p) => p.physicalPosition === "left");
  const rightPins = currentBoard.pins.filter((p) => p.physicalPosition === "right");

  const getPinColorBadge = (color: string) => {
    switch (color) {
      case "power":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "ground":
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
      case "analog":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "dac":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "strapping":
        return "bg-purple-500/25 text-purple-300 border-purple-500/40 font-bold";
      case "touch":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "comm":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-zinc-900 text-zinc-300 border-white/10";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Board Selector Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <Cpu className="w-4 h-4 text-violet-400" />
          {t("pinout_select_board")}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {BOARD_PINOUTS.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => setSelectedBoardId(board.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                selectedBoardId === board.id
                  ? "bg-white/[0.1] text-zinc-100 border border-white/20 shadow-md backdrop-blur-xl scale-[1.02]"
                  : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-white/[0.06]"
              }`}
            >
              {board.name.split("(")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Board Summary Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-5 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">{t("form_factor")}</span>
          <span className="text-xs font-bold text-zinc-200 truncate">{currentBoard.formFactor}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">{t("operating_voltage")}</span>
          <span className="text-xs font-bold text-emerald-400">{currentBoard.operatingVoltage}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">{t("input_voltage")}</span>
          <span className="text-xs font-mono text-zinc-200">{currentBoard.inputVoltage}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">{t("total_gpios")}</span>
          <span className="text-xs font-bold text-zinc-100">{currentBoard.totalGpios} Pin</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">ADC / DAC</span>
          <span className="text-xs font-mono text-zinc-200">
            {currentBoard.adcPins} ADC {currentBoard.dacPins ? `/ ${currentBoard.dacPins} DAC` : ""}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">{t("interfaces")}</span>
          <span className="text-[11px] text-zinc-300 truncate" title={currentBoard.interfaces.join(", ")}>
            {currentBoard.interfaces.slice(0, 2).join(", ")}
          </span>
        </div>
      </div>

      {/* Strapping & Bootloader Special Instructions */}
      {currentBoard.strappingInstructions.length > 0 && (
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/25 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            {t("pinout_strapping_rules_title")}
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-200/90 font-mono">
            {currentBoard.strappingInstructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-purple-400">•</span>
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Visual Pinout Diagrams */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col gap-6">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          {t("pinout_diagram_title")} {currentBoard.name}
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Header Pins */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-400 border-b border-white/10 pb-2">
              {t("left_header")}
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              {leftPins.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/70 border border-white/5 hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-[10px] text-zinc-500 font-bold text-right">{p.pinNumber}</span>
                    <span className="font-bold text-zinc-100">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] border ${getPinColorBadge(
                        p.color
                      )}`}
                    >
                      {p.functions.join(" | ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Header Pins */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-400 border-b border-white/10 pb-2">
              {t("right_header")}
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              {rightPins.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/70 border border-white/5 hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] border ${getPinColorBadge(
                        p.color
                      )}`}
                    >
                      {p.functions.join(" | ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">{p.label}</span>
                    <span className="w-6 text-[10px] text-zinc-500 font-bold">{p.pinNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
