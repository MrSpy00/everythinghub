"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--hub-border)] bg-[var(--hub-bg)]/90 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            everything
            <span className="gradient-text">hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
          >
            Hub
          </Link>
          <Link
            href="/#tools"
            className="rounded-lg px-3 py-2 text-sm text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
          >
            Araçlar
          </Link>
          <Link
            href="/#categories"
            className="rounded-lg px-3 py-2 text-sm text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
          >
            Kategoriler
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-[var(--hub-border)] px-3 py-1.5 text-xs font-medium text-[var(--hub-text-muted)] transition-all hover:border-indigo-500/50 hover:text-white md:flex"
          >
            GitHub
          </a>
          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hub-border)] text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-b border-[var(--hub-border)] bg-[var(--hub-bg)]/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {[
              { href: "/", label: "Hub" },
              { href: "/#tools", label: "Araçlar" },
              { href: "/#categories", label: "Kategoriler" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
