"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  HelpCircle,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { fetchTriviaQuestions, type TriviaQuestion } from "@/lib/api-clients";

export function TriviaQuizClient() {
  const [category, setCategory] = useState("18"); // Computers
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "18", label: "Bilgisayar & Teknoloji" },
    { id: "17", label: "Bilim & Doğa" },
    { id: "9", label: "Genel Kültür" },
    { id: "23", label: "Tarih" },
    { id: "22", label: "Coğrafya" },
    { id: "11", label: "Sinema & Film" },
  ];

  const loadQuestions = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    try {
      const data = await fetchTriviaQuestions(10, category, difficulty);
      setQuestions(data);
      if (data.length > 0) {
        toast.success("10 Yeni Soru Hazırlandı!");
      }
    } catch {
      toast.error("Sorular yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category, difficulty]);

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (ans: string) => {
    if (selectedAnswer !== null) return; // prevent multiple clicks
    setSelectedAnswer(ans);

    const isCorrect = ans === currentQ.correct_answer;
    if (isCorrect) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((st) => st + 1);
      toast.success("Doğru Cevap! (+10 Puan)");
    } else {
      setStreak(0);
      toast.error(`Yanlış! Doğru cevap: ${currentQ.correct_answer}`);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300 backdrop-blur-xl mb-3">
          <HelpCircle className="h-3.5 w-3.5 text-pink-400" />
          <span>Open Trivia DB Arena</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          İnteraktif Bilgi Yarışması & Trivia Arena
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Bilim, teknoloji, tarih ve genel kültür kategorilerinde binlerce soruyla bilginizi canlı test edin.
        </p>
      </div>

      {/* Category & Difficulty Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl shadow-xl">
        <div className="flex gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                category === c.id
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                  : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-mono capitalize transition-all ${
                difficulty === diff
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                  : "bg-white/[0.04] text-zinc-500 border border-white/5 hover:text-white"
              }`}
            >
              {diff === "easy" ? "Kolay" : diff === "medium" ? "Orta" : "Zor"}
            </button>
          ))}
        </div>
      </div>

      {/* Arena Card */}
      {!showResult && currentQ ? (
        <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-8 shadow-2xl space-y-6">
          {/* Progress & Score Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-zinc-400">
              Soru {currentIndex + 1} / {questions.length}
            </span>

            <div className="flex items-center gap-4">
              {streak > 1 && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Flame className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{streak} Seri!</span>
                </span>
              )}
              <span className="text-sm font-bold text-pink-400 font-mono">Skor: {score}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="py-4">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Answers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentQ.all_answers?.map((ans, aIdx) => {
              const isSelected = selectedAnswer === ans;
              const isCorrect = selectedAnswer !== null && ans === currentQ.correct_answer;
              const isWrong = isSelected && ans !== currentQ.correct_answer;

              return (
                <button
                  key={aIdx}
                  onClick={() => handleSelectAnswer(ans)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    isCorrect
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/20"
                      : isWrong
                      ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-500/20"
                      : "bg-white/[0.03] border-white/10 text-zinc-200 hover:border-pink-500/40 hover:bg-pink-500/[0.05]"
                  }`}
                >
                  <span>{ans}</span>
                  {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {isWrong && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : showResult ? (
        /* End Game Trophy View */
        <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-12 shadow-2xl text-center space-y-5">
          <Trophy className="h-16 w-16 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-extrabold text-white">Yarışma Tamamlandı!</h2>
          <div className="text-4xl font-black text-pink-400 font-mono">Toplam Skor: {score}</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            10 sorudan oluşan trivia turunu tamamladınız. Farklı kategoriler ve zorluk seviyeleriyle bilginizi sınamaya devam edin.
          </p>
          <button
            onClick={loadQuestions}
            className="inline-flex items-center gap-2 rounded-2xl bg-pink-500/20 border border-pink-500/40 px-6 py-3 text-xs font-bold text-pink-300 hover:bg-pink-500/30 transition-all shadow-xl"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Yeni Yarışma Başlat</span>
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-12 text-center text-zinc-500">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <span className="text-xs">Sorular hazırlanıyor...</span>
        </div>
      )}
    </div>
  );
}
