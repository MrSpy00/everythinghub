"use client";

import Link from "next/link";
import { StudioLogo } from "@/components/shared/StudioLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Heart,
  ExternalLink,
  ShieldCheck,
  PlaySquare,
  Image as ImageIcon,
  Code2,
  Palette,
  Coffee,
} from "lucide-react";

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

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-white/10 bg-[#09090b]/90 backdrop-blur-2xl py-12 sm:py-16">
      <div className="mx-auto max-w-7xl 2xl:max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-10 pb-10 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <StudioLogo className="h-9 w-9 group-hover:scale-105 transition-transform" />
              <span className="text-xl font-black tracking-tight text-white">
                everything<span className="gradient-text">hub</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[var(--hub-text-muted)] max-w-sm leading-relaxed mb-5">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/MrSpy00/everythinghub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:border-indigo-500/50 hover:bg-white/[0.08]"
                data-cursor="GitHub"
              >
                <GitHubLogo className="h-3.5 w-3.5 text-indigo-400" />
                <span>{t.githubRepo}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a
                href="https://github.com/MrSpy00"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-[var(--hub-text-muted)] transition-all hover:text-white hover:border-white/20"
                data-cursor="Geliştirici"
              >
                <span>@MrSpy00</span>
              </a>
            </div>
          </div>

          {/* Categories with pure vector SVG icons */}
          <div>
            <h4
              suppressHydrationWarning
              className="text-xs font-bold uppercase tracking-wider text-white mb-4"
            >
              {t.categories}
            </h4>
            <ul className="space-y-3 text-xs text-[var(--hub-text-muted)]">
              <li>
                <Link
                  href="/tools/yt-playlist-length"
                  className="flex items-center gap-2 hover:text-indigo-300 transition-colors"
                >
                  <PlaySquare className="h-3.5 w-3.5 text-red-400" />
                  <span>{t.ytPlaylistTitle}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/image-compressor"
                  className="flex items-center gap-2 hover:text-indigo-300 transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-violet-400" />
                  <span>{t.imgCompressTitle}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/json-formatter"
                  className="flex items-center gap-2 hover:text-indigo-300 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{t.jsonTitle}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/color-picker"
                  className="flex items-center gap-2 hover:text-indigo-300 transition-colors"
                >
                  <Palette className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t.colorPickerTitle}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio & Attribution with sleek liquid glass styling */}
          <div>
            <h4
              suppressHydrationWarning
              className="text-xs font-bold uppercase tracking-wider text-white mb-4"
            >
              {t.designDevBy}
            </h4>
            <p className="text-xs text-[var(--hub-text-muted)] mb-4 leading-relaxed">
              {t.turbopackDesc} · {t.zeroDataDesc}
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://www.aegissoft.com.tr/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-bold text-indigo-300 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:border-indigo-400/50 hover:bg-white/[0.08] hover:text-white shadow-lg"
                data-cursor="aegisSoft"
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="h-4 w-4 text-indigo-400 transition-transform group-hover:scale-110" />
                  <span>{t.designDevBy}</span>
                </div>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </a>

              <a
                href="https://buymeacoffee.com/aegissoft"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-bold text-amber-300 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/50 hover:bg-white/[0.08] hover:text-white shadow-lg"
                data-cursor="Kahve"
              >
                <div className="flex items-center gap-2.5">
                  <Coffee className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
                  <span>{t.buyCoffee}</span>
                </div>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>© {currentYear} <strong className="text-white">aegisSoft</strong>. {t.allRightsReserved}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://www.aegissoft.com.tr/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              aegisSoft Studio
            </a>
            <span>·</span>
            <a
              href="https://github.com/MrSpy00/everythinghub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              {t.githubRepo}
            </a>
            <span>·</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-pink-400 fill-pink-400/30" /> for everyone
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
