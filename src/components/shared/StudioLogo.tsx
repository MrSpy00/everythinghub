import React from "react";

export function StudioLogo({
  className = "h-8 w-8",
  showBg = true,
}: {
  className?: string;
  showBg?: boolean;
}) {
  const iconContent = (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
    >
      <defs>
        {/* Anthracite Metallic Gradient */}
        <linearGradient id="anthraciteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Vibrant Neon Purple Gradient */}
        <linearGradient id="purpleNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Deep Violet Glow Filter */}
        <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Purple Background Glow */}
      <circle cx="32" cy="32" r="28" fill="url(#purpleGlow)" />

      {/* Anthracite Outer Hexagonal Shield */}
      <polygon
        points="32,6 54,18 54,46 32,58 10,46 10,18"
        fill="url(#anthraciteGrad)"
        stroke="#475569"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Inner Neon Purple Hexagonal Border */}
      <polygon
        points="32,11 49,21 49,43 32,53 15,43 15,21"
        fill="none"
        stroke="url(#purpleNeonGrad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Anthracite Diagonal Cross Struts */}
      <path
        d="M20 20L44 44M44 20L20 44"
        stroke="#1e293b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20 20L44 44M44 20L20 44"
        stroke="url(#purpleNeonGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Central Anthracite & Purple Diamond Core */}
      <polygon
        points="32,18 44,32 32,46 20,32"
        fill="#090d16"
        stroke="url(#purpleNeonGrad)"
        strokeWidth="2"
      />

      {/* Inner Glowing Core Hex */}
      <polygon
        points="32,24 38,32 32,40 26,32"
        fill="url(#purpleNeonGrad)"
      />

      {/* Center Black Pupil */}
      <circle cx="32" cy="32" r="3" fill="#030712" />

      {/* 4 Corner Neon Accent Dots */}
      <circle cx="32" cy="11" r="2" fill="#c084fc" />
      <circle cx="49" cy="32" r="2" fill="#a855f7" />
      <circle cx="32" cy="53" r="2" fill="#7c3aed" />
      <circle cx="15" cy="32" r="2" fill="#c084fc" />
    </svg>
  );

  if (!showBg) return <div className={className}>{iconContent}</div>;

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border border-purple-500/30 bg-[#07090e] p-1.5 backdrop-blur-2xl shadow-xl shadow-purple-950/40 transition-transform group-hover:scale-105 ${className}`}
    >
      {iconContent}
    </div>
  );
}
