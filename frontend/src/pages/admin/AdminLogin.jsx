import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMail, FiLock, FiKey, FiArrowRight, FiShield } from "react-icons/fi";
import toast from "react-hot-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      const res = await axios.post(`${backendURL}/api/admin/auth/send-otp`, { email });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || !secretCode) return toast.error("OTP and Secret Code are required");

    setLoading(true);
    try {
      const res = await axios.post(`${backendURL}/api/admin/auth/verify`, {
        email,
        otp,
        secretCode,
      });

      if (res.data.success) {
        toast.success("Admin login successful!");
        localStorage.setItem("adminToken", res.data.data.token);
        
        // Force full reload to reset any state if needed, or just navigate
        window.location.href = "/admin";
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(190,242,100,0.2)]">
            <FiShield className="text-primary text-3xl" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Secure access restricted to authorized personnel only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface border border-white/10 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 backdrop-blur-xl">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Admin Email Address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-zinc-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-all"
                    placeholder="admin@placemateai.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09090b] focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerify}>
              <div>
                <p className="text-sm text-zinc-400 text-center mb-6">
                  OTP sent to <span className="text-white font-medium">{email}</span>
                  <button type="button" onClick={() => setStep(1)} className="ml-2 text-primary hover:underline">Change</button>
                </p>
                
                <label htmlFor="otp" className="block text-sm font-medium text-zinc-300">
                  6-Digit OTP
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-zinc-500" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-all tracking-widest"
                    placeholder="• • • • • •"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secretCode" className="block text-sm font-medium text-zinc-300">
                  Permanent Secret Code
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="text-zinc-500" />
                  </div>
                  <input
                    id="secretCode"
                    name="secretCode"
                    type="text"
                    required
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-all font-mono uppercase"
                    placeholder="e.g. X7K9A2"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  This code was emailed to you when you were promoted to Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09090b] focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Authenticating..." : "Login to Dashboard"}
                {!loading && <FiArrowRight />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
