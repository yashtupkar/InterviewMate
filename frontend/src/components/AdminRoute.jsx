import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { FiLoader } from "react-icons/fi";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const AdminRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      // In a real production app, you might want to call a /verify endpoint here
      // For now, we trust the token presence and let the API reject it if invalid
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsVerifying(false);
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <FiLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
