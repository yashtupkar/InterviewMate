# <img src="./frontend/public/favicon.svg" width="40" height="40" valign="middle"> PlaceMateAI

<div align="center">
  <p align="center">
    <h3>Ace Your Next Interview with AI-Powered Precision</h3>
    <br />
    <a href="#features">Features</a> ·
    <a href="#custom-engine">Custom AI Engine</a> ·
    <a href="#tech-stack">Tech Stack</a> ·
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 🌟 Overview

**PlaceMateAI** (formerly PrepiAi) is a cutting-edge platform designed to transform how users prepare for career breakthroughs by moving away from expensive third-party wrappers like Vapi. PlaceMateAI leverages a **Custom-Built AI Engine** to provide high-performance, low-latency mock interviews and group discussions at a fraction of the cost.

## 🚀 Key Features

- 🤖 **Custom AI Mock Interviews**: Low-latency, voice-based sessions using Gemini 2.0 Flash Lite.
- 👥 **Group Discussion (GD) Multi-Agent**: Participate in dynamic GDs with 4 distinct AI personalities.
- 💻 **Real-time Coding Space**: Solve technical questions in an integrated IDE during interviews.
- 📊 **Intelligent Reports**: Instant, deep-dive analysis of your performance across 8+ dimensions.
- 👔 **LinkedIn Optimization**: AI insights to polish your professional profile.
- 🔐 **Secure Auth**: Powered by **Clerk** for seamless user management.
- 💳 **Affordable Pricing**: Built on a cost-efficient architecture to make prep accessible to everyone.

---

## 🧠 Custom AI Engine & Cost Efficiency

PlaceMateAI has transitioned from **Vapi AI** to a proprietary orchestration engine to maximize affordability and control.

### **The Architecture**
*   **Speech-to-Text (STT)**: Browser-native `Web Speech API` (Zero Cost).
*   **Large Language Model (LLM)**: `Google Gemini 2.0 Flash Lite` via OpenRouter (Ultra-low latency, ~₹0.0186/min).
*   **Text-to-Speech (TTS)**: Browser-native `window.speechSynthesis` (Zero Cost).
*   **Orchestration**: Custom React-Node logic for real-time multi-agent GD synchronization.

### **Cost Summary**
PlaceMateAI is **99% cheaper** to run than Vapi-based solutions.
*   **20-Min Interview**: ₹280 (Vapi) vs **₹0.46** (PlaceMateAI).
*   **30-Min GD Session**: ₹420 (Vapi) vs **₹1.68** (PlaceMateAI).

For a detailed cost analysis, see [pricing.md](./pricing.md).

---

## 🛠 Tech Stack

### Frontend
- **React + Vite**: High-performance UI.
- **TailwindCSS**: Sleek "Midnight Cyan" design system.
- **Web Speech API**: Powering STT and TTS without server latency.
- **Lucide Icons & Framer Motion**: Premium animations and iconography.

### Backend
- **Node.js + Express**: Scalable API orchestration.
- **MongoDB + Mongoose**: Real-time transcript and session storage.
- **OpenRouter (Gemini)**: State-of-the-art LLM intelligence.
- **Clerk**: Secure authentication and user sessions.

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.0.0+
- **MongoDB**: Atlas or Local instance
- **OpenRouter API Key**: For LLM logic

### Installation

1. **Clone the project**
   ```bash
   git clone https://github.com/yourusername/PlaceMateAI.git
   cd PlaceMateAI
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env and add:
   MONGODB_URI=your_uri
   CLERK_SECRET_KEY=your_key
   OPENROUTER_API_KEY=your_key
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create .env and add:
   VITE_CLERK_PUBLISHABLE_KEY=your_key
   VITE_BACKEND_URL=http://localhost:5000
   ```

### Running Locally

**Backend:** `npm run dev` in `/backend`  
**Frontend:** `npm run dev` in `/frontend`

Visit [http://localhost:5173](http://localhost:5173).

---

<p align="center">Made with ❤️ for the next generation of Job Seekers</p>
