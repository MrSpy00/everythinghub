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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-[#09090b]/85 backdrop-blur-2xl shadow-xl shadow-black/30"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl 2xl:max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            data-cursor="Home"
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
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
            >
              {t.home}
            </Link>
            <Link
              href="/#tools"
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
            >
              {t.tools}
            </Link>
            <Link
              href="/#categories"
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
            >
              {t.categories}
            </Link>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-2"
              data-cursor="Ara"
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
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 backdrop-blur-xl transition-all hover:border-amber-400 hover:bg-amber-500/20 shadow-sm"
            data-cursor="Destek"
          >
            <Coffee className="h-4 w-4 text-amber-400" />
            <span>{t.buyCoffee}</span>
          </a>

          <a
            href="https://github.com/MrSpy00/everythinghub"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xl transition-all hover:border-indigo-500/50 hover:bg-white/[0.08] shadow-sm"
            data-cursor="GitHub"
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
      </div>

      {/* Mobile animated dropdown drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-white/10 bg-[#09090b]/95 backdrop-blur-3xl md:hidden shadow-2xl"
          >
            <motion.nav
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-1.5 p-4"
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
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {t.tools}
              </Link>
              <Link
                href="/#categories"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {t.categories}
              </Link>
              <Link
                href="/tools/yt-playlist-length"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2"
              >
                <PlaySquare className="h-4 w-4 text-indigo-400" />
                <span>{t.ytPlaylistTitle}</span>
              </Link>
              <div className="pt-2 flex flex-col gap-2 border-t border-white/5 mt-1">
                <a
                  href="https://buymeacoffee.com/aegissoft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 p-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/25 transition-all"
                >
                  <Coffee className="h-4 w-4" />
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
      </header>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
