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
import Reports from "./pages/Reports";
import InterviewResult from "./pages/InterviewResult";
import CustomInterviewSession from "./pages/CustomInterviewSession";
import DashboardOverview from "./pages/DashboardOverview";
import Layout from "./components/layouts/layout";
import { InterviewProvider } from "./context/InterviewContext";
import GroupDiscussionSetup from "./pages/GroupDiscussionSetup";
import GroupDiscussionSession from "./pages/GroupDiscussionSession";
import GroupDiscussionResult from "./pages/GroupDiscussionResult";
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
import HelpPage from "./pages/Help";
import AtsScorer from "./pages/AtsScorer";
import ResumeBuilder from "./pages/ResumeBuilder";
import AboutUs from "./pages/AboutUs";
import LandingHome from "./pages/LandingHome";
import Contact from "./pages/Contact";
import QuestionBankDashboard from "./pages/QuestionBank/QuestionBankDashboard";
import QuestionBankList from "./pages/QuestionBank/QuestionBankList";
import QuestionDetail from "./pages/QuestionBank/QuestionDetail";
import AdminRoute from "./components/AdminRoute";
import SeedQuestions from "./pages/adminScreens/SeedQuestions";
const backendURL = import.meta.env.VITE_BACKEND_URL;

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";

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
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#121214',
            color: '#fff',
            border: '1px solid rgba(136, 136, 136, 0.28)',
            padding: '12px 20px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'inherit',
          },
          success: {
            style: {
              background: '#09090b',
            },
            iconTheme: {
              primary: '#bef264',
              secondary: '#000',
            },
          },
          error: {
            style: {
              background: '#09090b',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          // Custom style for generic/warning toasts
          blank: {
            style: {
              background: '#09090b',
            },
          }
        }}
      />

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
          path="/landing"
          element={
            <Layout>
              <LandingHome backendStatus={backendStatus} />
            </Layout>
          }
        />

        <Route
          path="/"
          element={
            <Layout>
              <Homepage backendStatus={backendStatus} />
            </Layout>
          }
        />

        <Route
          path="/about"
          element={
            <Layout>
              <AboutUs />
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />

        <Route
          path="/questions"
          element={
            <Layout>
              <QuestionBankDashboard />
            </Layout>
          }
        />

        <Route
          path="/questions/list"
          element={
            <Layout>
              <QuestionBankList />
            </Layout>
          }
        />

        <Route
          path="/questions/:id"
          element={
            <Layout>
              <QuestionDetail />
            </Layout>
          }
        />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
           <Route 
             path="/admin/seed-questions" 
             element={
               <Layout>
                 <SeedQuestions />
               </Layout>
             } 
           />
        </Route>

        <Route
          path="/terms"
          element={<TermsAndConditions />}
        />

        <Route
          path="/privacy"
          element={<PrivacyPolicy />}
        />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<InterviewLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="setup" element={<CreateInterview />} />
            <Route path="reports" element={<Reports />} />
            <Route path="interviews" element={<Navigate to="/dashboard/reports" replace />} />
            <Route path="gd-interviews" element={<Navigate to="/dashboard/reports" replace />} />
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

          {/* Pricing Route - Protected because it uses InterviewLayout/Sidebar */}
          <Route path="/pricing" element={<InterviewLayout />}>
            <Route index element={<PricingPage />} />
          </Route>

          <Route path="/billing" element={<InterviewLayout />}>
            <Route index element={<Billing />} />
          </Route>

          <Route path="/referrals" element={<InterviewLayout />}>
            <Route index element={<Referrals />} />
          </Route>

          <Route path="/help" element={<InterviewLayout />}>
            <Route index element={<HelpPage />} />
          </Route>

          <Route path="/ats-scorer" element={<InterviewLayout />}>
            <Route index element={<AtsScorer />} />
          </Route>

          <Route path="/resume-builder" element={<InterviewLayout />}>
            <Route index element={<ResumeBuilder />} />
            <Route path=":id" element={<ResumeBuilder />} />
          </Route>

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
        </Route>

        {/* Auth Routes */}
        <Route path="/signin/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </InterviewProvider>
  );
}

export default App;

