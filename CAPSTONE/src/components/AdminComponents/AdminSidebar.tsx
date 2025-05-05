import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { AppContent } from "../../context/AppContext";
import { LogOut, Menu, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

interface AdminSidebarProps {
  activeTab?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab = "overview",
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [adminName, setAdminName] = useState<string | null>(null);

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { userData, backendUrl, setUserData, setIsLoggedin } = appContext;

  // Set admin name from userData when it's available
  useEffect(() => {
    if (userData && userData.name) {
      setAdminName(userData.name);
    }
  }, [userData]);

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

  // Logout function
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

  // Navigate to different admin pages
  const navigateToAdminPage = (page: string) => {
    // Navigate to the correct route with the tab parameter
    switch (page) {
      case "overview":
        navigate("/AdminHome"); // No params needed for overview (default)
        break;
      case "users":
      case "content":
      case "npc":
      case "achievements":
        navigate(`/AdminHome?tab=${page}`);
        break;
      default:
        navigate("/AdminHome");
    }

    // Close the sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden w-full bg-slate-900 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          <h1 className="ml-2 text-md font-medium text-white">
            <span className="text-[#ff8800]">The</span> Codyssey
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
                onClick={() => navigateToAdminPage("overview")}
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
                onClick={() => navigateToAdminPage("users")}
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
                onClick={() => navigateToAdminPage("content")}
              >
                <span className="ml-2">Content</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "npc"
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => navigateToAdminPage("npc")}
              >
                <span className="ml-2">NPCs</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-4 py-3 rounded-lg ${
                  activeTab === "achievements"
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => navigateToAdminPage("achievements")}
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
              {adminName ? adminName[0].toUpperCase() : "A"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{adminName || "Admin"}</p>
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

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
