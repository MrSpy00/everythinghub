"use client";
// ============================================================
// aegisTyping — Settings Panel
// Glassmorphism slide-in drawer with rock-solid toggle switches
// and instant localStorage synchronization.
// ============================================================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  Keyboard,
  User,
  Palette,
  MousePointer2,
  Shield,
  Sparkles,
  Monitor,
} from "lucide-react";
import type {
  AegisTypingSettings,
  ThemeName,
  KeyboardLayout,
  TypingFont,
  SoundPack,
  CaretStyle,
} from "../types";
import { ThemeSelector } from "./ThemeSelector";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: AegisTypingSettings;
  onChange: (settings: AegisTypingSettings) => void;
  currentThemeName: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  initialSection?: string;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
      <div style={{ color: "var(--at-accent)" }}>{icon}</div>
      <h3
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--at-text)" }}
      >
        {title}
      </h3>
    </div>
  );
}

// Rock-solid 100% bug-free toggle switch component
function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="flex-1 pr-2">
        <p className="text-xs font-semibold" style={{ color: "var(--at-text)" }}>
          {label}
        </p>
        {sub && (
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--at-muted)" }}>
            {sub}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
        style={{
          background: value ? "var(--at-accent, #22d3ee)" : "rgba(255,255,255,0.15)",
        }}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none"
            style={{
              background: active ? "var(--at-accent)" : "rgba(255,255,255,0.06)",
              color: active ? "var(--at-bg, #09090b)" : "var(--at-muted)",
              border: `1px solid ${active ? "var(--at-accent)" : "rgba(255,255,255,0.08)"}`,
            }}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  step = 1,
  value,
  unit = "",
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: "var(--at-text)" }}>
          {label}
        </p>
        <span className="text-xs font-mono font-bold" style={{ color: "var(--at-accent)" }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        style={{
          background: "rgba(255,255,255,0.15)",
        }}
      />
    </div>
  );
}

