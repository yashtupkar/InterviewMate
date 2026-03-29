import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { FiLoader } from "react-icons/fi";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const AdminRoute = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          const res = await axios.get(`${backendURL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAdmin(res.data.user.role === 'admin');
        } catch (err) {
          console.error("Admin check failed:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    if (isLoaded) {
      if (isSignedIn) checkAdmin();
      else setIsAdmin(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <FiLoader className="w-8 h-8 text-[#bef264] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
