import Link from "next/link";
import { Zap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--hub-border)] bg-[var(--hub-bg)]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              everything<span className="gradient-text">hub</span>
            </span>
          </Link>

          {/* Center text */}
          <p className="flex items-center gap-1.5 text-xs text-[var(--hub-text-subtle)]">
            Login gerektirmez
            <span className="text-[var(--hub-border)]">·</span>
            Tamamen ücretsiz
            <span className="text-[var(--hub-border)]">·</span>
            Her zaman açık
          </p>

          {/* Right */}
          <p className="flex items-center gap-1 text-xs text-[var(--hub-text-subtle)]">
            Made with <Heart className="h-3 w-3 text-pink-500" /> by everythinghub
          </p>
        </div>
      </div>
    </footer>
  );
}
