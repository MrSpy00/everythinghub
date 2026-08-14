"use client";
// ============================================================
// aegisTyping — WPM Graph Component
// Smooth SVG bezier curve with live animation
// ============================================================
import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface WpmGraphProps {
  data: number[]; // WPM values per second
  width?: number;
  height?: number;
  showTooltip?: boolean;
  accentColor?: string;
  errorPositions?: number[]; // second indices where errors spiked
  className?: string;
}

function cubicBezierPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev[0] + curr[0]) / 2;
    d += ` C ${cpX},${prev[1]} ${cpX},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  return d;
}

export const WpmGraph = React.memo(function WpmGraph({
  data,
  width = 600,
  height = 120,
  accentColor = "#22d3ee",
  errorPositions = [],
  className = "",
}: WpmGraphProps) {
  const padding = { top: 8, right: 8, bottom: 24, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const { points, linePath, areaPath, yLabels } = useMemo(() => {
    if (data.length < 2) {
      return { points: [], linePath: "", areaPath: "", yLabels: [] };
    }

    const maxVal = Math.max(...data, 10);
    const maxWpm = Math.ceil(maxVal / 10) * 10;
    const n = data.length;

    const pts: [number, number][] = data.map((v, i) => [
      padding.left + (i / Math.max(n - 1, 1)) * innerW,
      padding.top + innerH - (v / maxWpm) * innerH,
    ]);

    const lp = cubicBezierPath(pts);
    const bottom = padding.top + innerH;
    const ap =
      lp +
      ` L ${pts[pts.length - 1][0]},${bottom} L ${pts[0][0]},${bottom} Z`;

    const yl = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      value: Math.round(maxWpm * f),
      y: padding.top + innerH - f * innerH,
    }));

    return { points: pts, linePath: lp, areaPath: ap, yLabels: yl };
  }, [data, innerH, innerW, padding.left, padding.top]);

  if (data.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-white/20 text-xs ${className}`}
        style={{ height }}
      >
        Henüz veri yok
      </div>
    );
  }

  const gradientId = `wpm-grad-${Math.random().toString(36).slice(2, 7)}`;
  const maskId = `wpm-mask-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="WPM zaman grafiği"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
        </linearGradient>
        <mask id={maskId}>
          <motion.path
            d={`M ${padding.left},${padding.top + innerH} L ${padding.left},${padding.top + innerH} L ${padding.left + innerW},${padding.top + innerH} L ${padding.left + innerW},${padding.top + innerH} Z`}
            fill="white"
            animate={{
              d: areaPath,
            }}
            initial={{
              d: `M ${padding.left},${padding.top + innerH} L ${padding.left},${padding.top + innerH} L ${padding.left + innerW},${padding.top + innerH} L ${padding.left + innerW},${padding.top + innerH} Z`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </mask>
      </defs>

      {/* Grid lines */}
      {yLabels.map((l) => (
        <g key={l.value}>
          <line
            x1={padding.left}
            y1={l.y}
            x2={padding.left + innerW}
            y2={l.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            strokeDasharray="3,4"
          />
          <text
            x={padding.left - 4}
            y={l.y + 4}
            textAnchor="end"
            fontSize={9}
            fill="rgba(255,255,255,0.3)"
            fontFamily="monospace"
          >
            {l.value}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        mask={`url(#${maskId})`}
      />

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={accentColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Error spikes */}
      {errorPositions.map((secIdx) => {
        const pt = points[secIdx];
        if (!pt) return null;
        return (
          <circle
            key={secIdx}
            cx={pt[0]}
            cy={pt[1]}
            r={3}
            fill="#ef4444"
            opacity={0.8}
          />
        );
      })}

      {/* Last point dot */}
      {points.length > 0 && (
        <motion.circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={4}
          fill={accentColor}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        />
      )}
    </svg>
  );
});
