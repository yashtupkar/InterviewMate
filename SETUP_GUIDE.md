# Cheat Detection System - Setup Guide

Complete step-by-step setup instructions for deploying cheat detection.

## 📋 Prerequisites

- Node.js 18+ or higher
- Python 3.8+ with pip
- MongoDB instance (local or Atlas)
- Git
- ~2GB free disk space (for YOLO models)

## 🔧 Installation Steps

### Step 1: Clone/Pull Latest Code

```bash
cd InterviewMate
git pull origin main
```

### Step 2: Backend Setup

#### 2.1 Install Node Dependencies

```bash
cd backend
npm install
```

#### 2.2 Install Python Dependencies

```bash
# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Copy and update `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add/update:

```env
# Detection
PYTHON_PATH=python  # or python3, or /path/to/python
CHEAT_DETECTION_ENABLED=true

# MongoDB (if not already set)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Other existing variables...
```

#### 2.4 Verify Python Setup

```bash
# Test Python installation
python --version

# Test YOLO models download (will happen on first run)
python backend/scripts/yolo_detector.py
```

If models fail to download, manually download:

```bash
python -m ultralytics.yolo detect predict model=yolov8n.pt
```

#### 2.5 Start Backend

```bash
npm run dev
# Should see: "Server running in development mode on port 5000"
```

Verify health endpoint:

```bash
curl http://localhost:5000/api/cheat/health
```

Expected response:

```json
{
  "status": "healthy",
  "pythonPath": "python",
  "detectorScript": "/path/to/yolo_detector.py",
  "lastCheck": "2024-05-15T..."
}
```

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Configure Environment

Create/update `.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
# or for production:
# VITE_BACKEND_URL=https://api.yourdomain.com
```

#### 3.3 Start Frontend

```bash
npm run dev
# Should see: "VITE v4.3.4 ready in 100 ms"
```

Visit http://localhost:5173 in browser.

### Step 4: Integration Testing

#### 4.1 Test Frame Detection Endpoint

```bash
# In new terminal, test the API
curl -X POST http://localhost:5000/api/cheat/detect-frame \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
    "sessionId": "test-session",
    "userId": "test-user"
  }'
```

You should get back detection results.

#### 4.2 Create Test Session

In MongoDB, create a test session:

```javascript
// Using MongoDB shell
db.interviewsessions.insertOne({
  userId: ObjectId(),
  interviewType: "technical",
  status: "in_progress",
  vapiCallId: "test-call-id",
  createdAt: new Date(),
});
```

#### 4.3 Test Streaming Endpoint

```bash
curl -X POST http://localhost:5000/api/cheat/detect-stream \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": "data:image/jpeg;base64,...",
    "sessionId": "your-session-id",
    "userId": "your-user-id",
    "frameIndex": 1
  }'
```

#### 4.4 Get Cheat Flags

```bash
curl http://localhost:5000/api/cheat/session/your-session-id/flags
```

## 📦 Production Deployment

### Docker Setup (Optional)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Node app
COPY package*.json ./
RUN npm ci --only=production

# Copy app code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t interviewmate-backend .
docker run -p 5000:5000 --env-file .env interviewmate-backend
```

### Environment Variables for Production

```env
# Production API
NODE_ENV=production
PORT=5000
VITE_BACKEND_URL=https://api.yourdomain.com

# YOLO Service
PYTHON_PATH=python3
CHEAT_DETECTION_ENABLED=true

# MongoDB (production)
MONGODB_URI=mongodb+srv://produser:prodpass@prod-cluster.mongodb.net/interviewmate

# Redis (if scaling)
REDIS_URL=redis://redis-server:6379

# Other services...
```

### Kubernetes Deployment (For Scale)

Create `k8s/cheat-detection-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cheat-detection-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cheat-detection
  template:
    metadata:
      labels:
        app: cheat-detection
    spec:
      containers:
        - name: backend
          image: interviewmate-backend:latest
          ports:
            - containerPort: 5000
          env:
            - name: PYTHON_PATH
              value: "python3"
            - name: CHEAT_DETECTION_ENABLED
              value: "true"
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /api/cheat/health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
```

Deploy:

```bash
kubectl apply -f k8s/cheat-detection-deployment.yaml
```

## 🧪 Testing

### Unit Tests

```bash
cd backend
npm test -- services/CheatAnalyzer.test.js
```

### Integration Tests

```bash
npm test -- routes/cheatDetectionRoutes.test.js
```

### Performance Testing

```bash
# Test latency
npm run test:performance

