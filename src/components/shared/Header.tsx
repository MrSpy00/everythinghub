"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ExternalLink, PlaySquare, Coffee, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { StudioLogo } from "@/components/shared/StudioLogo";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const CommandPalette = dynamic(
  () =>
    import("@/components/shared/CommandPalette").then(
      (mod) => mod.CommandPalette
    ),
  { ssr: false }
);

function GitHubLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { t } = useLanguage();

  const handleHomeClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategoriesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        const toolsSection = document.getElementById("tools");
        if (toolsSection) {
          toolsSection.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        window.location.href = "/#tools";
      }
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const handleOpenPalette = () => setCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpenPalette);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("open-command-palette", handleOpenPalette);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 w-full pointer-events-none pt-2 sm:pt-3">
        <div className="mx-auto max-w-7xl 2xl:max-w-8xl px-3 sm:px-6">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: scrolled ? "rgba(9, 9, 11, 0.90)" : "rgba(9, 9, 11, 0.65)",
              borderColor: scrolled ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.08)",
              boxShadow: scrolled ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)" : "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
              borderRadius: "18px",
              backdropFilter: scrolled ? "blur(28px)" : "blur(18px)",
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-14 w-full items-center justify-between px-4 sm:px-6 border pointer-events-auto shadow-2xl"
          >
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={handleHomeClick}
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            data-cursor={t.home}
          >
            <StudioLogo className="h-8 w-8 group-hover:scale-105 transition-transform" />
            <span className="text-lg font-black tracking-tight text-white">
              everything
              <span className="gradient-text">hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1.5 md:flex">
            <Link
              href="/"
              onClick={handleHomeClick}
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
            >
              {t.home}
            </Link>
            <Link
              href="/#tools"
              onClick={handleCategoriesClick}
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
            >
              {t.tools}
            </Link>
            <a
              href="/#tools"
              onClick={handleCategoriesClick}
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              data-cursor={t.categories}
            >
              {t.categories}
            </a>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              data-cursor={t.quickAccess}
              aria-label={t.quickAccess}
            >
              <Search className="h-3.5 w-3.5 text-indigo-400" />
              <span>{t.quickAccess}</span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 border border-white/10">
                Ctrl K
              </kbd>
            </button>
          </nav>

          {/* Right side CTA & Language Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <LanguageToggle />

          <a
            href="https://buymeacoffee.com/aegissoft"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-white/[0.06] px-4 py-2 text-xs font-bold text-amber-300 backdrop-blur-3xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
            data-cursor={t.buyCoffee}
          >
            <Coffee className="h-4 w-4 text-amber-400" />
            <span>{t.buyCoffee}</span>
          </a>

          <a
            href="https://github.com/MrSpy00/everythinghub"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xl transition-all hover:border-indigo-500/50 hover:bg-white/[0.08] shadow-sm"
            data-cursor={t.githubRepo}
          >
            <GitHubLogo className="h-4 w-4 text-indigo-400" />
            <span>{t.githubRepo}</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Mobile menu toggle with smooth spring animation */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--hub-text-muted)] transition-all hover:text-white hover:bg-white/[0.08] md:hidden active:scale-90"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={menuOpen ? "open" : "closed"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </div>
      </header>

      {/* Mobile animated dropdown drawer floating cleanly below header in viewport */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-16 inset-x-3 z-50 overflow-hidden rounded-2xl border border-white/15 bg-[#09090b]/95 p-2 backdrop-blur-3xl md:hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
          >
            <motion.nav
              initial={{ y: -6 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5 p-3"
            >
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {t.home}
              </Link>
              <Link
                href="/#tools"
                onClick={(e) => {
                  setMenuOpen(false);
                  handleCategoriesClick(e);
                }}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {t.tools}
              </Link>
              <Link
                href="/#tools"
                onClick={(e) => {
                  setMenuOpen(false);
                  handleCategoriesClick(e);
                }}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {t.categories}
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-indigo-400" />
                  <span>{t.quickAccess}</span>
                </div>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 border border-white/10">
                  Ctrl K
                </kbd>
              </button>
              <div className="pt-2 flex flex-col gap-2 border-t border-white/5 mt-1">
                <a
                  href="https://buymeacoffee.com/aegissoft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-white/[0.06] p-3 text-sm font-extrabold text-amber-300 backdrop-blur-3xl hover:bg-white/15 hover:border-amber-400 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                >
                  <Coffee className="h-4 w-4 text-amber-400" />
                  <span>{t.buyCoffee}</span>
                </a>
                <a
                  href="https://github.com/MrSpy00/everythinghub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-sm font-bold text-white hover:bg-white/[0.08] transition-all"
                >
                  <GitHubLogo className="h-4 w-4 text-indigo-400" />
                  <span>{t.githubRepo}</span>
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
