import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "EverythingHub — Ultra Hızlı Dijital Araçlar Stüdyosu";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.25), transparent 70%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15), transparent 60%)",
          fontFamily: "sans-serif",
          color: "white",
          padding: "40px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Outer Specular Border Frame */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            borderRadius: "24px",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "rgba(9, 13, 22, 0.7)",
          }}
        >
          {/* Logo Shield SVG */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100px",
              height: "100px",
              marginBottom: "24px",
              borderRadius: "24px",
              border: "1px solid rgba(168, 85, 247, 0.5)",
              backgroundColor: "#07090e",
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.3)",
            }}
          >
            <svg viewBox="0 0 64 64" width="70" height="70" fill="none">
              <circle cx="32" cy="32" r="28" fill="rgba(168, 85, 247, 0.3)" />
              <polygon
                points="32,6 54,18 54,46 32,58 10,46 10,18"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <polygon
                points="32,11 49,21 49,43 32,53 15,43 15,21"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
              />
              <path
                d="M20 20L44 44M44 20L20 44"
                stroke="#a855f7"
                strokeWidth="2"
              />
              <polygon
                points="32,18 44,32 32,46 20,32"
                fill="#090d16"
                stroke="#c084fc"
                strokeWidth="2"
              />
              <polygon points="32,24 38,32 32,40 26,32" fill="#a855f7" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 900,
              letterSpacing: "-1px",
              marginBottom: "16px",
              background: "linear-gradient(to right, #ffffff, #c084fc, #a855f7)",
              backgroundClip: "text",
              color: "transparent",
              textTransform: "lowercase",
            }}
          >
            everythinghub
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#cbd5e1",
              marginBottom: "28px",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Ultra Hızlı, Ücretsiz & Zero-Login Dijital Araçlar Stüdyosu
          </div>

          {/* Feature Badges */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                color: "#e9d5ff",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              YouTube Playlist Analyzer
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#a7f3d0",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              %100 Gizli & İstemci Taraflı
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                color: "#c7d2fe",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Geliştirici & Tasarım Araçları
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
