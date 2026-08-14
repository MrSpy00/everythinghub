"use client";
// ============================================================
// aegisTyping — Settings Panel
// Full glassmorphism settings slide-in panel
// ============================================================
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Volume2, Keyboard, User,
  Palette, MousePointer2, Shield, Sparkles, Monitor
} from "lucide-react";
import type { AegisTypingSettings, ThemeName, KeyboardLayout, TypingFont, SoundPack, CaretStyle } from "../types";
import { ThemeSelector } from "./ThemeSelector";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: AegisTypingSettings;
  onChange: (settings: AegisTypingSettings) => void;
  currentThemeName: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

// Section header
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div style={{ color: "var(--at-accent)" }}>{icon}</div>
      <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--at-text)" }}>
        {title}
      </h3>
    </div>
  );
}

// Toggle row
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
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm" style={{ color: "var(--at-text)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--at-muted)" }}>{sub}</p>}
      </div>
      <motion.button
        onClick={() => onChange(!value)}
        whileTap={{ scale: 0.9 }}
        className="relative w-10 h-5.5 rounded-full transition-colors focus:outline-none flex-shrink-0"
        style={{
          background: value ? "var(--at-accent)" : "rgba(255,255,255,0.1)",
          minWidth: "40px",
          height: "22px",
        }}
        role="switch"
        aria-checked={value}
      >
        <motion.span
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: "#fff" }}
        />
      </motion.button>
    </div>
  );
}

// Radio group
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
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors focus:outline-none"
            style={{
              background: active ? "var(--at-accent)" : "rgba(255,255,255,0.06)",
              color: active ? "var(--at-bg)" : "var(--at-muted)",
              border: `1px solid ${active ? "var(--at-accent)" : "rgba(255,255,255,0.08)"}`,
            }}
            aria-pressed={active}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// Slider