# Load test (requires Apache Bench)
ab -n 1000 -c 50 http://localhost:5000/api/cheat/health
```

## ⚙️ Configuration Tuning

### Frame Rate Adjustment

For lower-end devices, reduce frame capture rate:

```javascript
// In InterviewSession.jsx
const frameInterval = isMobile ? 1000 : 500; // ms between frames
useFrameCapture(videoRef.current, frameInterval, enabled);
```

### Model Optimization

For faster inference, use nano model:

```python
# In yolo_detector.py
self.object_model = YOLO("yolov8n.pt")  # nano - fastest
# vs
self.object_model = YOLO("yolov8s.pt")  # small - more accurate
```

### Risk Thresholds

Adjust sensitivity in `CheatAnalyzer.js`:

```javascript
// Increase thresholds to reduce false positives
if (risks.phone > 70) { ... }  // was 60
if (risks.book > 70) { ... }   // was 60
```

## 📊 Monitoring

### Enable Debug Logging

```bash
DEBUG=true npm run dev
```

### Check Logs

```bash
# Backend logs
tail -f backend/logs/error.log

# Python detector output (in browser console)
```

### Monitor Performance

```bash
# CPU usage
top

# Memory usage
free -h

# Database queries
mongosh --eval "db.serverStatus()"
```

## 🔍 Troubleshooting

### Issue: "Python not found"

```bash
# Solution: Specify full Python path
# Find Python installation
which python3
# or
where python

# Update .env
PYTHON_PATH=/usr/bin/python3
```

### Issue: "YOLO models failed to download"

```bash
# Solution: Download manually
cd backend/scripts
python -m ultralytics.yolo detect predict model=yolov8n.pt

# Or set HF_HOME for Hugging Face cache
export HF_HOME=/path/to/cache
python yolo_detector.py
```

### Issue: "Frame detection timeout"

```bash
# Solution: Increase timeout in YoloDetectionService.js
timeout: 30000 // was 10000 (10s)
```

### Issue: "Database connection error"

```bash
# Check MongoDB connection string
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/db"

# Verify network access if using MongoDB Atlas
# Whitelist your IP address
```

### Issue: "CORS errors"

```bash
# Already configured in backend/index.js
// But verify CORS middleware is registered before routes
app.use(cors());
app.use("/api/cheat", cheatDetectionRoutes);
```

## 📈 Performance Targets

- Frame processing latency: **<200ms (p95)**
- Detection accuracy: **>95% for phone, >90% for books**
- False positive rate: **<5%**
- Concurrent sessions: **100+ simultaneously**
- Memory per session: **~50MB**
- GPU optional (but recommended for scale)

## 🚀 Next Steps

1. **Test integration** - Run through complete interview flow
2. **Calibrate thresholds** - Adjust based on false positive rate
3. **Deploy to staging** - Test in staging environment first
4. **Monitor metrics** - Track latency, accuracy, costs
5. **Train custom model** - Fine-tune on your interview data (advanced)
6. **Scale horizontally** - Add more backend instances as needed

## ✅ Health Checklist

Before going to production:

- [ ] Python environment set up correctly
- [ ] YOLO models downloaded and cached
- [ ] MongoDB connection working
- [ ] Backend API running on correct port
- [ ] Frontend can reach backend API
- [ ] Frame capture working in browser
- [ ] Detections being saved to database
- [ ] Cheat flags appearing in reports
- [ ] Performance meets targets
- [ ] Error handling working correctly
- [ ] Privacy notice displayed to users
- [ ] Consent modal working

## 📞 Support

For issues:

1. Check backend logs: `backend/logs/error.log`
2. Enable debug: `DEBUG=true npm run dev`
3. Test endpoints directly with curl
4. Check Python detector: `python backend/scripts/yolo_detector.py`

---

**Deployment date:** \***\*\_\_\_\*\***  
**Deployed by:** \***\*\_\_\_\*\***  
**Version:** 1.0.0
