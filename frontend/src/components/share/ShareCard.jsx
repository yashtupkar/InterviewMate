import React, { forwardRef } from "react";

/**
 * ShareCard – 600×315px branded image card for html2canvas capture.
 * All styles are inline. No Tailwind. No CSS transforms.
 * Logo uses an absolute URL so html2canvas can fetch it via CORS.
 */
const ShareCard = forwardRef(function ShareCard(
  { type, score, role, topic, scoreBreakdown, date },
  ref
) {
  const subject =
    type === "interview" ? role || "Mock Interview" : topic || "Group Discussion";
  const label =
    score >= 75
      ? "Impressive Performance!"
      : score >= 50
      ? "Solid Foundation"
      : "Learning Phase";
  const scoreColor =
    score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  // SVG ring — padded so stroke never clips
  const SIZE = 108;
  const STROKE = 9;
  const R = (SIZE - STROKE) / 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - Math.min(Math.max(score, 0), 100) / 100);

  const topMetrics = Object.entries(scoreBreakdown || {})
    .filter(([, v]) => typeof v === "number")
    .slice(0, 4);

  const metricColors = ["#bef264", "#ec4899", "#f59e0b", "#10b981"];

  const formattedDate = (date ? new Date(date) : new Date()).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const logoSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/assets/shareAssets/full%20logo.png`
      : "/assets/shareAssets/full%20logo.png";

  const badgeSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/assets/shareAssets/${type === "interview" ? "interview" : "gd"}-badge.png`
      : `/assets/shareAssets/${type === "interview" ? "interview" : "gd"}-badge.png`;

  const badgeLabel =
    type === "interview" ? "MOCK INTERVIEW" : "GROUP DISCUSSION";

  return (
    <div
      ref={ref}
      style={{
        width: 600,
        height: 315,
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #111111 60%, #0f1a0a 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        position: "relative",
        borderRadius: 16,
        boxSizing: "border-box",
      }}
    >
      {/* —— Glow blobs —— */}
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -60,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${scoreColor} 0%, transparent 70%)`,
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, #bef264 0%, transparent 70%)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      />

      {/* —— Decorative grid —— */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none" }}
        width="600"
        height="315"
      >
        {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={315} stroke="white" strokeWidth="1" />
        ))}
        {[60, 120, 180, 240, 300].map((y) => (
          <line key={y} x1={0} y1={y} x2={600} y2={y} stroke="white" strokeWidth="1" />
        ))}
      </svg>

      {/* —— Top accent bar —— */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #bef264, #10b981, transparent)",
          borderRadius: "16px 16px 0 0",
        }}
      />

      {/* ======== MAIN LAYOUT ======== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* —— Header row — using flexbox for html2canvas reliability —— */}
        <div
          style={{
            height: 44, // increased to allow a bigger logo
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo — left, vertically centred */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src={logoSrc}
              alt="PlaceMateAI"
              width={160} // increased size further
              crossOrigin="anonymous"
              style={{ display: "block", objectFit: "contain" }}
            />
          </div>

          {/* Badge — right, vertically centred */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={badgeSrc}
              alt={badgeLabel}
              height={26}
              crossOrigin="anonymous"
              style={{ display: "block", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* —— Centre row: score ring + metrics —— */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            flex: 1,
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          {/* Score ring with absolutely-positioned overlay */}
          <div
            style={{
              position: "relative",
              width: SIZE,
              height: SIZE,
              flexShrink: 0,
            }}
          >
            {/* SVG ring */}
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              style={{ display: "block" }}
            >
              <g transform={`rotate(-90 ${CX} ${CY})`}>
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={STROKE}
                />
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                />
              </g>
            </svg>

            {/* Score text — absolute, centred in the ring */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: SIZE,
                height: SIZE,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "#71717a",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  marginTop: 4,
                  textTransform: "uppercase",
                }}
              >
                Overall
              </span>
            </div>
          </div>

          {/* Right: subject, label, metric bars */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  color: "#71717a",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {subject}
              </span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              {label}
            </div>

            {/* Metric bars */}
            <div
              style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}
            >
              {topMetrics.map(([key, val], i) => {
                const pretty = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase())
                  .replace(/Score$/, "")
                  .trim();
                return (
                  <div
                    key={key}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        color: "#71717a",
                        fontWeight: 700,
                        width: 90,
                        flexShrink: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {pretty}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${val}%`,
                          height: "100%",
                          borderRadius: 99,
                          background: metricColors[i % metricColors.length],
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        color: "#a1a1aa",
                        fontWeight: 700,
                        width: 24,
                        textAlign: "right",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* —— Footer —— */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: "#52525b", fontWeight: 700 }}>
            {formattedDate}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#bef264",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            placemateai.com → View Full Report
          </span>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
