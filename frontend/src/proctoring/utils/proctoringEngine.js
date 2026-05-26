export const EVENT_SCORES = {
  "tab-switch": 10,
  "fullscreen-exit": 15,
  "copy-paste": 10,
  "right-click": 5,
  "developer-tools": 25,
  "multiple-face": 40,
  "no-face": 20,
  "face-out-of-frame": 15,
  "screen-share-stopped": 30,
  "suspicious-movement": 15,
  "long-eye-diversion": 15,
  "window-blur": 10,
  "multiple-tab": 20,
  "webcam-disabled": 40,
  "proctoring-start": 0,
  "session-connected": 0,
};

export const getProctorEventScore = (eventType) => {
  return EVENT_SCORES[eventType] ?? 10;
};

export const computeSuspicionRisk = (score, focus, attention) => {
  const scaled = Math.min(100, Math.max(0, score + Math.round((100 - focus) * 0.25) + Math.round((100 - attention) * 0.3)));
  if (scaled >= 65) return "High";
  if (scaled >= 35) return "Medium";
  return "Low";
};

export const buildProctorReport = ({ sessionId, userId, totalViolations, suspicionScore, focusPercentage, attentionScore, screenLogs, events, startedAt }) => {
  return {
    sessionId,
    userId,
    totalViolations,
    suspicionScore,
    focusPercentage,
    attentionScore,
    screenLogs,
    events,
    startedAt,
    generatedAt: new Date().toISOString(),
  };
};
