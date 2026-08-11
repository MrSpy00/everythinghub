"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, TranslationDictionary } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("tr");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("everythinghub_lang") as Language;
      if (saved === "tr" || saved === "en") {
        setLangState(saved);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("everythinghub_lang", newLang);
    }
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: "tr" as Language,
      setLang: () => {},
      t: translations.tr,
    };
  }
  return context;
}
