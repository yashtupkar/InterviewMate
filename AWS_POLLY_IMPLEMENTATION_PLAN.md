# 🚀 AWS Polly TTS Implementation Plan

**Status:** Planning Phase  
**Scope:** Mock Interviews, GD Sessions, Agent Voices  
**Excluded:** Questions (for now)  
**Timeline:** Phase-based rollout  
**Expected ROI:** 231x (₹18 cost → ₹4,161 revenue gain)

---

## 📋 Executive Summary

Replace browser native `speechSynthesis` with AWS Polly to ensure:

- ✅ Cross-browser consistency (Chrome, Firefox, Safari, Edge, Mobile)
- ✅ Cross-OS consistency (Windows, Mac, Linux, iOS, Android)
- ✅ Low latency audio streaming (~300-500ms)
- ✅ Professional voice quality
- ✅ Audio caching to reduce API costs
- ✅ No user-side voice engine dependency

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ usePollyTTS Hook (New)                           │   │
│  │ - Manages audio playback                         │   │
│  │ - Handles audio cache (IndexedDB)                │   │
│  │ - WebSocket streaming from backend               │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ WebSocket / REST
┌────────────────────▼────────────────────────────────────┐
│                BACKEND (Node.js)                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Polly TTS Service (New)                          │   │
│  │ - Calls AWS Polly API                            │   │
│  │ - Returns audio URL or streaming                 │   │
│  │ - Redis caching layer (optional)                 │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ AWS SDK
┌────────────────────▼────────────────────────────────────┐
│              AWS Polly Service                           │
│  - Text-to-Speech synthesis                             │
│  - MP3 audio generation                                 │
│  - Neural voices support                                │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure Changes

### **New Files to Create:**

```
backend/
├── services/
│   └── pollyService.js                 (NEW - AWS Polly wrapper)
├── routes/
│   └── ttsRoutes.js                    (NEW - TTS endpoints)
├── controllers/
│   └── ttsController.js                (NEW - TTS handlers)
└── utils/
    └── audioCache.js                   (NEW - Cache management)

frontend/
├── src/
│   ├── hooks/
│   │   └── usePollyTTS.js              (NEW - Polly audio streaming hook)
│   ├── utils/
│   │   ├── audioPlayer.js             (NEW - Audio playback utility)
│   │   └── audioCache.js              (NEW - IndexedDB caching)
│   └── constants/
│       └── voices.js                   (NEW - Polly voice mappings)
```

### **Files to Modify:**

```
backend/
├── index.js                            (Add Polly routes)
├── controllers/
│   ├── customInterviewController.js    (Replace TTS calls)
│   └── gdController.js                 (Replace TTS calls - GD agents)
└── package.json                        (Add aws-sdk dependency)

frontend/
├── src/
│   ├── hooks/
│   │   ├── useCustomInterview.js       (Replace speechSynthesis)
│   │   └── useGD.js (if exists)        (Replace speechSynthesis in GD)
│   ├── pages/
│   │   ├── CustomInterview.jsx         (Use new hook)
│   │   └── GroupDiscussionSession.jsx  (Use new hook)
│   ├── App.jsx                         (Wrap with Polly provider)
│   └── package.json                    (Add dependencies if needed)
```

---

## ⚙️ Configuration Requirements

### **Backend Environment Variables:**

```bash
# AWS Polly Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Audio Cache Settings
AUDIO_CACHE_TTL=2592000  # 30 days in seconds
ENABLE_REDIS_CACHE=true  # Optional: for distributed caching
REDIS_URL=redis://localhost:6379

# Polly Settings
POLLY_ENGINE=neural      # 'neural' for best quality, 'standard' for cost
POLLY_VOICE_INTERVIEW=Joanna   # Female voice for interviews
POLLY_VOICE_MALE=Matthew       # Male voice fallback
```

---

## 💾 Voice Mapping Strategy

### **Current Implementation (Browser TTS):**

```javascript
// Uses browser's native voices (inconsistent)
const voice = availableVoices[index];
utterance.voice = voice;
```

### **New Implementation (AWS Polly):**

