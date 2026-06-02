import { useAuth, useUser } from "@clerk/clerk-react";
import "./App.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Context & Components
import { InterviewProvider } from "./context/InterviewContext";
import { WelcomePopup, SuccessPopup } from "./pages/ReferralPopups";
import ScrollToTop from "./components/common/ScrollToTop";
import { AppRoutes } from "./routes";

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
          
          let browser = "Unknown";
          const ua = navigator.userAgent;
          if (navigator.brave && await navigator.brave.isBrave()) {
            browser = "Brave";
          } else if (ua.match(/edg/i)) {
            browser = "Edge";
          } else if (ua.match(/opr\//i)) {
            browser = "Opera";
          } else if (ua.match(/chrome|chromium|crios/i)) {
            browser = "Chrome";
          } else if (ua.match(/firefox|fxios/i)) {
            browser = "Firefox";
          } else if (ua.match(/safari/i)) {
            browser = "Safari";
          }
          
          console.log("Syncing user with referral code:", referralCode);
          const response = await fetch(`${backendURL}/api/users/sync`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ referralCode, browser }),
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
          const res = await axios.get(
            `${backendURL}/api/referrals/info/${ref}`,
          );
          if (res.data.success) {
            setReferredBy(res.data.referrer.name);
            if (!isSignedIn) {
              setShowWelcome(true);
            } else {
              toast.error(
                "Referral detected! Rewards only apply to new signups.",
                { icon: "ℹ️" },
              );
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
            background: "#121214",
            color: "#fff",
            border: "1px solid rgba(136, 136, 136, 0.28)",
            padding: "12px 20px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "inherit",
          },
          success: {
            style: {
              background: "#09090b",
            },
            iconTheme: {
              primary: "#bef264",
              secondary: "#000",
            },
          },
          error: {
            style: {
              background: "#09090b",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          blank: {
            style: {
              background: "#09090b",
            },
          },
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

      {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}

      <AppRoutes backendStatus={backendStatus} />
    </InterviewProvider>
  );
}

export default App;
