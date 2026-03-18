# <img src="./frontend/public/favicon.svg" width="40" height="40" valign="middle"> PrepiAi

<div align="center">
  <p align="center">
    <h3>Ace Your Next Interview with AI-Powered Precision</h3>
    <br />
    <a href="#features">Features</a> ·
    <a href="#tech-stack">Tech Stack</a> ·
    <a href="#getting-started">Getting Started</a> ·
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 🌟 Overview

**PrepiAi** is a cutting-edge platform designed to transform the way users prepare for their career milestones. By leveraging the power of **AI** and **Real-time Voice Communication**, PrepiAi provides a safe, realistic environment to practice mock interviews, participate in group discussions, and optimize professional profiles.

Designed with a sleek **"Midnight Cyan"** aesthetic, it offers a premium experience that is as functional as it is beautiful.

## 🚀 Key Features

- 🤖 **AI-Powered Mock Interviews**: Real-time voice-based sessions with intelligent AI interviewers that provide instant feedback.
- 👥 **Group Discussion (GD) Simulations**: Experience collaborative and competitive group discussion environments.
- 👔 **LinkedIn Optimization**: AI-driven insights to help you stand out to recruiters and peers.
- 📊 **Dynamic Dashboard**: Track your progress with data visualization tools (Recharts) showing your performance over time.
- 🎫 **Referral System**: Earn rewards by inviting friends to join the platform.
- 🔐 **Premium Authentication**: Secure and seamless sign-in/up experience powered by **Clerk**.
- 💳 **Billing & Pricing**: Integrated subscription models and usage tracking with circular progress indicators.
- 📱 **Responsive Design**: A fully fluid UI that looks stunning on desktops, tablets, and mobile devices.

## 🛠 Tech Stack

### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5AD?style=for-the-badge)

- **Vapi AI**: Powering the core voice-based AI communication.
- **React Helmet Async**: SEO optimization and dynamic title management.
- **Lucide Icons**: Clean, consistent iconography throughout the UI.

### Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongodb&logoColor=white)

- **Svix**: Securely handling webhook signatures and delivery.
- **Clerk SDK**: Robust backend session verification.

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later
- **MongoDB**: Local instance or Atlas connection string
- **NPM**: Package manager

### Installation

1. **Clone the project**
   ```bash
   git clone https://github.com/yourusername/prepiAi.git
   cd prepiAi
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env and add:
   # PORT=5000
   # MONGODB_URI=your_uri
   # CLERK_SECRET_KEY=your_key
   # WEBHOOK_SECRET=your_secret
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create .env and add:
   # VITE_CLERK_PUBLISHABLE_KEY=your_key
   # VITE_API_BASE_URL=http://localhost:5000
   ```

### Running Locally

Execute these in separate terminals:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the app in action!

---

## 📁 Project Structure

```text
prepiAi/
├── backend/            # Express.js server & MongoDB models
│   ├── controllers/    # Business logic
│   ├── models/         # Database schemas
│   └── routes/         # API endpoints
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View components
│   │   ├── context/    # State management
│   │   └── assets/     # Images and styles
└── README.md           # You are here!
```

## 🤝 Contributing

Contributions make the open-source community an amazing place!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ for Job Seekers everywhere</p>