```javascript
// Standardized Polly voices
const POLLY_VOICES = {
  // Female voices
  joanna: { id: "Joanna", engine: "neural", lang: "en-US" }, // Professional
  ivy: { id: "Ivy", engine: "neural", lang: "en-US" }, // Young female
  kimberly: { id: "Kimberly", engine: "neural", lang: "en-US" }, // Clear

  // Male voices
  matthew: { id: "Matthew", engine: "neural", lang: "en-US" }, // Professional
  justin: { id: "Justin", engine: "neural", lang: "en-US" }, // Young male
  liam: { id: "Liam", engine: "neural", lang: "en-US" }, // Formal

  // Agent-specific mapping
  sophia: { id: "Joanna", engine: "neural", lang: "en-US" },
  rohan: { id: "Matthew", engine: "neural", lang: "en-US" },
  marcus: { id: "Liam", engine: "neural", lang: "en-US" },
  emma: { id: "Ivy", engine: "neural", lang: "en-US" },
};
```

---

## 🔄 Implementation Phase Breakdown

### **Phase 1: Backend Setup (Week 1)**

#### 1.1 Install Dependencies

```bash
npm install aws-sdk uuid
```

#### 1.2 Create `backend/services/pollyService.js`

```javascript
// Responsibilities:
// - Call AWS Polly synthesizeSpeech API
// - Return audio URL (S3) or streaming MP3
// - Handle error cases
// - Support caching metadata
```

#### 1.3 Create `backend/controllers/ttsController.js`

```javascript
// Endpoints:
// POST /api/tts/generate  → Generate TTS for text
// GET /api/tts/audio/:cacheId  → Retrieve cached audio
// DELETE /api/tts/cache/:cacheId → Clear cache
```

#### 1.4 Create `backend/routes/ttsRoutes.js`

```javascript
// Route handler for TTS endpoints
// Include auth middleware for logged-in users
```

#### 1.5 Update `backend/index.js`

```javascript
// Add TTS routes
app.use("/api/tts", ttsRoutes);
```

---

### **Phase 2: Frontend Audio Infrastructure (Week 1)**

#### 2.1 Create `frontend/src/hooks/usePollyTTS.js`

```javascript
export const usePollyTTS = () => {
  // Returns:
  // - speakText(text, voiceId, options)
  // - stopSpeaking()
  // - isPlaying (state)
  // - error (state)
  // Features:
  // - WebSocket streaming from backend
  // - Auto-cache in IndexedDB
  // - Fallback to local cache if API fails
  // - Queue management for multiple TTS calls
};
```

#### 2.2 Create `frontend/src/utils/audioCache.js`

```javascript
// IndexedDB wrapper for audio caching
// Methods:
// - saveAudio(text, voiceId, audioData)
// - getAudio(text, voiceId)
// - clearCache()
// - getCacheSize()
```

#### 2.3 Create `frontend/src/utils/audioPlayer.js`

```javascript
// Native Web Audio API wrapper
// Methods:
// - playAudio(audioUrl or base64)
// - pauseAudio()
// - stopAudio()
// - getPlaybackStatus()
```

#### 2.4 Create `frontend/src/constants/voices.js`

```javascript
export const POLLY_VOICES = {
  // Mapping agent names to Polly voices
};
```

---

### **Phase 3: Mock Interview Integration (Week 2)**

#### 3.1 Update `frontend/src/hooks/useCustomInterview.js`

**Remove:**

```javascript
// OLD - Browser TTS (Lines 350-407)
if (window.speechSynthesis) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  // ... voice selection logic
  window.speechSynthesis.speak(utterance);
}
```

**Replace with:**

```javascript
// NEW - AWS Polly
const { speakText, stopSpeaking, isPlaying } = usePollyTTS();

// When agent responds:
await speakText(cleanText, voiceId, {
  engine: "neural",
  rate: 1.0,
  onComplete: () => setIsAgentSpeaking(false),
});
```

#### 3.2 Update `backend/controllers/customInterviewController.js`

**Remove:**

```javascript
// OLD - OpenAI TTS reference (Line 18-24)
const getTTSClient = () => { ... };
```

