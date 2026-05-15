/**
 * Test utilities and mock data for cheat detection system
 */

// Mock detection results for testing
export const mockDetections = {
  noCheat: {
    success: true,
    detections: {
      objects: { phone: [], book: [], laptop: [], monitor: [] },
      gaze: {
        gaze_direction: { x: 0, y: 0, angle: 5 },
        head_pose: { pitch: 0, yaw: 0, roll: 0 },
        confidence: 0.9,
      },
      attire: { suspicious_items: [], earpiece_detected: false },
    },
    risks: {
      phone: 0,
      book: 0,
      gaze_deviation: 5,
      attire: 0,
      overall: 2,
    },
    flags: {
      phoneDetected: false,
      bookDetected: false,
      extremeGazeDev: false,
      suspiciousAttire: false,
    },
    riskLevel: "low",
  },

  phoneDetected: {
    success: true,
    detections: {
      objects: {
        phone: [{ confidence: 0.95, bbox: [100, 50, 50, 100] }],
        book: [],
        laptop: [],
        monitor: [],
      },
      gaze: {
        gaze_direction: { x: 0, y: 0, angle: 8 },
        head_pose: { pitch: 0, yaw: 0, roll: 0 },
        confidence: 0.9,
      },
      attire: { suspicious_items: [], earpiece_detected: false },
    },
    risks: {
      phone: 95,
      book: 0,
      gaze_deviation: 8,
      attire: 0,
      overall: 45,
    },
    flags: {
      phoneDetected: true,
      bookDetected: false,
      extremeGazeDev: false,
      suspiciousAttire: false,
    },
    riskLevel: "medium",
  },

  bookDetected: {
    success: true,
    detections: {
      objects: {
        phone: [],
        book: [{ confidence: 0.88, bbox: [200, 150, 100, 150] }],
        laptop: [],
        monitor: [],
      },
      gaze: {
        gaze_direction: { x: 0, y: 0, angle: 10 },
        head_pose: { pitch: 0, yaw: 0, roll: 0 },
        confidence: 0.85,
      },
      attire: { suspicious_items: [], earpiece_detected: false },
    },
    risks: {
      phone: 0,
      book: 88,
      gaze_deviation: 10,
      attire: 0,
      overall: 35,
    },
    flags: {
      phoneDetected: false,
      bookDetected: true,
      extremeGazeDev: false,
      suspiciousAttire: false,
    },
    riskLevel: "low",
  },

  extremeGazeDev: {
    success: true,
    detections: {
      objects: { phone: [], book: [], laptop: [], monitor: [] },
      gaze: {
        gaze_direction: { x: 60, y: 40, angle: 75 },
        head_pose: { pitch: 30, yaw: 40, roll: 10 },
        confidence: 0.92,
      },
      attire: { suspicious_items: [], earpiece_detected: false },
    },
    risks: {
      phone: 0,
      book: 0,
      gaze_deviation: 75,
      attire: 0,
      overall: 38,
    },
    flags: {
      phoneDetected: false,
      bookDetected: false,
      extremeGazeDev: true,
      suspiciousAttire: false,
    },
    riskLevel: "medium",
  },

  suspiciousAttire: {
    success: true,
    detections: {
      objects: { phone: [], book: [], laptop: [], monitor: [] },
      gaze: {
        gaze_direction: { x: 0, y: 0, angle: 5 },
        head_pose: { pitch: 0, yaw: 0, roll: 0 },
        confidence: 0.9,
      },
      attire: {
        suspicious_items: [
          {
            type: "potential_earpiece",
            position: { x: 50, y: 80 },
            area: 120,
            confidence: 0.75,
          },
        ],
        earpiece_detected: true,
      },
    },
    risks: {
      phone: 0,
      book: 0,
      gaze_deviation: 5,
      attire: 75,
      overall: 25,
    },
    flags: {
      phoneDetected: false,
      bookDetected: false,
      extremeGazeDev: false,
      suspiciousAttire: true,
    },
    riskLevel: "low",
  },

  multipleCheats: {
    success: true,
    detections: {
      objects: {
        phone: [{ confidence: 0.92, bbox: [100, 50, 50, 100] }],
        book: [{ confidence: 0.85, bbox: [200, 150, 100, 150] }],
        laptop: [],
        monitor: [],
      },
      gaze: {
        gaze_direction: { x: 45, y: 35, angle: 60 },
        head_pose: { pitch: 20, yaw: 30, roll: 5 },
        confidence: 0.88,
      },
      attire: {
        suspicious_items: [
          {
            type: "potential_earpiece",
            position: { x: 50, y: 75 },
            area: 100,
            confidence: 0.7,
          },
        ],
        earpiece_detected: true,
      },
    },
    risks: {
      phone: 92,
      book: 85,
      gaze_deviation: 60,
      attire: 70,
      overall: 82,
    },
    flags: {
      phoneDetected: true,
      bookDetected: true,
      extremeGazeDev: true,
      suspiciousAttire: true,
    },
    riskLevel: "high",
  },
};

