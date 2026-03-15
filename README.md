# InterviewMate

InterviewMate is a comprehensive platform designed to help users prepare for interviews through AI-powered mock interviews, job tracking, and automated application processes. Built with a modern tech stack, this application provides an intuitive User Interface with a sleek "Midnight Cyan" theme, ensuring a premium user experience while practicing for your next career move.

## Features

- **AI-Powered Mock Interviews:** Conduct realistic mock interviews using state-of-the-art AI technology.
- **Secure Authentication:** User authentication and session management handled effortlessly and securely by Clerk.
- **Job Tracking & Automation:** Keep track of your job applications and automate specific application processes (job matching and scraping).
- **Premium User Interface:** Responsive, dynamic UI built with React and Tailwind CSS, featuring smooth transitions, aesthetic Midnight Cyan components, and data visualization tools.
- **Seamless Video & Audio:** Integrated audio/video components for realistic interview settings.

## Tech Stack

### Frontend
- **React.js & Vite:** Core application framework and build tool for maximum performance.
- **Tailwind CSS:** For rapid UI development with a custom "Midnight Cyan" theme.
- **Redux Toolkit:** Centralized state management.
- **Clerk React:** Authentication and user profile management.
- **Vapi AI Web:** Handling voice/AI communication streams for the mock interviews.
- **Recharts:** For displaying visually appealing data on user progress and interviews.
- **React Router Dom:** For seamless single-page application navigation.

### Backend
- **Node.js & Express.js:** Scalable server environment.
- **MongoDB & Mongoose:** NoSQL database for flexible data storage.
- **Clerk SDK & Svix:** Webhook verification and secure backend authentication integrations.
- **Axios:** For handling server-side HTTP requests and web scraping tasks.

## Prerequisites

Make sure you have the following installed on your machine before starting:
- [Node.js](https://nodejs.org/en/) (v16.x or later)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
- Node Package Manager (npm)

## Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd interviewMate
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

## Environment Variables

You need to create a `.env` file in both the `frontend` and `backend` directories. 

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
WEBHOOK_SECRET=your_clerk_svix_webhook_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```
*(Note: Please refer to your specific API providers for keys such as Vapi AI if required).*

## Running the Application

To run the application locally, you will need to start both the backend server and the frontend development server.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application in the browser.

## Project Structure

```text
interviewMate/
├── backend/          # Express backend application (API, DB models, Controllers)
├── frontend/         # React frontend application (Pages, Components, Redux slices)
└── README.md         # Project documentation
```

## Contributing

Feel free to open issues or submit pull requests for bug fixes, new feature additions, and general improvements.
