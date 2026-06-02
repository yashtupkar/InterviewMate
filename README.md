# <img src="./frontend/public/favicon.svg" width="40" height="40" valign="middle"> InterviewMate (PlaceMateAI)

<div align="center">
  <p align="center">
      <h3>Ace Interviews, Group Discussions, and Coding Rounds with AI</h3>
    <br />
    <a href="#features">Features</a> ·
      <a href="#architecture">Architecture</a> ·
    <a href="#tech-stack">Tech Stack</a> ·
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 🌟 Overview

**InterviewMate** (also referred to as **PlaceMateAI**) is a full-stack AI interview preparation platform built on the **MERN stack** with voice AI, coding practice, ATS analysis, LinkedIn optimization, and subscription-based usage.

It uses a custom real-time orchestration flow with:

- **OpenRouter (Gemini models)** for interview intelligence and evaluation
- **AWS Polly (TTS)** for natural AI voice output
- **Web Speech API (STT)** for fast browser-side speech recognition
- **MongoDB** for session, report, and product data storage

## 🚀 Key Features

- 🤖 **AI Mock Interviews**: Role-based and custom interviews with voice interaction and adaptive follow-up questions.
- 👥 **Multi-Agent Group Discussions**: Practice GD rounds with multiple AI personas and detailed speaking analytics.
- 💻 **Integrated Coding Interview Space**: Attempt coding questions in a live coding environment as part of interview flow.
- 📄 **ATS Resume Analyzer**: Upload resume and get ATS-style scoring and improvement suggestions.
- 👔 **LinkedIn Review & Suggestions**: Improve profile sections with AI-driven recommendations.
- 📊 **Detailed Performance Reports**: Session feedback across communication, confidence, structure, and technical depth.
- 🔐 **Authentication & User Profiles**: Secure sign-in and account management with Clerk.
- 💳 **Credits, Subscriptions & Payments**: Tiered plans, usage tracking, and payment integration.
- 🔊 **High-Quality Voice Responses**: AWS Polly-based TTS pipeline for clear, natural AI interviewer voice.

---

## 🧠 Architecture

InterviewMate is designed as a **modular MERN platform** with an AI orchestration layer for real-time interview experiences.

### AI/Voice Pipeline

- **STT**: Browser-native `Web Speech API`
- **LLM**: `Gemini` models through **OpenRouter**
- **TTS**: **AWS Polly** (Neural voices)
- **Session Control**: Custom React + Node orchestration for turn management, transcript flow, and agent responses

### Backend Services

- Interview generation and follow-up handling
- ATS scoring and feedback processing
- Coding question and response analysis
- Credit deduction and subscription checks
- Payment/webhook integrations

For pricing and cost design details, see [pricing.md](./pricing.md) and [usage_based_plan.md](./usage_based_plan.md).

---

## 🛠 Tech Stack

### Core Stack (MERN)

- **MongoDB**: Primary data store
- **Express.js**: API and orchestration server
- **React**: Frontend UI and interview flows
- **Node.js**: Runtime for backend services

### Frontend

- **React + Vite**: Fast SPA architecture
- **TailwindCSS**: Design system and responsive UI
- **Web Speech API**: Real-time speech-to-text capture
- **Framer Motion + Lucide**: Motion and icon system

### Backend

- **Node.js + Express**: REST APIs and interview orchestration
- **MongoDB + Mongoose**: Persistence layer for users, sessions, reports, and billing entities
- **OpenRouter**: LLM gateway for Gemini-based prompts and analysis
- **AWS Polly**: Production-grade TTS generation
- **Clerk**: Authentication and identity management
- **Razorpay**: Subscription/payment processing

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18.0.0+
- **MongoDB**: Atlas or Local instance
- **OpenRouter API Key**: For LLM orchestration
- **AWS Credentials**: For Polly TTS
- **Clerk Keys**: For authentication

### Installation

1. **Clone the project**

   ```bash
   git clone https://github.com/yashtupkar/InterviewMate.git
   cd InterviewMate
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   # Create .env and add:
   MONGODB_URI=your_uri
   CLERK_SECRET_KEY=your_key
   OPENROUTER_API_KEY=your_key
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_key
   AWS_REGION=ap-south-1
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

## 📁 Project Structure

- `frontend/`: React app, interview UI, coding UI, dashboards
- `backend/controllers/`: Feature-level API controllers
- `backend/services/`: AI, TTS, billing, and analysis services
- `backend/models/`: MongoDB schemas
- `backend/routes/`: API route modules

---

<p align="center">Made with ❤️ for the next generation of Job Seekers</p>
