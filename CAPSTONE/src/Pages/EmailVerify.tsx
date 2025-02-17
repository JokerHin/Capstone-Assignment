import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const EmailVerify = () => {
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const appContext = useContext(AppContent);

  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl, isLoggedin, userData, getUserData } = appContext;

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (e: any, index: number) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char: string, index: number) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #000000, #1a0e04, #2a1608, #3b1d0b, #4d240d, #5f2b0e, #72320e, #86390d)",
      }}
    >
      <img
        onClick={() => navigate("/")}
        src={Logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <h2
        className="absolute left-30 sm:left-50 top-18 ml-[-15px] font-medium text-white text-xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        <span className="text-[#ff8800] text-4xl">F</span>ireWall
      </h2>
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm inset-shadow-sm inset-shadow-amber-500"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-[#ff8800]">
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                className="text-center w-12 h-12 bg-[#333A5C] text-white text-2xl rounded-md"
                type="text"
                maxLength="1"
                key={index}
                required
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-900 text-white rounded-full cursor-pointer">
          Verify email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
