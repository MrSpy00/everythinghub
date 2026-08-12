import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { decodeSharePayload } from "@/app/tools/hub-sense/games/shareEncoder";

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
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: "#09090b",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          background: `radial-gradient(ellipse at 70% 30%, ${accentColor}28 0%, transparent 70%)`,
        }}
      />

      {/* Frame border */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
          bottom: "24px",
          borderRadius: "28px",
          border: `2px solid ${accentColor}44`,
        }}
      />

      {/* Main card content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          flex: "1",
        }}
      >
        {/* Top brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            EverythingHub
          </span>
          <span
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: accentColor,
              marginLeft: "8px",
            }}
          >
            HubSense
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "rgba(255,255,255,0.3)",
              marginLeft: "18px",
            }}
          >
            {gameName} · {diffLabel} · {modeLabel}
          </span>
        </div>

        {/* Player Name */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: "800",
            color: "#ffffff",
            marginBottom: "4px",
          }}
        >
          {username}
        </div>

        {/* Big Score Counter */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
          <span
            style={{
              fontSize: "140px",
              fontWeight: "900",
              color: accentColor,
              lineHeight: "1",
              letterSpacing: "-4px",
            }}
          >
            {totalScore.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: "42px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            /50
          </span>
        </div>

        {/* 5 Rounds Grid */}
        <div style={{ display: "flex", gap: "14px", marginTop: "28px" }}>
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
                  borderRadius: "12px",
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
                    height: `${Math.max(6, (s / 10) * 56)}px`,
                    background: accentColor,
                    opacity: 0.75 + (s / 10) * 0.25,
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                }}
              >
                R{i + 1}: {s.toFixed(1)}
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
          padding: "0 60px 36px",
          color: "rgba(255,255,255,0.3)",
          fontSize: "15px",
        }}
      >
        <span>www.everythinghub.com.tr/tools/hub-sense</span>
        <span>Duyu Hafızası & Bilişsel Algı Arenası</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
