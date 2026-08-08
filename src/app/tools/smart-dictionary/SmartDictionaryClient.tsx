"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Volume2,
  Sparkles,
  Music,
  Copy,
  Check,
  RotateCcw,
  Compass,
  Bookmark,
  History,
  Layers,
  HelpCircle,
  ExternalLink,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchDictionaryWord,
  fetchDatamuseWords,
  type DictionaryEntry,
  type DatamuseWord,
} from "@/lib/api-clients";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { NeonBorder } from "@/components/creative/NeonBorder";

const CURATED_VOCABULARY = [
  {
    categoryTr: "Akademik & GRE",
    categoryEn: "Academic & GRE",
    words: ["serendipity", "ephemeral", "ubiquitous", "paradigm", "juxtaposition", "eloquent", "pragmatic"],
  },
  {
    categoryTr: "Teknoloji & Bilim",
    categoryEn: "Tech & Science",
    words: ["algorithm", "quantum", "neural", "cryptography", "concurrency", "entropy", "heuristic"],
  },
  {
    categoryTr: "Günlük & İletişim",
    categoryEn: "Daily & Conversational",
    words: ["resilient", "enthusiastic", "versatile", "meticulous", "spontaneous", "empathy"],
  },
  {
    categoryTr: "Edebiyat & Şiir",
    categoryEn: "Literature & Poetry",
    words: ["solitude", "melancholy", "luminous", "sonder", "petrichor", "effervescent"],
  },
];

