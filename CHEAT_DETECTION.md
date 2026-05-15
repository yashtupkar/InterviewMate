# 🚨 Cheat Detection System for InterviewMate

This document describes the cheat detection system that identifies suspicious activities during AI interviews using YOLO-based computer vision.

## Overview

The cheat detection system monitors video during interviews to detect:

- **📱 Phone Usage** - Detects mobile phones in the frame
- **📚 Reference Materials** - Detects books, notes, and visible materials
- **👁️ Eye Gaze Deviation** - Tracks eye movement to detect looking away
- **🎧 Suspicious Attire** - Detects earpieces and suspicious items

## Architecture

```
Frontend (React)              Backend (Express + Node)         ML Service (Python)
├─ useFrameCapture hook ──────> POST /api/cheat/detect-frame ──> Python YOLO
├─ Frame streaming (500ms)     Frame compression & validation
└─ Warning UI                  └─ CheatAnalyzer service ───────> MongoDB
                                  └─ Cheat flags & indicators
```

## Installation

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB
- ffmpeg (optional, for advanced video processing)

### Backend Setup

1. **Install Node dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Install Python dependencies:**

   ```bash
   pip install ultralytics mediapipe opencv-python sharp redis bull
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   PYTHON_PATH=python  # or python3, or full path
   CHEAT_DETECTION_ENABLED=true
   ```

4. **Start the backend:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install React dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Detection Endpoints

#### `POST /api/cheat/detect-frame`

Process a single frame for cheat detection.

**Request:**

```json
{
  "frameData": "data:image/jpeg;base64,...",
  "sessionId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012"
}
```

**Response:**

```json
{
  "success": true,
  "detectionResult": {
    "detections": {
      "objects": {
        "phone": [],
        "book": [{"confidence": 0.85, "bbox": [x, y, w, h]}]
      },
      "gaze": {
        "gaze_direction": {"x": 10, "y": 5, "angle": 15},
        "head_pose": {"pitch": 0, "yaw": 5, "roll": 0},
        "confidence": 0.9
      },
      "attire": {
        "suspicious_items": [],
        "earpiece_detected": false
      }
    },
    "risks": {
      "phone": 0,
      "book": 85,
      "gaze_deviation": 15,
      "attire": 0,
      "overall": 40
    },
    "flags": {
      "phoneDetected": false,
      "bookDetected": true,
      "extremeGazeDev": false,
      "suspiciousAttire": false
    },
    "riskLevel": "low"
  },
  "indicatorsCreated": 1
}
```

#### `POST /api/cheat/detect-stream`

Continuous stream detection (called every 500ms during interview).

Same request/response structure as `detect-frame`.

#### `GET /api/cheat/session/:sessionId/flags`

Get cheat flags for a session.

**Response:**

```json
{
  "success": true,
  "cheatFlags": {
    "detected": true,
    "indicators": ["id1", "id2"],
    "summary": {
      "totalPhoneInstances": 2,
      "totalBookInstances": 5,
      "totalGazeDeviations": 3,
      "averageGazeDeviation": 45,
      "overallRiskLevel": "medium"
    }
  }
}
```

#### `GET /api/cheat/session/:sessionId/report`

Generate full cheat analysis report.

**Response:**

```json
{
  "success": true,
  "report": {
    "detected": true,
    "riskLevel": "high",
    "summary": { ... },
    "indicators": [ ... ],
    "warnings": [ ... ]
  }
}
```

#### `GET /api/cheat/indicators/:sessionId`

Get all indicators for a session.

**Query parameters:**

- `type`: Filter by detection type (phone, book, eye_gaze, attire)
- `severity`: Filter by severity (low, medium, high)

#### `POST /api/cheat/analyze-sequence`

Analyze a sequence of detections.

**Request:**

```json
{
  "detections": [ { detection1 }, { detection2 } ],
  "sessionId": "507f1f77bcf86cd799439011"
}
```

#### `POST /api/cheat/session/:sessionId/clear`

Clear cheat flags (admin action).

**Request:**

```json
{
  "reason": "False positive - user was holding book for reference"
}
```

#### `GET /api/cheat/health`

Check YOLO service health.

## Frontend Integration

### Using Frame Capture Hook

```jsx
import { useFrameCapture, useFrameStreaming } from "@/hooks/useFrameCapture";
import {
  CheatWarningBanner,
  RiskIndicatorDashboard,
} from "@/components/CheatWarningBanner";

function InterviewComponent() {
  const videoRef = useRef(null);
  const sessionId = "..."; // from context
  const userId = "..."; // from auth

  // Capture frames every 500ms
  const { isCapturing, frameCount } = useFrameCapture(
    videoRef.current,
    500,
    true, // enabled
  );

  // Stream frames to backend
  const { isStreaming, detections, startStreaming, stopStreaming } =
    useFrameStreaming(sessionId, userId, "http://localhost:5000");

  // Extract warnings for display
  const warnings = detections[detections.length - 1]?.flags
    ? Object.entries(detections[detections.length - 1].flags)
        .filter(([_, value]) => value)
        .map(([key]) => ({
          type: key,
          message: `${key.replace(/_/g, " ")} detected`,
          severity: "warning",
        }))
    : [];

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <CheatWarningBanner warnings={warnings} />
      <RiskIndicatorDashboard detections={detections} />
      <p>Frames captured: {frameCount}</p>
    </div>
  );
}
```

