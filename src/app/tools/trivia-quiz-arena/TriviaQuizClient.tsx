"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Volume2,
  VolumeX,
  Languages,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { fetchTriviaQuestions, type TriviaQuestion } from "@/lib/api-clients";

// Bundled multilingual trivia dataset for instant play and offline reliability
const BUNDLED_TRIVIA_TR: TriviaQuestion[] = [
  {
    category: "Bilgisayar & Teknoloji",
    type: "multiple",
    difficulty: "medium",
    question: "İlk genel amaçlı elektronik dijital bilgisayarın adı nedir?",
    correct_answer: "ENIAC",
    incorrect_answers: ["UNIVAC", "EDVAC", "Colossus"],
  },
  {
    category: "Bilim & Doğa",
    type: "multiple",
    difficulty: "easy",
    question: "Periyodik tablodaki en hafif ve evrende en bol bulunan element hangisidir?",
    correct_answer: "Hidrojen (H)",
    incorrect_answers: ["Helyum (He)", "Oksijen (O)", "Karbon (C)"],
  },
  {
    category: "Genel Kültür",
    type: "multiple",
    difficulty: "medium",
    question: "Güneş Sistemi'ndeki en büyük yanardağ olan Olympus Mons hangi gezegende yer alır?",
    correct_answer: "Mars",
    incorrect_answers: ["Venüs", "Jüpiter", "Merkür"],
  },
  {
    category: "Tarih",
    type: "multiple",
    difficulty: "medium",
    question: "Matbaayı hareketli harflerle ilk kez Avrupa'da geliştiren mucit kimdir?",
    correct_answer: "Johannes Gutenberg",
    incorrect_answers: ["Leonardo da Vinci", "Nikola Tesla", "Isaac Newton"],
  },
  {
    category: "Coğrafya",
    type: "multiple",
    difficulty: "easy",
    question: "Dünyanın en derin noktası olan Mariana Çukuru hangi okyanustadır?",
    correct_answer: "Büyük Okyanus (Pasifik)",
    incorrect_answers: ["Atlantik Okyanusu", "Hint Okyanusu", "Arktik Okyanusu"],
  },
  {
    category: "Sinema & Sanat",
    type: "multiple",
    difficulty: "medium",
    question: "Mona Lisa tablosunu resmeden ünlü Rönesans sanatçısı kimdir?",
    correct_answer: "Leonardo da Vinci",
    incorrect_answers: ["Michelangelo", "Raphael", "Caravaggio"],
  },
];