// Create mock base64 frames for testing
export function generateMockFrame(width = 640, height = 480) {
  // Create a simple canvas element (if in browser)
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Draw random pattern
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.8);
  }

  // Return a minimal JPEG base64 for Node.js testing
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD";
}

// Mock session data
export const mockSessionData = {
  sessionId: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  interviewType: "technical",
  startTime: new Date(),
};

// Mock cheat indicator
export function createMockIndicator(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439013",
    sessionId: mockSessionData.sessionId,
    userId: mockSessionData.userId,
    detectionType: "phone",
    severity: "high",
    confidence: 95,
    frameMeta: {
      timestamp: new Date(),
      frameIndex: 10,
      boundingBox: { x: 100, y: 50, w: 50, h: 100 },
      frameWidth: 640,
      frameHeight: 480,
    },
    details: {
      description: "Mobile phone detected in frame",
      objectDetected: "Cell Phone",
    },
    flagged: true,
    createdAt: new Date(),
    ...overrides,
  };
}

// Test helper: Wait for detection
export async function waitForDetection(detections, timeout = 5000) {
  const startTime = Date.now();
  while (
    (!detections || detections.length === 0) &&
    Date.now() - startTime < timeout
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return detections;
}

// Test helper: Simulate frame stream
export async function simulateFrameStream(
  frames = 10,
  interval = 100,
  onFrame = null,
) {
  for (let i = 0; i < frames; i++) {
    const frame = generateMockFrame();
    if (onFrame) await onFrame(frame, i);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// Test helper: Assert detection result
export function assertDetection(result, expectedType, minConfidence = 60) {
  if (!result.success) {
    throw new Error("Detection failed");
  }

  if (result.risks[expectedType] < minConfidence) {
    throw new Error(
      `Expected ${expectedType} risk >= ${minConfidence}, got ${result.risks[expectedType]}`,
    );
  }

  if (!result.flags[expectedType + "Detected"]) {
    throw new Error(`Expected ${expectedType} flag to be set`);
  }
}

// Test helper: Assert session flags
export async function assertSessionFlags(sessionId, expectedRiskLevel) {
  const response = await fetch(`/api/cheat/session/${sessionId}/flags`);
  const { cheatFlags } = await response.json();

  if (cheatFlags.summary.overallRiskLevel !== expectedRiskLevel) {
    throw new Error(
      `Expected risk level ${expectedRiskLevel}, got ${cheatFlags.summary.overallRiskLevel}`,
    );
  }
}

// Performance test helper
export async function measureDetectionLatency(frameData, iterations = 100) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    const response = await fetch("/api/cheat/detect-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frameData,
        sessionId: mockSessionData.sessionId,
        userId: mockSessionData.userId,
      }),
    });

    const endTime = performance.now();
    times.push(endTime - startTime);

    if (!response.ok) throw new Error("Detection failed");
  }

  return {
    average: times.reduce((a, b) => a + b) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
  };
}

// Stress test helper
export async function stressTestDetection(
  concurrentSessions = 50,
  framesPerSession = 10,
) {
  const results = [];

  for (let s = 0; s < concurrentSessions; s++) {
    const sessionId = `stress-test-${s}`;
    const sessionResults = [];

    for (let f = 0; f < framesPerSession; f++) {
      const frame = generateMockFrame();

      const promise = fetch("/api/cheat/detect-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameData: frame,
          sessionId,
          userId: `user-${s}`,
        }),
      }).then((r) => r.json());

      sessionResults.push(promise);
    }

    results.push(...sessionResults);
  }

  return Promise.all(results);
}