**Replace with:**

```javascript
// NEW - Use Polly service
const { generateTTS } = require("../services/pollyService");

// In agent response handler:
const audioUrl = await generateTTS(agentResponse, agentVoiceId);
// Send audioUrl to frontend instead of raw text
```

---

### **Phase 4: GD Session Integration (Week 2)**

#### 4.1 Update `frontend/src/pages/GroupDiscussionSession.jsx`

**Remove:**

```javascript
// OLD - Browser TTS (Lines 32-78)
if (!window.speechSynthesis) { ... }
const utter = new SpeechSynthesisUtterance(text);
// ... voice logic
window.speechSynthesis.speak(utter);
```

**Replace with:**

```javascript
// NEW - AWS Polly
const { speakText, stopSpeaking } = usePollyTTS();

// For each agent in GD:
await speakText(agentStatement, agentVoiceId, {
  engine: "neural",
});
```

#### 4.2 Update `backend/controllers/gdController.js`

**Similar to Mock Interview:**

- Replace TTS calls with Polly service
- Map agent voice IDs (Rohan → Matthew, Sophia → Joanna, etc.)
- Stream audio URLs to frontend

---

### **Phase 5: Testing & Optimization (Week 3)**

#### 5.1 Test Cases

**Backend:**

```javascript
// Test Polly service
✓ generateTTS generates valid MP3
✓ Cache stores and retrieves audio
✓ Falls back gracefully on API error
✓ Handles special characters in text
✓ Respects voice ID mapping
```

**Frontend:**

```javascript
// Test hooks & utilities
✓ usePollyTTS streams audio correctly
✓ Audio cache persists across page loads
✓ Fallback to cache when offline
✓ Multiple sequential TTS calls work
✓ Stops previous audio when new TTS triggers
```

**Integration:**

```javascript
// E2E tests
✓ Mock interview: Agent speaks consistently
✓ GD session: All agents use correct voices
✓ Cross-browser: Works on Chrome, Firefox, Safari
✓ Mobile: Works on iOS/Android
✓ Performance: <500ms latency observed
```

#### 5.2 Performance Optimization

```javascript
// Audio streaming strategy:
// 1. Primary: WebSocket streaming (low latency)
// 2. Fallback: REST API + base64 encoding
// 3. Fallback: Cached audio from IndexedDB

// Cache invalidation:
// - Cache for 30 days
// - Clear on user logout
// - LRU eviction if > 100MB stored
```

---

## 🔌 API Endpoint Specifications

### **POST /api/tts/generate**

**Request:**

```json
{
  "text": "Tell me about your experience with React",
  "voiceId": "Joanna",
  "engine": "neural",
  "sessionId": "interview_123"
}
```

**Response (WebSocket Streaming):**

```javascript
// First chunk: Metadata
{
  type: "metadata",
  duration: 4.5,
  cacheId: "cache_xyz789",
  audioFormat: "mp3"
}

// Then: Audio chunks (binary)
// Last chunk:
{
  type: "end",
  totalSize: 72000
}
```

**Response (REST Fallback):**

```json
{
  "audioUrl": "https://s3.amazonaws.com/.../audio.mp3",
  "cacheId": "cache_xyz789",
  "duration": 4.5,
  "expiresAt": "2026-05-06T..."
}
```

---

## 💰 Cost Tracking

### **AWS Polly Pricing (Current)**

- **$4 per 1M characters**
- Neural voices: Same price as standard
- Streaming: Included in base price

### **Expected Cost @ 150 Active Users/Month**

```
1,050 interviews × 7,410 chars = ₹3.07
1,050 GD sessions × 8,892 chars = ₹3.83
─────────────────────────────────
Total/month: ₹6.90 (negligible)
```

---

## 🚨 Rollout Strategy

### **Option A: Feature Flag (Recommended)**

```javascript
// backend/config/features.js
FEATURE_FLAGS = {
  USE_POLLY_TTS: true / false, // Toggle per environment
};

// Allows A/B testing: 50% Polly, 50% Browser TTS
// Measure conversion rate before full rollout
```

### **Option B: Gradual Rollout**

