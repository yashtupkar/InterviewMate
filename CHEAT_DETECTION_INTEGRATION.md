# Cheat Detection - Integration Guide for Developers

This guide shows how to integrate cheat detection into existing interview pages.

## Quick Start

### 1. Add Detection to Interview Component

```jsx
import { useRef, useEffect, useState } from "react";
import { useFrameCapture, useFrameStreaming } from "@/hooks/useFrameCapture";
import {
  CheatWarningBanner,
  RiskIndicatorDashboard,
} from "@/components/CheatWarningBanner";
import { CheatDetectionConsent } from "@/components/CheatDetectionConsent";

export function InterviewSession() {
  const videoRef = useRef(null);
  const [sessionId] = useSessionId(); // from your context
  const [userId] = useUserId(); // from auth
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(true);

  const { isCapturing } = useFrameCapture(videoRef.current, 500, consentGiven);

  const { isStreaming, detections, startStreaming, stopStreaming } =
    useFrameStreaming(
      sessionId,
      userId,
      process.env.REACT_APP_BACKEND_URL,
      consentGiven,
    );

  useEffect(() => {
    if (consentGiven) {
      startStreaming();
      return () => stopStreaming();
    }
  }, [consentGiven, startStreaming, stopStreaming]);

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsent(false);
  };

  const handleConsentReject = () => {
    // Handle rejection - maybe navigate away or disable certain features
    console.log("User rejected cheat detection consent");
  };

  const warnings =
    detections && detections.length > 0
      ? Object.entries(detections[detections.length - 1].flags || {})
          .filter(([_, value]) => value)
          .map(([key, _]) => ({
            type: key,
            message: `⚠️ ${key.replace(/_/g, " ")} detected`,
            severity: key === "phoneDetected" ? "critical" : "warning",
          }))
      : [];

  return (
    <div>
      {showConsent && (
        <CheatDetectionConsent
          onAccept={handleConsentAccept}
          onReject={handleConsentReject}
          sessionId={sessionId}
        />
      )}

      <video ref={videoRef} autoPlay muted playsInline />

      {consentGiven && (
        <>
          <CheatWarningBanner warnings={warnings} />
          <RiskIndicatorDashboard detections={detections} />
        </>
      )}

      {/* Your existing interview UI */}
    </div>
  );
}
```

### 2. Initialize Backend Routes

The routes are automatically registered in `backend/index.js`. Verify:

```javascript
const cheatDetectionRoutes = require("./routes/cheatDetectionRoutes");
app.use("/api/cheat", cheatDetectionRoutes);
```

### 3. Environment Setup

**Backend (.env)**

```
PYTHON_PATH=python
CHEAT_DETECTION_ENABLED=true
```

**Frontend (.env)**

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Advanced Usage

### Custom Detection Processing

```jsx
import { useEffect } from "react";

function useCheatDetectionHandler(sessionId, detections) {
  useEffect(() => {
    if (!detections || detections.length === 0) return;

    const latest = detections[detections.length - 1];

    // Custom logic based on detection results
    if (latest.risks.phone > 80) {
      console.warn("High phone detection risk!");
      // Maybe pause interview, show warning, etc.
    }

    if (latest.risks.gaze_deviation > 70) {
      console.warn("Extreme gaze deviation!");
    }
  }, [detections, sessionId]);
}
```

### Fetching Cheat Report After Interview

```jsx
async function getCheatReport(sessionId) {
  const response = await fetch(`/api/cheat/session/${sessionId}/report`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to get report");

  const { report } = await response.json();

  console.log("Cheat Report:");
  console.log(`- Risk Level: ${report.riskLevel}`);
  console.log(`- Phone instances: ${report.summary.totalPhoneInstances}`);
  console.log(`- Book instances: ${report.summary.totalBookInstances}`);
  console.log(`- Indicators: ${report.indicators.length}`);

  return report;
}
```

### Getting Real-Time Flags During Interview

```jsx
async function getSessionFlags(sessionId) {
  const response = await fetch(`/api/cheat/session/${sessionId}/flags`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to get flags");

  const { cheatFlags } = await response.json();

  return {
    detected: cheatFlags?.detected || false,
    riskLevel: cheatFlags?.summary?.overallRiskLevel || "none",
    warningCount: cheatFlags?.warnings?.length || 0,
  };
}
```

## Error Handling

```jsx
function useCheatDetectionWithErrorHandling(sessionId, userId) {
  const [error, setError] = useState(null);
  const { detections, isStreaming } = useFrameStreaming(
    sessionId,
    userId,
    process.env.REACT_APP_BACKEND_URL,
  );

  useEffect(() => {
    // Monitor for streaming errors
    if (error) {
      console.error("Cheat detection error:", error);
      // Show error toast/banner to user
      // Optional: disable detection and continue interview
    }
  }, [error]);

  return {
    detections,
    isStreaming,
    error,
  };
}
```

