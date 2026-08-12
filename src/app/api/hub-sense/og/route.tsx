import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { decodeSharePayload } from "@/app/tools/hub-sense/games/shareEncoder";

export const runtime = "edge";

const ACCENT_COLORS: Record<string, string> = {
  color: "#6366f1",
  sound: "#8b5cf6",
  time: "#10b981",
  shape: "#f59e0b",
  sequence: "#ec4899",
};

const GAME_NAMES: Record<string, string> = {
  color: "Renk",
  sound: "Ses",
  time: "Zaman",
  shape: "Şekil",
  sequence: "Dizi",
};

const DIFF_LABELS: Record<string, string> = {
  easy: "Kolay",
  hard: "Zor",
  brutal: "Vahşi",
};

const MODE_LABELS: Record<string, string> = {
  solo: "Solo",
  daily: "Günlük",
  challenge: "Meydan Okuma",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const data = searchParams.get("data");

  const payload = data ? decodeSharePayload(data) : null;

  const username = payload?.username ?? "HUBSENSE";
  const totalScore = payload?.totalScore ?? 0;
  const roundScores = payload?.roundScores ?? [0, 0, 0, 0, 0];
  const gameType = payload?.gameType ?? "color";
  const difficulty = payload?.difficulty ?? "easy";
  const mode = payload?.mode ?? "solo";
  const accentColor = ACCENT_COLORS[gameType] ?? "#6366f1";
  const gameName = GAME_NAMES[gameType] ?? gameType;
  const diffLabel = DIFF_LABELS[difficulty] ?? difficulty;
  const modeLabel = MODE_LABELS[mode] ?? mode;

  return new ImageResponse(
    /* eslint-disable @next/next/no-img-element */
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: "#09090b",
        position: "relative",
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          background: `radial-gradient(ellipse at 50% 50%, ${accentColor}22 0%, transparent 70%)`,
        }}
      />

      {/* Border */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          bottom: "20px",
          borderRadius: "24px",
          border: `2px solid ${accentColor}44`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          flex: "1",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: "700", color: "rgba(255,255,255,0.4)" }}>
            Hub
          </span>
          <span style={{ fontSize: "24px", fontWeight: "700", color: accentColor }}>
            Sense
          </span>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", marginLeft: "16px" }}>
            {gameName} · {diffLabel} · {modeLabel}
          </span>
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: "700",
            color: "#fafafa",
            marginBottom: "8px",
          }}
        >
          {username}
        </div>

        {/* Score display */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
          <span
            style={{
              fontSize: "150px",
              fontWeight: "900",
              color: accentColor,
              lineHeight: "1",
            }}
          >
            {totalScore.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: "48px",
              color: "rgba(255,255,255,0.25)",
              marginBottom: "20px",
            }}
          >
            /50
          </span>
        </div>

        {/* Round bars */}
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          {roundScores.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: "1",
              }}
            >
              <div
                style={{
                  height: "56px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: `${Math.max(4, (s / 10) * 56)}px`,
                    background: accentColor,
                    opacity: 0.7 + (s / 10) * 0.3,
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                }}
              >
                {s.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 60px 40px",
          color: "rgba(255,255,255,0.2)",
          fontSize: "16px",
        }}
      >
        <span>everythinghub.com.tr</span>
        <span>HubSense · Duyu Hafızası Arenası</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
