import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../public/logo.png";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";

enum ResetStep {
  RequestOTP,
  EnterOTP,
  ResetPassword,
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<ResetStep>(ResetStep.RequestOTP);

  const appContext = React.useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl } = appContext;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        {
          email,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("OTP sent to your email");
        setStep(ResetStep.EnterOTP);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setStep(ResetStep.ResetPassword);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          email,
          otp,
          newPassword,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-b from-gray-900 to-black">
      <img
        onClick={() => navigate("/")}
        src={Logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <h2
        className="absolute left-30 sm:left-50 top-18 ml-[-15px] font-medium text-white text-2xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        <span className="text-[#ff8800]">The</span> Codyssey
      </h2>

      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        {step === ResetStep.RequestOTP && (
          <>
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Reset Password
            </h2>
            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors"
              >
                Send OTP
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-400 hover:text-white text-sm"
              >
                Back to Login
              </button>
            </div>
          </>
        )}

        {step === ResetStep.EnterOTP && (
          <>
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Enter OTP
            </h2>
            <p className="text-gray-300 text-sm mb-4 text-center">
              We've sent a one-time password to your email.
            </p>
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  placeholder="Enter the 6-digit OTP"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors"
              >
                Verify OTP
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setStep(ResetStep.RequestOTP)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Back
              </button>
            </div>
          </>
        )}

        {step === ResetStep.ResetPassword && (
          <>
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Set New Password
            </h2>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition-colors"
              >
                Reset Password
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setStep(ResetStep.EnterOTP)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