function SliderRow({
  label,
  min,
  max,
  step = 1,
  value,
  unit,
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--at-text)" }}>{label}</p>
        <span className="text-xs font-mono" style={{ color: "var(--at-accent)" }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--at-accent) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)`,
          outline: "none",
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
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<string>("appearance");

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
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] flex flex-col"
            style={{
              background: "var(--at-surface)",
              borderLeft: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(24px)",
            }}
            role="dialog"
            aria-label="Ayarlar"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="text-base font-semibold" style={{ color: "var(--at-text)" }}>
                Ayarlar
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-xl focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--at-muted)",
                }}
                aria-label="Kapat"
              >
                <X size={16} />
              </motion.button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar nav */}
              <nav
                className="w-28 flex-shrink-0 py-3 flex flex-col gap-1"
                style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
              >
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className="flex flex-col items-center gap-1 py-3 px-2 text-center transition-colors focus:outline-none rounded-xl mx-1.5"
                    style={{
                      background: activeSection === s.id ? "rgba(255,255,255,0.08)" : "transparent",
                      color: activeSection === s.id ? "var(--at-accent)" : "var(--at-muted)",
                    }}
                  >
                    {s.icon}
                    <span className="text-[10px] font-medium leading-tight">{s.label}</span>
                  </button>
                ))}
              </nav>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ overscrollBehavior: "contain" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-5"
                  >
                    {/* APPEARANCE */}
                    {activeSection === "appearance" && (
                      <>
                        <SectionHeader icon={<Palette size={15} />} title="Görünüm" />
                        <div>
                          <p className="text-xs mb-3 font-medium uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>Tema</p>
                          <ThemeSelector
                            currentTheme={currentThemeName}
                            onChange={onThemeChange}
                          />
                        </div>
                        <SliderRow
                          label="Yazı Boyutu"
                          min={14}
                          max={26}
                          step={2}
                          value={settings.fontSize}
                          unit="px"
                          onChange={(v) => update("fontSize", v)}
                        />
                        <div>
                          <p className="text-xs mb-2 font-medium" style={{ color: "var(--at-muted)" }}>Yazı Tipi</p>
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
                          <p className="text-xs mb-2 font-medium" style={{ color: "var(--at-muted)" }}>Satır Sayısı</p>
                          <RadioGroup<"1" | "2" | "3">
                            options={[
                              { label: "1", value: "1" },
                              { label: "2", value: "2" },
                              { label: "3", value: "3" },
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
                        <SectionHeader icon={<MousePointer2 size={15} />} title="İmleç" />
                        <div>
                          <p className="text-xs mb-2 font-medium" style={{ color: "var(--at-muted)" }}>İmleç Stili</p>
                          <RadioGroup<CaretStyle>
                            options={[
                              { label: "Blok", value: "block" },
                              { label: "Çizgi", value: "line" },
                              { label: "Alt Çizgi", value: "underscore" },
                              { label: "Kapalı", value: "off" },
                            ]}
                            value={settings.caretStyle}
                            onChange={(v) => update("caretStyle", v)}
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium" style={{ color: "var(--at-muted)" }}>İmleç Rengi</p>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={settings.caretColor}
                              onChange={(e) => update("caretColor", e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border-0 p-1"
                              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                            {["#22d3ee", "#818cf8", "#f472b6", "#4ade80", "#fbbf24", "#ffffff"].map((c) => (
                              <button
                                key={c}
                                onClick={() => update("caretColor", c)}
                                className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 focus:outline-none"
                                style={{
                                  background: c,
                                  borderColor: settings.caretColor === c ? "#fff" : "transparent",
                                }}
                                aria-label={`İmleç rengi: ${c}`}
                              />
                            ))}
                          </div>
                        </div>
                        <ToggleRow
                          label="Yumuşak İmleç"
                          sub="İmleç hareketleri yumuşak geçiş yapar"
                          value={settings.smoothCaret}
                          onChange={(v) => update("smoothCaret", v)}
                        />
                        <ToggleRow
                          label="İmleç İzi"
                          sub="Önceki konumlar izde kalır"
                          value={settings.showCaretTrail}
                          onChange={(v) => update("showCaretTrail", v)}
                        />
                        {settings.showCaretTrail && (
                          <SliderRow
                            label="İz Uzunluğu"
                            min={3}
                            max={10}
                            value={settings.caretTrailLength}
                            onChange={(v) => update("caretTrailLength", v)}
                          />
                        )}
                      </>
                    )}

                    {/* TEST */}
                    {activeSection === "test" && (
                      <>
                        <SectionHeader icon={<Monitor size={15} />} title="Test Seçenekleri" />
                        <ToggleRow
                          label="Noktalama"
                          sub="Virgül, nokta, soru işareti ekler"
                          value={settings.punctuation}
                          onChange={(v) => update("punctuation", v)}
                        />
                        <ToggleRow
                          label="Sayılar"
                          sub="Kelimeler arasına rakam ekler"
                          value={settings.numbers}
                          onChange={(v) => update("numbers", v)}
                        />
                        <ToggleRow
                          label="Büyük Harf"
                          sub="Bazı kelimeleri büyük harfle başlatır"
                          value={settings.capitalization}
                          onChange={(v) => update("capitalization", v)}
                        />
                        <ToggleRow
                          label="Sıkı Mod"
                          sub="İlk hata yapınca test sıfırlanır"
                          value={settings.strictMode}
                          onChange={(v) => update("strictMode", v)}
                        />
                        <ToggleRow
                          label="Ani Ölüm"
                          sub="İlk hata = testi kaybettin"
                          value={settings.suddenDeath}
                          onChange={(v) => update("suddenDeath", v)}
                        />
                        <ToggleRow
                          label="Güven Modu"
                          sub="Backspace tuşunu devre dışı bırakır"
                          value={settings.confidenceMode}
                          onChange={(v) => update("confidenceMode", v)}
                        />
                        <ToggleRow
                          label="Kör Mod"
                          sub="Yazarken karakterler görünmez"
                          value={settings.blindMode}
                          onChange={(v) => update("blindMode", v)}
                        />
                        <ToggleRow
                          label="İstatistikleri Gizle"
                          sub="Test sırasında WPM/doğruluk gizlenir"
                          value={settings.hideStats}
                          onChange={(v) => update("hideStats", v)}
                        />
                      </>
                    )}

                    {/* SOUND */}
                    {activeSection === "sound" && (
                      <>
                        <SectionHeader icon={<Volume2 size={15} />} title="Ses" />
                        <div>
                          <p className="text-xs mb-2 font-medium" style={{ color: "var(--at-muted)" }}>Ses Paketi</p>
                          <RadioGroup<SoundPack>
                            options={[
                              { label: "Mekanik", value: "mechanical" },
                              { label: "Yumuşak", value: "soft" },
                              { label: "Daktilo", value: "typewriter" },
                              { label: "Sessiz", value: "silent" },
                            ]}
                            value={settings.soundPack}
                            onChange={(v) => update("soundPack", v)}
                          />
                        </div>
                        <SliderRow
                          label="Ses Seviyesi"
                          min={0}
                          max={1}
                          step={0.05}
                          value={settings.volume}
                          unit=""
                          onChange={(v) => update("volume", v)}
                        />
                        <ToggleRow
                          label="Hata Sesi"
                          sub="Yanlış tuşa basıldığında ses çıkar"
                          value={settings.soundOnError}
                          onChange={(v) => update("soundOnError", v)}
                        />
                      </>
                    )}

                    {/* EFFECTS */}
                    {activeSection === "effects" && (
                      <>
                        <SectionHeader icon={<Sparkles size={15} />} title="Görsel Efektler" />
                        <ToggleRow
                          label="Kelime Geçiş Animasyonu"
                          sub="Tamamlanan kelimeler soluklaşır"
                          value={settings.wordFadeAnimation}
                          onChange={(v) => update("wordFadeAnimation", v)}
                        />
                        <ToggleRow
                          label="Bitiş Konfetisi"
                          sub="Test bitince konfeti efekti"
                          value={settings.finishConfetti}
                          onChange={(v) => update("finishConfetti", v)}
                        />
                        <ToggleRow
                          label="Canlı WPM Grafiği"
                          sub="Test sırasında mini grafik gösterir"
                          value={settings.showLiveGraph}
                          onChange={(v) => update("showLiveGraph", v)}
                        />
                        <ToggleRow
                          label="Azaltılmış Hareket"
                          sub="Animasyon ve geçişleri azaltır"
                          value={settings.reducedMotion}
                          onChange={(v) => update("reducedMotion", v)}
                        />
                      </>
                    )}

                    {/* KEYBOARD */}
                    {activeSection === "keyboard" && (
                      <>
                        <SectionHeader icon={<Keyboard size={15} />} title="Klavye" />
                        <div>
                          <p className="text-xs mb-2 font-medium" style={{ color: "var(--at-muted)" }}>Klavye Düzeni</p>
                          <RadioGroup<KeyboardLayout>
                            options={[
                              { label: "QWERTY", value: "qwerty" },
                              { label: "QWERTZ", value: "qwertz" },
                              { label: "AZERTY", value: "azerty" },
                              { label: "Dvorak", value: "dvorak" },
                              { label: "Colemak", value: "colemak" },
                              { label: "Türkçe F", value: "tr-f" },
                              { label: "Workman", value: "workman" },
                            ]}
                            value={settings.keyboardLayout}
                            onChange={(v) => update("keyboardLayout", v)}
                          />
                        </div>
                        <ToggleRow
                          label="Klavye Görüntüsü"
                          sub="Test sırasında klavye gösterir"
                          value={settings.showKeyboardOverlay}
                          onChange={(v) => update("showKeyboardOverlay", v)}
                        />
                      </>
                    )}

                    {/* ANTICHEAT */}
                    {activeSection === "anticheat" && (
                      <>
                        <SectionHeader icon={<Shield size={15} />} title="Hile Koruması" />
                        <ToggleRow
                          label="Yapıştırma Engeli"
                          sub="Test sırasında Ctrl+V engellenir"
                          value={settings.preventPaste}
                          onChange={(v) => update("preventPaste", v)}
                        />
                        <ToggleRow
                          label="Sekme Değiştirme Tespiti"
                          sub="Pencere odağı kaybolduğunda işaretlenir"
                          value={settings.tabSwitchDetection}
                          onChange={(v) => update("tabSwitchDetection", v)}
                        />
                        <div
                          className="p-3 rounded-2xl text-xs leading-relaxed"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "var(--at-muted)",
                          }}
                        >
                          Anti-hile sistemi tuş zamanlaması analizi, WPM tavanı kontrolü ve örüntü tespiti içerir. Şüpheli sonuçlar global liderboard&apos;a eklenmez.
                        </div>
                      </>
                    )}

                    {/* PROFILE */}
                    {activeSection === "profile" && (
                      <>
                        <SectionHeader icon={<User size={15} />} title="Profil" />
                        <div className="space-y-2">
                          <label className="text-xs font-medium" style={{ color: "var(--at-muted)" }}>
                            Takma Ad (max. 20 karakter)
                          </label>
                          <input
                            type="text"
                            value={settings.nickname}
                            onChange={(e) => update("nickname", e.target.value.slice(0, 20))}
                            maxLength={20}
                            placeholder="Anonim"
                            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              color: "var(--at-text)",
                            }}
                          />
                          <p className="text-xs" style={{ color: "var(--at-muted)" }}>
                            Bu isim global liderboard&apos;da görünür.
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