## Data Models

### CheatIndicator Schema

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,
  userId: ObjectId,
  detectionType: "phone" | "book" | "eye_gaze" | "attire",
  severity: "low" | "medium" | "high",
  confidence: Number (0-100),
  frameMeta: {
    timestamp: Date,
    frameIndex: Number,
    boundingBox: { x, y, w, h },
    frameWidth: Number,
    frameHeight: Number
  },
  details: {
    description: String,
    objectDetected: String,
    gazeAngle: Number,
    headPose: { pitch, yaw, roll },
    additionalData: Mixed
  },
  flagged: Boolean,
  reason: String,
  createdAt: Date
}
```

### InterviewSession.cheatFlags Extension

```javascript
cheatFlags: {
  detected: Boolean,
  indicators: [CheatIndicator._id],
  summary: {
    totalPhoneInstances: Number,
    totalBookInstances: Number,
    averageGazeDeviation: Number,
    overallRiskLevel: "low" | "medium" | "high" | "none",
    flaggedAt: Date
  },
  warnings: [ { type, message, severity } ],
  reviewStatus: "pending" | "reviewed" | "appealed" | "cleared",
  reviewNotes: String
}
```

## Thresholds & Scoring

### Risk Scores (0-100)

- **Phone Detection**: Each detection = +30 risk points
- **Book Detection**: Each detection = +40 risk points
- **Extreme Gaze**: Gaze angle > 45° = up to +20 points
- **Suspicious Attire**: Each item = +50 points

### Risk Levels

- **Low**: Overall risk < 30%
- **Medium**: Overall risk 30-70%
- **High**: Overall risk > 70%

### Flagging Criteria

A session is flagged as "suspicious" when:

- Phone detected 3+ consecutive times, OR
- Book/notes visible 2+ times, OR
- Average gaze deviation > 45° for 3+ seconds, OR
- Suspicious attire detected 2+ times, OR
- Overall risk score > 70%

## Performance Tuning

### Frame Processing Optimization

```python
# In yolo_detector.py
# Use lighter models for speed
model = YOLO("yolov8n.pt")  # nano - fastest
model = YOLO("yolov8s.pt")  # small - balanced
model = YOLO("yolov8m.pt")  # medium - accurate
```

### Compression Settings

```javascript
// Adjust quality based on network
const quality = 60; // 0-100, higher = better quality but larger file
const targetWidth = 480;
const targetHeight = 360;
```

### Backend Scaling

- Use Redis job queue for async processing
- Horizontally scale YOLO service with container orchestration
- Target: <200ms latency per frame (p95)

## Troubleshooting

### YOLO Models Not Loading

```bash
# Ensure Python has internet for downloading models
pip install --upgrade ultralytics
# Or manually download: yolov8n.pt, yolov8n-pose.pt
```

### High False Positives

1. Adjust confidence thresholds in `yolo_detector.py`
2. Review and recalibrate risk scoring in `CheatAnalyzer.js`
3. Test with varied lighting/angles

### Frame Capture Not Working

1. Check browser console for permission errors
2. Ensure video element has `autoplay` and `muted` attributes
3. Verify CORS settings on backend

### Database Connection Issues

```bash
# Check MongoDB connection
mongosh mongodb://your-connection-string
```

## Privacy & Compliance

- ⚠️ **No video frame storage** - Only metadata and detection results are saved
- 🔐 **Encryption** - All data in transit uses HTTPS
- 📋 **Audit trail** - All detection events logged for compliance
- 🗑️ **Data retention** - Cheat indicators deleted after appeal period (configurable)
- 👁️ **Consent** - Users must opt-in to cheat detection before interview

## Future Enhancements

- [ ] Custom model training on interview data
- [ ] Screen recording detection (multi-monitor setups)
- [ ] Audio anomaly detection (background voices)
- [ ] Self-hosted YOLO inference (Triton/TensorRT)
- [ ] WebAssembly YOLO for client-side detection
- [ ] Appeal mechanism for false positives
- [ ] Admin dashboard for reviewing flagged sessions

## Support

For issues or questions:

1. Check existing issues: `backend/logs/error.log`
2. Enable debug logging: `DEBUG=true npm run dev`
3. Review Python detector output: Check console for detection results
4. Contact: support@placemateai.com

## License

Part of InterviewMate platform. See LICENSE file.
