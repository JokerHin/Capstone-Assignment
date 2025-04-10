import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { AppContent } from "../context/AppContext";
import AdminOverview from "../components/AdminComponents/AdminOverview";
import AdminUsers from "../components/AdminComponents/AdminUsers";
import AdminContent from "../components/AdminComponents/AdminContent";
import AdminAchievements from "../components/AdminComponents/AdminAchievements";
import { LogOut, Menu, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { userData, backendUrl, setUserData, setIsLoggedin } = appContext;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMobile &&
        sidebarOpen &&
        !target.closest(".sidebar") &&
        !target.closest(".sidebar-toggle")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle tab selection and close sidebar on mobile
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Render active component based on selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <AdminUsers />;
      case "content":
        return <AdminContent />;
      case "achievements":
        return <AdminAchievements />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      {/* Mobile Header */}
      <div className="lg:hidden w-full bg-slate-900 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          <h1 className="ml-2 text-lg font-medium text-white">
            <span className="text-[#ff8800] text-sm">The</span> Codyssey
          </h1>
        </div>
        <button
          className="sidebar-toggle text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile */}
      <div
        className={`sidebar bg-slate-900 shadow-lg flex flex-col transition-all duration-300 ease-in-out z-20
                   ${
                     isMobile
                       ? sidebarOpen
                         ? "fixed inset-0 w-64 translate-x-0"
                         : "fixed inset-0 w-64 -translate-x-full"
                       : "w-64 sticky top-0 h-screen"
                   }`}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden lg:flex p-4 items-center border-b border-gray-700">
          <img src={Logo} alt="Logo" className="w-12 h-12" />
          <h1 className="ml-2 text-lg font-medium text-white">
            <span className="text-[#ff8800] text-sm">The</span> Codyssey
          </h1>
        </div>

        {/* Close button - Mobile Only */}
        <div className="lg:hidden flex justify-end p-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "overview"
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleTabChange("overview")}
              >
                <span className="ml-2">Overview</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "users"
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleTabChange("users")}
              >
                <span className="ml-2">Users</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "content"
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleTabChange("content")}
              >
                <span className="ml-2">Content</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "achievements"
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleTabChange("achievements")}
              >
                <span className="ml-2">Achievements</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Admin Profile & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex justify-center items-center rounded-full bg-[#ff8800] text-white text-xl">
              {userData?.name ? userData.name[0].toUpperCase() : "A"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{userData?.name || "Admin"}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer"
          >
            <LogOut size={16} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        {/* Mobile Tab Title */}
        <div className="lg:hidden mb-4">
          <h1 className="text-2xl font-bold capitalize">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
        </div>

        {renderActiveComponent()}
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
