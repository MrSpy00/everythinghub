"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TextMorphProps {
  words?: string[];
  duration?: number;
  className?: string;
  gradient?: boolean;
}

const DEFAULT_WORDS = [
  "HER ŞEYİN MERKEZİ",
  "YOUTUBE ANALİZİ",
  "HIZLI VE ÜCRETSİZ",
  "GİZLİLİK ODAKLI",
  "MODERN ARAÇLAR",
];

export function TextMorph({
  words = DEFAULT_WORDS,
  duration = 2800,
  className = "",
  gradient = true,
}: TextMorphProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(timer);
  }, [words.length, duration]);

  const currentWord = useMemo(() => words[index], [words, index]);

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden py-1 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)", scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={
            gradient
              ? "bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent font-black tracking-tight drop-shadow-sm"
              : "text-white font-black tracking-tight"
          }
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
