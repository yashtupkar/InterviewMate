import { useAuth, useUser } from "@clerk/clerk-react";
import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Components
import Homepage from "./pages/Homepage";
import InterviewLayout from "./layout/InterviewLayout";
import InterviewSession from "./pages/InterviewSession";
import CreateInterview from "./pages/CreateInterview";
import PastInterviews from "./pages/PastInterviews";
import InterviewResult from "./pages/InterviewResult";
import CustomInterviewSession from "./pages/CustomInterviewSession";
import DashboardOverview from "./pages/DashboardOverview";
import Layout from "./components/layouts/layout";
import { InterviewProvider } from "./context/InterviewContext";
import GroupDiscussionSetup from "./pages/GroupDiscussionSetup";
import GroupDiscussionSession from "./pages/GroupDiscussionSession";
import GroupDiscussionResult from "./pages/GroupDiscussionResult";
import PastGDs from "./pages/PastGDs";
import PricingPage from "./pages/PricingPage";
import LinkedInOptimisation from "./pages/LinkedInOptimisation";
import Billing from "./pages/Billing";
import Referrals from "./pages/Referrals";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { WelcomePopup, SuccessPopup } from "./pages/ReferralPopups";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import axios from "axios";
import CodingSpace from "./components/CodingSpace";
import VoiceTest from "./pages/VoiceTest";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referredBy, setReferredBy] = useState("");

  useEffect(() => {
    // Health check
    fetch(`${backendURL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.message))
      .catch((err) => setBackendStatus("Backend is offline"));
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          const referralCode = localStorage.getItem("referralCode");
          console.log("Syncing user with referral code:", referralCode);
          const response = await fetch(`${backendURL}/api/users/sync`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ referralCode }),
          });
          const data = await response.json();
          if (referralCode && data.success) {
            localStorage.removeItem("referralCode");
            if (data.isNewUser) {
              setShowSuccess(true);
            }
          }
          console.log("User synced with backend");
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      localStorage.setItem("referralCode", ref);

      const fetchReferrer = async () => {
        try {
          const res = await axios.get(`${backendURL}/api/referrals/info/${ref}`);
          if (res.data.success) {
            setReferredBy(res.data.referrer.name);
            if (!isSignedIn) {
              setShowWelcome(true);
            } else {
              toast.error("Referral detected! Rewards only apply to new signups.", { icon: 'ℹ️' });
            }
          }
        } catch (err) {
          console.error("Failed to fetch referrer info:", err);
          if (!isSignedIn) {
            setShowWelcome(true); // Default welcome even if info fails
          }
        }
      };

      fetchReferrer();

      // Clean up URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  return (
    <InterviewProvider>
      <Toaster position="top-right" />

      {showWelcome && (
        <WelcomePopup
          referrerName={referredBy}
          onSignIn={() => {
            setShowWelcome(false);
            navigate("/signin");
          }}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {showSuccess && (
        <SuccessPopup onClose={() => setShowSuccess(false)} />
      )}

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

        <Route
          path="/terms"
          element={<TermsAndConditions />}
        />

        <Route
          path="/privacy"
          element={<PrivacyPolicy />}
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
        <Route
          path="/session-custom/:sessionId"
          element={<CustomInterviewSession />}
        />
        <Route
          path="/session-custom"
          element={<CustomInterviewSession />}
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

        <Route path="/billing" element={<InterviewLayout />}>
          <Route index element={<Billing />} />
        </Route>

        <Route path="/referrals" element={<InterviewLayout />}>
          <Route index element={<Referrals />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/signin/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />

        {/* Standalone GD Session (No Sidebar) */}
        <Route
          path="/gd/session/:sessionId"
          element={<GroupDiscussionSession />}
        />

 {/* Testing routes */}
        <Route
          path="/voices"
          element={<VoiceTest />}
        />
        <Route
          path="/code"
          element={<CodingSpace />}
        />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </InterviewProvider>
  );
}

export default App;

