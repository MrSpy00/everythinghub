"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Volume2,
  Sparkles,
  Link,
  Music,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { fetchDictionaryWord, fetchDatamuseWords, type DictionaryEntry, type DatamuseWord } from "@/lib/api-clients";

export function SmartDictionaryClient() {
  const [word, setWord] = useState("serendipity");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [rhymes, setRhymes] = useState<DatamuseWord[]>([]);
  const [synonyms, setSynonyms] = useState<DatamuseWord[]>([]);
  const [loading, setLoading] = useState(false);

  const lookup = async (targetWord: string) => {
    if (!targetWord.trim()) return;
    setLoading(true);
    try {
      const [dictData, rhymeData, synData] = await Promise.all([
        fetchDictionaryWord(targetWord),
        fetchDatamuseWords(targetWord, "rhyme"),
        fetchDatamuseWords(targetWord, "synonym"),
      ]);
      setEntry(dictData);
      setRhymes(rhymeData);
      setSynonyms(synData);
    } catch (err) {
      toast.error("Kelime aranamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lookup("serendipity");
  }, []);

  const playAudio = (audioUrl?: string) => {
    if (!audioUrl) {
      toast.error("Bu kelime için ses kaydı bulunamadı.");
      return;
    }
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const firstAudio = entry?.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-xl mb-3">
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <span>Dictionary & Rhyme Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          İngilizce Akıllı Sözlük, Telaffuz & Kafiye Motoru
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          İngilizce kelimelerin fonetik telaffuz seslerini dinleyin, tanımları inceleyin, kafiyeli kelimeleri ve eşanlamlıları canlı keşfedin.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(word);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="İngilizce kelime yazın (örn: serendipity, quantum, galaxy)..."
              className="w-full rounded-2xl border border-white/10 bg-[#0d0e12]/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none backdrop-blur-2xl shadow-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl bg-blue-500/20 border border-blue-500/40 px-5 py-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition-all shrink-0"
          >
            <span>{loading ? "Aranıyor..." : "Ara"}</span>
          </button>
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Word Header & Definitions */}
        <div className="lg:col-span-8 space-y-6">
          {entry ? (
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-7 shadow-2xl space-y-6">
              {/* Word Hero */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-3xl font-extrabold text-white capitalize">{entry.word}</h2>
                  <div className="text-xs font-mono text-blue-400 mt-1">
                    {entry.phonetic || entry.phonetics?.[0]?.text || "/—/"}
                  </div>
                </div>

                {firstAudio && (
                  <button
                    onClick={() => playAudio(firstAudio)}
                    className="flex items-center gap-2 rounded-2xl bg-blue-500/20 border border-blue-500/40 px-4 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition-all"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Telaffuzu Dinle</span>
                  </button>
                )}
              </div>

              {/* Meanings */}
              <div className="space-y-6">
                {entry.meanings.map((meaning, mIdx) => (
                  <div key={mIdx} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                        {meaning.partOfSpeech}
                      </span>
                    </div>

                    <div className="space-y-2.5 pl-2">
                      {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                        <div key={dIdx} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-1">
                          <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                            {dIdx + 1}. {def.definition}
                          </p>
                          {def.example && (
                            <p className="text-[11px] text-zinc-400 italic">
                              &ldquo;{def.example}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-12 text-center text-zinc-500">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Kelime bulunamadı veya arama bekleniyor.</p>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Rhymes & Synonyms */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rhymes Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 border-b border-white/10 pb-3">
              <Music className="h-3.5 w-3.5 text-purple-400" />
              <span>Kafiyeli Kelimeler (Rhymes)</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {rhymes.length > 0 ? (
                rhymes.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setWord(r.word);
                      lookup(r.word);
                    }}
                    className="text-[11px] font-mono rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    {r.word}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">Kafiyeli kelime bulunamadı.</span>
              )}
            </div>
          </div>

          {/* Synonyms Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 border-b border-white/10 pb-3">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Eş Anlamlılar (Synonyms)</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {synonyms.length > 0 ? (
                synonyms.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setWord(s.word);
                      lookup(s.word);
                    }}
                    className="text-[11px] font-mono rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-blue-300 hover:bg-blue-500/20 transition-colors"
                  >
                    {s.word}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">Eş anlamlı kelime bulunamadı.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