## Testing

### Unit Test Example

```javascript
// __tests__/CheatAnalyzer.test.js
const CheatAnalyzer = require("../services/CheatAnalyzer");

describe("CheatAnalyzer", () => {
  test("should analyze phone detection correctly", async () => {
    const detectionResult = {
      success: true,
      flags: { phoneDetected: true },
      risks: { phone: 85 },
    };

    const indicators = await CheatAnalyzer.analyzeDetection(
      "sessionId",
      "userId",
      detectionResult,
    );

    expect(indicators).toHaveLength(1);
    expect(indicators[0].detectionType).toBe("phone");
    expect(indicators[0].severity).toBe("high");
  });
});
```

### Integration Test Example

```javascript
// __tests__/cheatDetection.integration.test.js
describe("Cheat Detection API", () => {
  test("should process frame and create indicator", async () => {
    const response = await request(app).post("/api/cheat/detect-frame").send({
      frameData: "data:image/jpeg;base64,...",
      sessionId: "test-session",
      userId: "test-user",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.detectionResult).toBeDefined();
  });
});
```

## Performance Considerations

### 1. Frame Rate Optimization

```jsx
// Don't capture every frame - every 500ms is usually enough
const { isCapturing } = useFrameCapture(videoRef.current, 500, enabled);

// Reduce further during high CPU load
const interval = cpuLoad > 80 ? 1000 : 500;
```

### 2. Frame Compression

The service automatically compresses frames to ~50KB per frame. For mobile:

```jsx
// Use even lower quality on slow networks
const quality = isSlowNetwork ? 30 : 60;
```

### 3. Disable During Non-Critical Sections

```jsx
// Only enable during Q&A, not during transitions
const shouldDetect = currentPhase === "response" && !isLoading;
const { isCapturing } = useFrameCapture(videoRef.current, 500, shouldDetect);
```

## Disabling for Testing

```jsx
// Development mode - disable cheat detection
const detectionEnabled =
  process.env.NODE_ENV === "production" &&
  process.env.REACT_APP_CHEAT_DETECTION_ENABLED !== "false";

const { isStreaming, detections } = useFrameStreaming(
  sessionId,
  userId,
  backendUrl,
  detectionEnabled,
);
```

## Fallback Handling

```jsx
function useCheatDetectionWithFallback(sessionId, userId) {
  const [fallbackMode, setFallbackMode] = useState(false);

  const { detections, error } = useFrameStreaming(
    sessionId,
    userId,
    backendUrl,
    !fallbackMode,
  );

  // If detection fails, gracefully degrade to audio-only monitoring
  useEffect(() => {
    if (error && !fallbackMode) {
      console.warn("Cheat detection failed, entering fallback mode");
      setFallbackMode(true);
      // Maybe disable video, continue with audio
    }
  }, [error, fallbackMode]);

  return { detections, fallbackMode };
}
```

## Privacy Best Practices

1. **Always show consent modal first** - Don't enable detection without explicit user consent
2. **Explain what you're doing** - Be transparent about detection types
3. **Provide appeal mechanism** - Users should be able to contest flags
4. **Minimize storage** - Delete raw frames immediately, only keep metadata
5. **Use HTTPS** - All frame data should be encrypted in transit

## Monitoring & Analytics

### Log Detection Events

```javascript
// In backend routes
logger.info("Cheat detection processed", {
  sessionId,
  userId,
  detectionType,
  risk: detectionResult.risks.overall,
  timestamp: new Date(),
});
```

### Track Metrics

```javascript
const metrics = {
  totalFramesProcessed: 0,
  falsePositives: 0,
  truePositives: 0,
  averageLatency: 0,
  successRate: 0,
};
```

## Support & Debugging

### Enable Debug Logging

```bash
DEBUG=true npm run dev
```

### Check Python YOLO Service

```bash
# Test Python detector directly
python backend/scripts/yolo_detector.py < test_input.json
```

### Monitor API Health

```bash
curl http://localhost:5000/api/cheat/health
```

## Next Steps

1. ✅ Integrate CheatDetectionConsent modal into interview start flow
2. ✅ Add useFrameCapture hook to video element
3. ✅ Display CheatWarningBanner and RiskIndicatorDashboard
4. ✅ Fetch and display cheat report after interview completes
5. ✅ Add appeal/review mechanism in user dashboard
6. ✅ Monitor false positive rate and adjust thresholds
7. ✅ Implement automated data cleanup for old indicators

---

**Questions?** Check CHEAT_DETECTION.md or backend logs for troubleshooting.
