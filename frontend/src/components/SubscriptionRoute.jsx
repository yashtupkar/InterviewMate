import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { FiLoader } from "react-icons/fi";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const SubscriptionRoute = ({ requiredTier = null }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await axios.get(`${backendURL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sub = res.data;
        if (requiredTier) {
          setIsSubscribed(sub && sub.tier === requiredTier);
        } else {
          // If user tier is not Free, consider them subscribed
          setIsSubscribed(sub && sub.tier !== "Free");
        }
      } catch (err) {
        console.error("Subscription validation failed:", err);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      checkSubscription();
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (!isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }

  return <Outlet />;
};

export default SubscriptionRoute;
