import { useAuth, useUser } from "@clerk/clerk-react";
import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Homepage from "./pages/Homepage";
import InterviewLayout from "./layout/InterviewLayout";
import InterviewSession from "./pages/InterviewSession";
import CreateInterview from "./pages/CreateInterview";
import PastInterviews from "./pages/PastInterviews";
import InterviewResult from "./pages/InterviewResult";
import DashboardOverview from "./pages/DashboardOverview";
import Layout from "./components/layouts/layout";
import { InterviewProvider } from "./context/InterviewContext";
import GroupDiscussionSetup from "./pages/GroupDiscussionSetup";
import GroupDiscussionSession from "./pages/GroupDiscussionSession";
import GroupDiscussionResult from "./pages/GroupDiscussionResult";
import PastGDs from "./pages/PastGDs";
import PricingPage from "./pages/PricingPage";
import LinkedInOptimisation from "./pages/LinkedInOptimisation";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    // Health check
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.message))
      .catch((err) => setBackendStatus("Backend is offline"));
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          await fetch("http://localhost:5000/api/users/sync", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("User synced with backend");
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, getToken]);

  return (
    <InterviewProvider>
      <Toaster position="top-right" />
      <Routes>
      {/* Homepage Route */}
      <Route
        path="/"
        element={
          <Layout>
            <Homepage backendStatus={backendStatus} />
          </Layout>
        }
      />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<InterviewLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="setup" element={<CreateInterview />} />
        <Route path="interviews" element={<PastInterviews />} />
        <Route path="gd-interviews" element={<PastGDs />} />
        <Route path="linkedin" element={<LinkedInOptimisation />} />
        <Route path="result/:sessionId" element={<InterviewResult />} />
      </Route>

      {/* Sub-routes under interview that need Sidebar */}
      <Route path="/interview" element={<InterviewLayout />}>
        <Route index element={<Navigate to="setup" replace />} />
        <Route path="setup" element={<CreateInterview />} />
        <Route path="result/:sessionId" element={<InterviewResult />} />
      </Route>

      {/* Standalone Session Routes (No Sidebar) */}
      <Route
        path="/session"
        element={<InterviewSession />}
      />
      <Route
        path="/session/:sessionId"
        element={<InterviewSession />}
      />


      {/* Group Discussion Routes */}
      <Route path="/gd" element={<InterviewLayout />}>
        <Route index element={<Navigate to="setup" replace />} />
        <Route path="setup" element={<GroupDiscussionSetup />} />
        <Route
          path="result/:sessionId"
          element={<GroupDiscussionResult />}
        />
      </Route>

      {/* Pricing Route */}
      <Route path="/pricing" element={<InterviewLayout />}>
        <Route index element={<PricingPage />} />
      </Route>

      {/* Standalone GD Session (No Sidebar) */}
      <Route
        path="/gd/session/:sessionId"
        element={<GroupDiscussionSession />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </InterviewProvider>
  );
}

export default App;
