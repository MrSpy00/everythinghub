import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "EverythingHub — Ultra Hızlı, Ücretsiz Dijital Araçlar Stüdyosu";
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
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 50% 25%, rgba(139, 92, 246, 0.35) 0%, transparent 65%), radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.2) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "white",
          padding: "32px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Outer Specular Glow Frame */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            borderRadius: "28px",
            border: "1.5px solid rgba(139, 92, 246, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px",
            backgroundColor: "rgba(13, 15, 23, 0.82)",
            boxShadow: "0 0 80px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Logo Shield SVG */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "110px",
              height: "110px",
              marginBottom: "20px",
              borderRadius: "28px",
              border: "1.5px solid rgba(168, 85, 247, 0.6)",
              backgroundColor: "#0d101d",
              boxShadow: "0 0 50px rgba(168, 85, 247, 0.45)",
            }}
          >
            <svg viewBox="0 0 64 64" width="80" height="80" fill="none">
              <circle cx="32" cy="32" r="28" fill="rgba(168, 85, 247, 0.35)" />
              <polygon
                points="32,6 54,18 54,46 32,58 10,46 10,18"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <polygon
                points="32,11 49,21 49,43 32,53 15,43 15,21"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.2"
              />
              <path
                d="M20 20L44 44M44 20L20 44"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M20 20L44 44M44 20L20 44"
                stroke="#c084fc"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polygon
                points="32,18 44,32 32,46 20,32"
                fill="#090d16"
                stroke="#a855f7"
                strokeWidth="2"
              />
              <polygon points="32,24 38,32 32,40 26,32" fill="#c084fc" />
              <circle cx="32" cy="32" r="3" fill="#030712" />
            </svg>
          </div>

          {/* Main Brand Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#ffffff" }}>everything</span>
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa, #c084fc, #ec4899)",
                backgroundClip: "text",
                color: "transparent",
                marginLeft: "2px",
              }}
            >
              hub
            </span>
          </div>

          {/* Studio Tagline */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "4px",
              color: "#a855f7",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            DİJİTAL ARAÇLAR STÜDYOSU
          </div>

          {/* Exact User Requested Description */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: "28px",
              textAlign: "center",
              maxWidth: "920px",
              lineHeight: 1.4,
            }}
          >
            Kayıt, üyelik veya API anahtarı gerektirmez; tüm işlemler %100 gizli ve tarayıcı taraflı çalışır.
          </div>

          {/* Feature Badges */}
          <div style={{ display: "flex", gap: "14px" }}>
            <div
              style={{
                padding: "8px 22px",
                borderRadius: "9999px",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                color: "#e9d5ff",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              14 Aktif Araç
            </div>
            <div
              style={{
                padding: "8px 22px",
                borderRadius: "9999px",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#a7f3d0",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              %100 Gizli & Sıfır Veri Saklama
            </div>
            <div
              style={{
                padding: "8px 22px",
                borderRadius: "9999px",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                color: "#c7d2fe",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              www.everythinghub.com.tr
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
