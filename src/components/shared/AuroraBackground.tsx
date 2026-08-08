"use client";

export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Main indigo orb */}
      <div
        className="aurora-orb"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #6366f1, transparent 70%)",
          top: "-100px",
          left: "-100px",
          animationDelay: "0s",
          animationDuration: "10s",
        }}
      />
      {/* Violet orb */}
      <div
        className="aurora-orb"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          top: "20%",
          right: "-80px",
          animationDelay: "2s",
          animationDuration: "12s",
        }}
      />
      {/* Pink orb */}
      <div
        className="aurora-orb"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, #ec4899, transparent 70%)",
          bottom: "10%",
          left: "30%",
          animationDelay: "4s",
          animationDuration: "9s",
          opacity: 0.1,
        }}
      />
    </div>
  );
}