export function SmartDictionaryClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [inputWord, setInputWord] = useState("serendipity");
  const [currentWord, setCurrentWord] = useState("serendipity");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [rhymes, setRhymes] = useState<DatamuseWord[]>([]);
  const [synonyms, setSynonyms] = useState<DatamuseWord[]>([]);
  const [antonyms, setAntonyms] = useState<DatamuseWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechAccent, setSpeechAccent] = useState<"en-US" | "en-GB">("en-US");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"definitions" | "rhymes" | "synonyms" | "antonyms">("definitions");

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("everythinghub_dict_history");
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveToHistory = (w: string) => {
    const clean = w.trim().toLowerCase();
    if (!clean) return;
    setSearchHistory((prev) => {
      const next = [clean, ...prev.filter((item) => item !== clean)].slice(0, 15);
      try {
        localStorage.setItem("everythinghub_dict_history", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const lookup = useCallback(
    async (targetWord: string) => {
      const trimmed = targetWord.trim().toLowerCase();
      if (!trimmed) return;
      setLoading(true);
      setCurrentWord(trimmed);
      saveToHistory(trimmed);

      try {
        const [dictData, rhymeData, synData, antData] = await Promise.all([
          fetchDictionaryWord(trimmed),
          fetchDatamuseWords(trimmed, "rhyme"),
          fetchDatamuseWords(trimmed, "synonym"),
          fetchDatamuseWords(trimmed, "antonym"),
        ]);
        setEntry(dictData);
        setRhymes(rhymeData);
        setSynonyms(synData);
        setAntonyms(antData);
      } catch {
        toast.error(isTurkish ? "Kelime aranamadı veya bağlantı hatası oluştu." : "Failed to fetch word details.");
      } finally {
        setLoading(false);
      }
    },
    [isTurkish]
  );

  useEffect(() => {
    lookup("serendipity");
  }, [lookup]);

  // Audio Playback with Web Speech API Fallback
  const playPronunciation = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speechRate;
      audio.play().catch(() => {
        speakViaWebSpeech(currentWord);
      });
      return;
    }
    speakViaWebSpeech(currentWord);
  };

  const speakViaWebSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error(isTurkish ? "Tarayıcınız ses sentezini desteklemiyor." : "Speech synthesis not supported.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechAccent;
    utterance.rate = speechRate;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(speechAccent));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
    toast.success(isTurkish ? `Seslendiriliyor (${speechAccent === "en-US" ? "Amerikan" : "İngiliz"} Aksanı)` : `Playing (${speechAccent})`);
  };

  const handleRandomWord = () => {
    const allWords = CURATED_VOCABULARY.flatMap((c) => c.words);
    const random = allWords[Math.floor(Math.random() * allWords.length)];
    setInputWord(random);
    lookup(random);
  };

  const handleCopyWord = () => {
    if (!entry) return;
    const textToCopy = `${entry.word} [${entry.phonetic || ""}]\n\n${entry.meanings
      .map((m) => `${m.partOfSpeech.toUpperCase()}:\n${m.definitions.map((d, i) => `${i + 1}. ${d.definition}`).join("\n")}`)
      .join("\n\n")}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(isTurkish ? "Kelime ve tanımlar panoya kopyalandı!" : "Word and definitions copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const firstAudio = entry?.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-xl">
          <BookOpen className="h-4 w-4 text-blue-400" />
          <span>{isTurkish ? "Akıllı Sözlük & Kafiye Stüdyosu" : "Smart Dictionary & Rhyme Studio"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "İngilizce Akıllı Sözlük & Telaffuz Motoru" : "English Smart Dictionary & Pronunciation Engine"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "İngilizce kelimelerin fonetik telaffuz seslerini dinleyin, tanımları inceleyin, kafiyeli kelimeleri ve eşanlamlıları canlı keşfedin."
            : "Listen to crystal-clear phonetic pronunciation, explore detailed meanings, rhyming words, and synonyms in real-time."}
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="max-w-2xl mx-auto space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(inputWord);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder={isTurkish ? "İngilizce kelime yazın (örn: serendipity, quantum, galaxy)..." : "Type an English word (e.g. serendipity, quantum)..."}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0e12]/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none backdrop-blur-2xl shadow-xl transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-blue-500/20 border border-blue-500/40 px-5 py-3 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition-all shrink-0 cursor-pointer"
          >
            <span>{loading ? (isTurkish ? "Aranıyor..." : "Searching...") : isTurkish ? "Ara" : "Search"}</span>
          </button>

          <button
            type="button"
            onClick={handleRandomWord}
            title={isTurkish ? "Rastgele Kelime Keşfet" : "Discover Random Word"}
            className="flex items-center gap-1.5 rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-3 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">{isTurkish ? "Rastgele" : "Random"}</span>
          </button>
        </form>

        {/* Audio Speech Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{isTurkish ? "Aksan:" : "Accent:"}</span>
            <button
              onClick={() => setSpeechAccent("en-US")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                speechAccent === "en-US"
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              US (Amerikan)
            </button>
            <button
              onClick={() => setSpeechAccent("en-GB")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                speechAccent === "en-GB"
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              UK (İngiliz)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">{isTurkish ? "Hız:" : "Speed:"}</span>
            {[0.75, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono transition-all ${
                  speechRate === rate
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Search History Chips */}
        {searchHistory.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <History className="h-3.5 w-3.5 text-zinc-500 shrink-0 mr-1" />
            {searchHistory.slice(0, 7).map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputWord(h);
                  lookup(h);
                }}
                className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all shrink-0 font-mono text-[11px]"
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Word Hero, Audio & Meanings */}
        <div className="lg:col-span-8 space-y-6">
          {entry ? (
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Word Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white capitalize tracking-tight">
                    {entry.word}
                  </h2>
                  <div className="text-sm font-mono text-blue-400 mt-1.5 flex items-center gap-2">
                    <span>{entry.phonetic || entry.phonetics?.[0]?.text || "/—/"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playPronunciation(firstAudio)}
                    className="flex items-center gap-2 rounded-2xl bg-blue-500/20 border border-blue-500/40 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{isTurkish ? "Telaffuz Dinle" : "Play Audio"}</span>
                  </button>

                  <button
                    onClick={handleCopyWord}
                    title={isTurkish ? "Tanımları Kopyala" : "Copy Definitions"}
                    className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Meanings List */}
              <div className="space-y-6">
                {entry.meanings.map((meaning, mIdx) => (
                  <div key={mIdx} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 font-mono bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                        {meaning.partOfSpeech}
                      </span>
                    </div>

                    <div className="space-y-3 pl-1 sm:pl-3">
                      {meaning.definitions.slice(0, 4).map((def, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed font-medium">
                            <span className="text-blue-400 font-mono font-bold mr-2">{dIdx + 1}.</span>
                            {def.definition}
                          </p>
                          {def.example && (
                            <p className="text-xs text-zinc-400 italic pl-4 border-l-2 border-blue-500/30">
                              &ldquo;{def.example}&rdquo;
                            </p>
                          )}
                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase">{isTurkish ? "Eş:" : "Syn:"}</span>
                              {def.synonyms.slice(0, 4).map((s, si) => (
                                <button
                                  key={si}
                                  onClick={() => {
                                    setInputWord(s);
                                    lookup(s);
                                  }}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-16 text-center text-zinc-500 space-y-3">
              <BookOpen className="h-12 w-12 mx-auto text-zinc-600 animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-300">
                {isTurkish ? "Kelime aranıyor veya bulunamadı" : "Searching word or no results"}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {isTurkish
                  ? "Arama çubuğuna bir İngilizce kelime yazarak veya aşağıdaki hazır kategorilerden birini seçerek başlayın."
                  : "Type an English word or select from the vocabulary categories below to begin."}
              </p>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Rhymes, Synonyms, Antonyms & Curated Words */}
        <div className="lg:col-span-4 space-y-6">
          {/* Synonyms Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>{isTurkish ? "Eş Anlamlılar (Synonyms)" : "Synonyms"}</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{synonyms.length}</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {synonyms.length > 0 ? (
                synonyms.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputWord(s.word);
                      lookup(s.word);
                    }}
                    className="text-[11px] font-mono rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
                  >
                    {s.word}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">{isTurkish ? "Eş anlamlı bulunamadı." : "No synonyms found."}</span>
              )}
            </div>
          </div>

          {/* Antonyms Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-400" />
                <span>{isTurkish ? "Zıt Anlamlılar (Antonyms)" : "Antonyms"}</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{antonyms.length}</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {antonyms.length > 0 ? (
                antonyms.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputWord(a.word);
                      lookup(a.word);
                    }}
                    className="text-[11px] font-mono rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
                  >
                    {a.word}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">{isTurkish ? "Zıt anlamlı bulunamadı." : "No antonyms found."}</span>
              )}
            </div>
          </div>

          {/* Rhymes Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <Music className="h-4 w-4 text-purple-400" />
                <span>{isTurkish ? "Kafiyeli Kelimeler (Rhymes)" : "Rhymes"}</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{rhymes.length}</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {rhymes.length > 0 ? (
                rhymes.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputWord(r.word);
                      lookup(r.word);
                    }}
                    className="text-[11px] font-mono rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
                  >
                    {r.word}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">{isTurkish ? "Kafiyeli kelime bulunamadı." : "No rhymes found."}</span>
              )}
            </div>
          </div>

          {/* Curated Vocabulary Presets */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>{isTurkish ? "Örnek Kelime Koleksiyonları" : "Vocabulary Collections"}</span>
            </h3>

            <div className="space-y-3">
              {CURATED_VOCABULARY.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {isTurkish ? group.categoryTr : group.categoryEn}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {group.words.map((w, wi) => (
                      <button
                        key={wi}
                        onClick={() => {
                          setInputWord(w);
                          lookup(w);
                        }}
                        className="text-[11px] font-mono rounded-lg bg-white/[0.03] border border-white/10 px-2 py-0.5 text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
