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
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full text-white"
    >
      {/* Outer Orbital Ring */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeOpacity="0.45"
      />

      {/* 4 Cardinal Hub Nodes */}
      <rect x="21" y="4" width="6" height="6" rx="2" fill="currentColor" />
      <rect x="38" y="21" width="6" height="6" rx="2" fill="currentColor" />
      <rect x="21" y="38" width="6" height="6" rx="2" fill="currentColor" />
      <rect x="4" y="21" width="6" height="6" rx="2" fill="currentColor" />

      {/* Connecting Beams */}
      <path
        d="M24 10V17M38 24H31M24 38V31M10 24H17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Central Core Diamond Hub */}
      <path
        d="M24 15L33 24L24 33L15 24L24 15Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <circle cx="24" cy="24" r="3.5" fill="#0f172a" />
    </svg>
  );

  if (!showBg) return <div className={className}>{iconContent}</div>;

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/15 p-1.5 backdrop-blur-xl shadow-lg shadow-indigo-500/15 transition-transform ${className}`}
    >
      {iconContent}
    </div>
  );
}