export function SettingsPanel({
  open,
  onClose,
  settings,
  onChange,
  currentThemeName,
  onThemeChange,
  initialSection = "appearance",
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && initialSection) {
      setActiveSection(initialSection);
      if (initialSection === "profile") {
        setTimeout(() => nicknameInputRef.current?.focus(), 120);
      }
    }
  }, [open, initialSection]);

  const update = useCallback(
    <K extends keyof AegisTypingSettings>(key: K, value: AegisTypingSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [settings, onChange]
  );

  const sections = [
    { id: "appearance", label: "Görünüm", icon: <Palette size={14} /> },
    { id: "caret", label: "İmleç", icon: <MousePointer2 size={14} /> },
    { id: "test", label: "Test", icon: <Monitor size={14} /> },
    { id: "sound", label: "Ses", icon: <Volume2 size={14} /> },
    { id: "effects", label: "Efektler", icon: <Sparkles size={14} /> },
    { id: "keyboard", label: "Klavye", icon: <Keyboard size={14} /> },
    { id: "anticheat", label: "Koruma", icon: <Shield size={14} /> },
    { id: "profile", label: "Profil", icon: <User size={14} /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[460px] flex flex-col"
            style={{
              background: "rgba(18, 18, 24, 0.92)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(28px)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.7)",
            }}
            role="dialog"
            aria-label="Ayarlar"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--at-text)" }}>
                  aegisTyping Ayarları
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl transition-colors focus:outline-none hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--at-muted)",
                }}
                aria-label="Kapat"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar nav */}
              <nav
                className="w-24 flex-shrink-0 py-3 flex flex-col gap-1 overflow-y-auto"
                style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
              >
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-2 text-center transition-all focus:outline-none rounded-xl mx-1.5"
                    style={{
                      background:
                        activeSection === s.id
                          ? "rgba(255,255,255,0.09)"
                          : "transparent",
                      color:
                        activeSection === s.id
                          ? "var(--at-accent)"
                          : "var(--at-muted)",
                    }}
                  >
                    {s.icon}
                    <span className="text-[10px] font-medium leading-none">{s.label}</span>
                  </button>
                ))}
              </nav>

              {/* Content */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
                style={{ overscrollBehavior: "contain" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.12 }}
                    className="space-y-4"
                  >
                    {/* APPEARANCE */}
                    {activeSection === "appearance" && (
                      <>
                        <SectionHeader icon={<Palette size={14} />} title="Görünüm & Temalar" />
                        <div>
                          <p className="text-[11px] mb-2.5 font-bold uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
                            30+ Hazır Tema
                          </p>
                          <ThemeSelector
                            currentTheme={currentThemeName}
                            onChange={onThemeChange}
                          />
                        </div>
                        <SliderRow
                          label="Yazı Boyutu"
                          min={16}
                          max={26}
                          step={2}
                          value={settings.fontSize}
                          unit="px"
                          onChange={(v) => update("fontSize", v)}
                        />
                        <div>
                          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--at-muted)" }}>
                            Yazı Tipi Ailesi
                          </p>
                          <RadioGroup<TypingFont>
                            options={[
                              { label: "Geist Mono", value: "geist-mono" },
                              { label: "JetBrains", value: "jetbrains-mono" },
                              { label: "Fira Code", value: "fira-code" },
                              { label: "Courier", value: "courier" },
                            ]}
                            value={settings.fontFamily}
                            onChange={(v) => update("fontFamily", v)}
                          />
                        </div>
                        <div>
                          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--at-muted)" }}>
                            Görünen Satır Sayısı
                          </p>
                          <RadioGroup<"1" | "2" | "3">
                            options={[
                              { label: "1 Satır", value: "1" },
                              { label: "2 Satır", value: "2" },
                              { label: "3 Satır", value: "3" },
                            ]}
                            value={String(settings.lineCount) as "1" | "2" | "3"}
                            onChange={(v) => update("lineCount", Number(v) as 1 | 2 | 3)}
                          />
                        </div>
                      </>
                    )}

                    {/* CARET */}
                    {activeSection === "caret" && (
                      <>
                        <SectionHeader icon={<MousePointer2 size={14} />} title="İmleç Ayarları" />
                        <div>
                          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--at-muted)" }}>
                            İmleç Stili
                          </p>
                          <RadioGroup<CaretStyle>
                            options={[
                              { label: "Çizgi", value: "line" },
                              { label: "Blok", value: "block" },
                              { label: "Alt Çizgi", value: "underscore" },
                              { label: "Kapalı", value: "off" },
                            ]}
                            value={settings.caretStyle}
                            onChange={(v) => update("caretStyle", v)}
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold" style={{ color: "var(--at-muted)" }}>
                            İmleç Rengi
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settings.caretColor}
                              onChange={(e) => update("caretColor", e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent"
                            />
                            {["#22d3ee", "#818cf8", "#f472b6", "#4ade80", "#fbbf24", "#ffffff"].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => update("caretColor", c)}
                                className="w-6 h-6 rounded-md border transition-transform hover:scale-110 focus:outline-none"
                                style={{
                                  background: c,
                                  borderColor: settings.caretColor === c ? "#fff" : "rgba(255,255,255,0.2)",
                                }}
                                aria-label={`İmleç rengi: ${c}`}
                              />
                            ))}
                          </div>
                        </div>
                        <ToggleRow
                          label="Yumuşak Akıcı İmleç"
                          sub="GPU hızlandırmalı pürüzsüz imleç hareketi"
                          value={settings.smoothCaret}
                          onChange={(v) => update("smoothCaret", v)}
                        />
                      </>
                    )}

                    {/* TEST */}
                    {activeSection === "test" && (
                      <>
                        <SectionHeader icon={<Monitor size={14} />} title="Test Kuralları" />
                        <ToggleRow
                          label="Noktalama İşaretleri"
                          sub="Metne virgül, nokta, tırnak ekler"
                          value={settings.punctuation}
                          onChange={(v) => update("punctuation", v)}
                        />
                        <ToggleRow
                          label="Rakamlar"
                          sub="Kelimeler arasına sayılar ekler"
                          value={settings.numbers}
                          onChange={(v) => update("numbers", v)}
                        />
                        <ToggleRow
                          label="Büyük Harfler"
                          sub="Başlık ve özel isim büyük harfleri"
                          value={settings.capitalization}
                          onChange={(v) => update("capitalization", v)}
                        />
                        <ToggleRow
                          label="Güven Modu (No Backspace)"
                          sub="Geri silme tuşunu devre dışı bırakır"
                          value={settings.confidenceMode}
                          onChange={(v) => update("confidenceMode", v)}
                        />
                        <ToggleRow
                          label="Kör Mod"
                          sub="Yazılan karakterler ekranda gizlenir"
                          value={settings.blindMode}
                          onChange={(v) => update("blindMode", v)}
                        />
                        <ToggleRow
                          label="Test Esnasında İstatistikleri Gizle"
                          sub="Odaklanmayı artırmak için canlı WPM gizlenir"
                          value={settings.hideStats}
                          onChange={(v) => update("hideStats", v)}
                        />
                      </>
                    )}

                    {/* SOUND */}
                    {activeSection === "sound" && (
                      <>
                        <SectionHeader icon={<Volume2 size={14} />} title="Ses & Akustik Motoru" />
                        <div>
                          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--at-muted)" }}>
                            Klavye Tuş Sesi
                          </p>
                          <RadioGroup<SoundPack>
                            options={[
                              { label: "Sessiz (Default)", value: "silent" },
                              { label: "Mekanik", value: "mechanical" },
                              { label: "Yumuşak", value: "soft" },
                              { label: "Daktilo", value: "typewriter" },
                            ]}
                            value={settings.soundPack}
                            onChange={(v) => update("soundPack", v)}
                          />
                        </div>
                        <ToggleRow
                          label="Hata Uyarı Sesi"
                          sub="Hatalı tuş basıldığında yumuşak uyarı tonu çalar"
                          value={settings.soundOnError}
                          onChange={(v) => update("soundOnError", v)}
                        />
                        <SliderRow
                          label="Ses Şiddeti"
                          min={0}
                          max={1}
                          step={0.05}
                          value={settings.volume}
                          unit=""
                          onChange={(v) => update("volume", v)}
                        />
                      </>
                    )}

                    {/* EFFECTS */}
                    {activeSection === "effects" && (
                      <>
                        <SectionHeader icon={<Sparkles size={14} />} title="Görsel Efektler" />
                        <ToggleRow
                          label="Kelime Solma Efekti"
                          sub="Tamamlanan kelimelerin opaklığı hafif azalır"
                          value={settings.wordFadeAnimation}
                          onChange={(v) => update("wordFadeAnimation", v)}
                        />
                        <ToggleRow
                          label="Bitiş Konfetisi"
                          sub="Test tamamlandığında Canvas konfeti patlaması"
                          value={settings.finishConfetti}
                          onChange={(v) => update("finishConfetti", v)}
                        />
                        <ToggleRow
                          label="Canlı WPM Kıvılcım Grafiği"
                          sub="Test sırasında mini dinamik SVG grafiği"
                          value={settings.showLiveGraph}
                          onChange={(v) => update("showLiveGraph", v)}
                        />
                        <ToggleRow
                          label="Azaltılmış Hareket"
                          sub="Göz yorgunluğunu önlemek için geçişleri sadeleştirir"
                          value={settings.reducedMotion}
                          onChange={(v) => update("reducedMotion", v)}
                        />
                      </>
                    )}

                    {/* KEYBOARD */}
                    {activeSection === "keyboard" && (
                      <>
                        <SectionHeader icon={<Keyboard size={14} />} title="Görsel Klavye Katmanı" />
                        <ToggleRow
                          label="Klavye Görünümü (Overlay)"
                          sub="Yazma alanının altında görsel klavye ve tuş aydınlatması"
                          value={settings.showKeyboardOverlay}
                          onChange={(v) => update("showKeyboardOverlay", v)}
                        />
                        <div>
                          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--at-muted)" }}>
                            Klavye Dizilimi
                          </p>
                          <RadioGroup<KeyboardLayout>
                            options={[
                              { label: "QWERTY", value: "qwerty" },
                              { label: "Türkçe F", value: "tr-f" },
                              { label: "QWERTZ", value: "qwertz" },
                              { label: "AZERTY", value: "azerty" },
                              { label: "Dvorak", value: "dvorak" },
                              { label: "Colemak", value: "colemak" },
                            ]}
                            value={settings.keyboardLayout}
                            onChange={(v) => update("keyboardLayout", v)}
                          />
                        </div>
                      </>
                    )}

                    {/* ANTICHEAT */}
                    {activeSection === "anticheat" && (
                      <>
                        <SectionHeader icon={<Shield size={14} />} title="Anti-Cheat & Doğrulama" />
                        <ToggleRow
                          label="Pano / Yapıştırma Engeli"
                          sub="Test esnasında Ctrl+V / yapıştırma engellenir"
                          value={settings.preventPaste}
                          onChange={(v) => update("preventPaste", v)}
                        />
                        <ToggleRow
                          label="Sekme Değiştirme Takibi"
                          sub="Pencereden ayrılma durumunda skoru işaretler"
                          value={settings.tabSwitchDetection}
                          onChange={(v) => update("tabSwitchDetection", v)}
                        />
                        <div
                          className="p-3 rounded-2xl text-[11px] leading-relaxed"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "var(--at-muted)",
                          }}
                        >
                          Anti-hile motoru milisaniye varyans analizi (&lt;15ms bot tespiti) ve Web Crypto SHA-256 imzası uygular.
                        </div>
                      </>
                    )}

                    {/* PROFILE */}
                    {activeSection === "profile" && (
                      <>
                        <SectionHeader icon={<User size={14} />} title="Kullanıcı Profili & Rumuz" />
                        <div className="space-y-3">
                          <label className="text-xs font-semibold block" style={{ color: "var(--at-muted)" }}>
                            Liderlik Tablosu Rumuzunuz (Max 20 karakter)
                          </label>
                          <input
                            ref={nicknameInputRef}
                            type="text"
                            value={settings.nickname}
                            onChange={(e) => update("nickname", e.target.value.slice(0, 20))}
                            maxLength={20}
                            placeholder="Anonim"
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              color: "var(--at-text)",
                            }}
                          />
                          <p className="text-[11px]" style={{ color: "var(--at-muted)" }}>
                            Bu isim küresel liderlik tablosu kayıtlarında gösterilir.
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
