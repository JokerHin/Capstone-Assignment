import { useEffect } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AdminProvider } from "./context/AdminContext";
import { AppContextNavigationProvider } from "./context/AppContext";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import ResetPassword from "./Pages/ResetPassword";
import Game from "./Pages/Game";
import AdminHome from "./Pages/AdminHome";
import ProfilePage from "./Pages/ProfilePage";
import AdminSubquest from "./components/AdminComponents/AdminSubquest";
import AdminDialogue from "./components/AdminComponents/AdminDialogue";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRoutes = () => {
      const pathname = window.location.pathname;

      if (pathname.startsWith("/AdminHome") || pathname.startsWith("/admin/")) {
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        const isLoggedIn = Boolean(localStorage.getItem("userData"));

        if (!isLoggedIn || !isAdmin) {
          navigate("/login");
        }
      }

      if (pathname === "/profile") {
        const isLoggedIn = Boolean(localStorage.getItem("userData"));

        if (!isLoggedIn) {
          navigate("/login");
        }
      }
    };

    checkAdminRoutes();
  }, [navigate]);

  return (
    <div>
      <ToastContainer />
      <AdminProvider>
        <AppContextNavigationProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />}></Route>
            <Route path="/reset-password" element={<ResetPassword />}></Route>
            <Route path="/AdminHome" element={<AdminHome />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/game" element={<Game />} />
            <Route
              path="/admin/subquests/:questId"
              element={<AdminSubquest />}
            />
            <Route
              path="/admin/dialogues/:questId/:subquestId"
              element={<AdminDialogue />}
            />
          </Routes>
        </AppContextNavigationProvider>
      </AdminProvider>
    </div>
  );
}

export default App;