// Helper to decode HTML entities from OpenTDB
function decodeHtml(html: string) {
  if (typeof document === "undefined") return html;
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export function TriviaQuizClient() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [category, setCategory] = useState("18"); // Computers
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState<TriviaQuestion[]>(BUNDLED_TRIVIA_TR);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);

  // Web Audio Synth for crisp sound effects
  const playSound = (type: "correct" | "wrong" | "finish") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch {
      // AudioContext fallback
    }
  };

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
    setTimeLeft(20);

    if (lang === "tr") {
      setQuestions(BUNDLED_TRIVIA_TR);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchTriviaQuestions(10, category, difficulty);
      if (data && data.length > 0) {
        setQuestions(data);
        toast.success("10 Yeni Soru Hazırlandı!");
      } else {
        setQuestions(BUNDLED_TRIVIA_TR);
      }
    } catch {
      setQuestions(BUNDLED_TRIVIA_TR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category, difficulty, lang]);

  // Countdown timer per question
  useEffect(() => {
    if (showResult || selectedAnswer !== null) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSelectAnswer("__TIMEOUT__");
          return 20;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, selectedAnswer, showResult]);

  const currentQ = questions[currentIndex] || BUNDLED_TRIVIA_TR[0];

  const answers = React.useMemo(() => {
    if (!currentQ) return [];
    const list = [...currentQ.incorrect_answers, currentQ.correct_answer];
    return list.sort(() => Math.random() - 0.5);
  }, [currentQ]);

  const handleSelectAnswer = (ans: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ans);

    const isCorrect = ans === currentQ.correct_answer;
    if (isCorrect) {
      const pts = 10 + streak * 3 + Math.round(timeLeft * 0.5);
      setScore((s) => s + pts);
      setStreak((st) => {
        const next = st + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      playSound("correct");
      toast.success(`Doğru Cevap! (+${pts} Puan)`);
    } else {
      setStreak(0);
      playSound("wrong");
      if (ans === "__TIMEOUT__") {
        toast.error(`Süre doldu! Doğru cevap: ${decodeHtml(currentQ.correct_answer)}`);
      } else {
        toast.error(`Yanlış! Doğru cevap: ${decodeHtml(currentQ.correct_answer)}`);
      }
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setTimeLeft(20);
      } else {
        setShowResult(true);
        playSound("finish");
      }
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300 backdrop-blur-xl mb-3">
          <HelpCircle className="h-3.5 w-3.5 text-pink-400" />
          <span>Interactive Trivia Quiz Arena</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          İnteraktif Bilgi Yarışması & Trivia Arena
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Bilim, teknoloji, tarih ve genel kültür kategorilerinde bilginizi test edin, seri çarpanları ve ses efektleriyle yarışın.
        </p>
      </div>

      {/* Control Bar: Language, Category & Sound */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-4 shadow-2xl mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "tr" ? "en" : "tr")}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <Languages className="h-3.5 w-3.5 text-pink-400" />
            <span>{lang === "tr" ? "Türkçe Havuz" : "English Global Pool"}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-zinc-500" />}
            <span>{soundEnabled ? "Ses Açık" : "Ses Kapalı"}</span>
          </button>
        </div>

        {/* Live Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Flame className="h-3.5 w-3.5" />
            <span>{streak}x Seri</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
            <Trophy className="h-3.5 w-3.5" />
            <span>{score} Puan</span>
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      {!showResult ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Question Header & Timer */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2.5 py-1 text-xs font-bold font-mono">
                Soru {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs text-zinc-400 font-semibold">{currentQ.category}</span>
            </div>

            <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              timeLeft <= 5
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : "bg-white/[0.04] text-zinc-300 border-white/10"
            }`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {decodeHtml(currentQ.question)}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {answers.map((ans) => {
              const isSelected = selectedAnswer === ans;
              const isCorrect = ans === currentQ.correct_answer;
              let style = "bg-white/[0.03] border-white/10 text-zinc-300 hover:border-pink-500/40 hover:bg-white/[0.06] hover:text-white";

              if (selectedAnswer !== null) {
                if (isCorrect) {
                  style = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/10";
                } else if (isSelected) {
                  style = "bg-rose-500/20 border-rose-500/60 text-rose-300";
                } else {
                  style = "bg-white/[0.01] border-white/5 text-zinc-600 opacity-50";
                }
              }

              return (
                <button
                  key={ans}
                  onClick={() => handleSelectAnswer(ans)}
                  disabled={selectedAnswer !== null}
                  className={`flex items-center justify-between p-4 rounded-xl border text-sm font-semibold transition-all text-left ${style}`}
                >
                  <span>{decodeHtml(ans)}</span>
                  {selectedAnswer !== null && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over Scorecard */
        <div className="rounded-2xl border border-pink-500/30 bg-[#0d0e12]/90 backdrop-blur-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/40 bg-pink-500/15">
            <Trophy className="h-8 w-8 text-pink-400" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Tebrikler! Arena Tamamlandı</h2>
            <p className="text-sm text-zinc-400 mt-1">Harika bir performans sergilediniz.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-xs text-zinc-400 mb-1">Toplam Skor</div>
              <div className="text-2xl font-black text-white font-mono">{score}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-xs text-zinc-400 mb-1">En Yüksek Seri</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{maxStreak}x</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-xs text-zinc-400 mb-1">Doğruluk</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                %{Math.round((score / (questions.length * 15)) * 100)}
              </div>
            </div>
          </div>

          <button
            onClick={loadQuestions}
            className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-xs font-bold text-white hover:bg-pink-500 transition-all shadow-lg shadow-pink-500/25"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Yeniden Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
}