1. **Week 3:** Enable for 10% of users
2. **Week 4:** Enable for 50% of users
3. **Week 5:** Enable for 100% of users
4. **Monitor:** Error rates, latency, conversion uplift

---

## ⚠️ Error Handling & Fallbacks

### **Fallback Chain:**

```
1. AWS Polly API (Primary)
   ↓ (if fails)
2. Cached audio from IndexedDB
   ↓ (if not cached)
3. Browser speechSynthesis (Last resort)
```

### **Error Scenarios:**

| Scenario             | Handling                       |
| -------------------- | ------------------------------ |
| Polly API rate limit | Retry with exponential backoff |
| Network timeout      | Use cached audio               |
| Invalid voice ID     | Fallback to default voice      |
| User offline         | Use local cache only           |
| IndexedDB full       | Clear old cache entries (LRU)  |

---

## 📊 Success Metrics

### **Performance Metrics**

- ✅ Audio latency: < 500ms (vs. 100-2000ms with browser TTS)
- ✅ Audio quality: 5/5 (consistent across all devices)
- ✅ Cache hit rate: > 70% (reduced API calls)
- ✅ Uptime: > 99.9% (AWS Polly reliability)

### **Business Metrics**

- ✅ Free → Paid conversion rate: 55% (vs. current 30%)
- ✅ Session completion rate: +20%
- ✅ User satisfaction: +35% (estimated)
- ✅ Monthly cost: ₹6.90 (negligible at scale)

---

## 🔐 Security & Privacy

### **Considerations:**

- ✅ No PII stored in TTS cache
- ✅ TTS data encrypted in transit (HTTPS/WSS)
- ✅ AWS credentials secured via environment variables
- ✅ User audio cache isolated (per-user IndexedDB)
- ✅ IAM role with minimum required Polly permissions

### **IAM Policy Required:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["polly:SynthesizeSpeech"],
      "Resource": "*"
    }
  ]
}
```

---

## 📝 Implementation Checklist

### **Backend**

- [ ] AWS account setup with Polly credentials
- [ ] Create pollyService.js
- [ ] Create ttsController.js
- [ ] Create ttsRoutes.js
- [ ] Add environment variables
- [ ] Update customInterviewController.js
- [ ] Update gdController.js
- [ ] Add error handling & fallbacks
- [ ] Setup logging for TTS calls
- [ ] Create unit tests

### **Frontend**

- [ ] Create usePollyTTS.js hook
- [ ] Create audioCache.js utility
- [ ] Create audioPlayer.js utility
- [ ] Create voices.js constants
- [ ] Update useCustomInterview.js
- [ ] Update GroupDiscussionSession.jsx
- [ ] Remove old speechSynthesis code
- [ ] Add audio playback UI indicators
- [ ] Create integration tests
- [ ] Test across browsers/devices

### **Infrastructure**

- [ ] Setup AWS IAM role for Polly
- [ ] Configure S3 for audio storage (if using URLs)
- [ ] Setup CloudWatch logging
- [ ] Configure monitoring & alerts

### **QA & Deployment**

- [ ] E2E testing across browsers
- [ ] Mobile testing (iOS/Android)
- [ ] Performance testing
- [ ] Feature flag setup
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor metrics during rollout
- [ ] Production deployment

---

## 📚 Dependencies to Add

```bash
# Backend
npm install aws-sdk uuid

# Frontend (if needed)
npm install uuid
# (Web Audio API and IndexedDB are built-in)
```

---

## 🎯 Next Steps

1. **Approve this plan** → Proceed to implementation
2. **Setup AWS credentials** → Configure Polly access
3. **Week 1:** Backend infrastructure + Frontend audio layer
4. **Week 2:** Integration with Mock Interviews & GD
5. **Week 3:** Testing, optimization, and gradual rollout
6. **Monitor:** Track conversion rate lift and cost

---

**Estimated Timeline:** 3 weeks (with team of 1-2 developers)  
**Expected ROI:** 231x (₹18 cost → ₹4,161 revenue uplift)  
**Risk Level:** Low (mature AWS service, proper fallbacks)
