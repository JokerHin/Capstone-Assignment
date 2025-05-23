import { useNavigate } from "react-router-dom";
import Logo from "../../public/logo.png";
import { useContext, useState, useEffect } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import person from "../../public/assets/person_icon.svg";
import mail from "../../public/assets/mail_icon.svg";
import lock from "../../public/assets/lock_icon.svg";
import mc from "../../public/assets/mc.gif";
import "./Animation.css";

export default function Login() {
  const navigate = useNavigate();

  const appContext = useContext(AppContent);

  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl, login } = appContext;

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType] = useState("user");
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  useEffect(() => {
    if (appContext.isLoggedin && appContext.userData?.userType === "admin") {
      navigate("/AdminHome");
    }
  }, [appContext.isLoggedin, appContext.userData, navigate]);

  const onSubmitHandler = async (e: any) => {
    try {
      e.preventDefault();

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
          userType,
        });

        if (data.success) {
          toast.success("Successfully registered");
          const loginSuccess = await login(email, password);
          if (loginSuccess) {
            navigate("/");
          }
        } else {
          toast.error(data.message);
        }
      } else {
        const loginSuccess = await login(email, password, isAdminLogin);

        if (loginSuccess) {
          localStorage.setItem("userEmail", email);
          toast.success("Successfully logged in");

          // Admin redirect is now handled by the context navigation provider
          // so we only need to navigate to home for regular users
          if (!isAdminLogin) {
            navigate("/");
          }
          // No navigate for admin since it's handled by the context
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-6 sm:px-0 slide-in-right"
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
        className="absolute left-30 sm:left-50 top-18 ml-[-15px] font-medium text-white text-2xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        <span className="text-[#ff8800]">The</span> Codyssey
      </h2>
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-sm inset-shadow-sm inset-shadow-amber-500">
        <h2 className="text-3xl font-semibold text-white text-center mb-3 ">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6 text-[#ff8800]">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center ga[-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={person} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className=" bg-transparent outline-none ml-5 text-white"
                type="text"
                placeholder="Name"
                required
              />
            </div>
          )}

          <div className="mb-4 flex items-center ga[-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={mail} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className=" bg-transparent outline-none ml-5 text-white"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-4 flex items-center ga[-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={lock} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className=" bg-transparent outline-none ml-5 text-white"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          {state === "Login" && (
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="adminLogin"
                checked={isAdminLogin}
                onChange={(e) => setIsAdminLogin(e.target.checked)}
                className="w-4 h-4 mr-2 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              />
              <label
                htmlFor="adminLogin"
                className="text-gray-300 text-sm cursor-pointer"
              >
                Login as Administrator
              </label>
            </div>
          )}

          {state === "Login" && (
            <p
              onClick={() => navigate("/Reset-password")}
              className="mb-4 text-[#ff8800] cursor-pointer hover:text-orange-400"
            >
              Forgot password
            </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-900 text-white front-medium cursor-pointer">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
      <img
        src={mc}
        alt="image"
        className="absolute top-150 right-0 w-[50%] z-10 md:top-120 md:right-90 md:w-[20%]"
      />
    </div>
  );
}
