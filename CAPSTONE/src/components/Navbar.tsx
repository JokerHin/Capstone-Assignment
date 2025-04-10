import { useState, useEffect, useContext } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "@/context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setmMobileMenuOpen] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  function handleScrollPercentage() {
    const howMuchScrolled =
      document.body.scrollTop || document.documentElement.scrollTop;

    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    setScrollPercentage((howMuchScrolled / height) * 100);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScrollPercentage);

    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, [scrollPercentage]);

  function handleScrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const appContext = useContext(AppContent);

  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { userData, backendUrl, setUserData, setIsLoggedin } = appContext;

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

  const handleOpenProfileModal = () => {
    if (userData) {
      setUpdatedName(userData.name);
    }
    setCurrentPassword("");
    setNewPassword("");
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = async () => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      const requestBody: {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};

      if (updatedName !== userData.name) {
        requestBody.name = updatedName;
      }

      if (newPassword) {
        if (!currentPassword) {
          toast.error("Current password is required to change password");
          return;
        }
        requestBody.currentPassword = currentPassword;
        requestBody.newPassword = newPassword;
      }

      if (Object.keys(requestBody).length === 0) {
        setIsProfileModalOpen(false);
        return;
      }

      const { data } = await axios.put(
        backendUrl + "/api/user/update-profile",
        requestBody
      );

      if (data.success) {
        setUserData({
          ...userData,
          name: updatedName || userData.name,
        });
        toast.success("Profile updated successfully");
        setIsProfileModalOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-0 py-4">
      <div className=" max-w-7xl mx-auto flex h-14 items-center">
        <div className="md:mr-4 flex justify-between w-full">
          <a
            onClick={handleScrollToTop}
            className="mr-6 flex items-center space-x-2 mt-5 cursor-pointer"
          >
            <img src={Logo} alt="logo" className="w-20 h-auto" />
            <h2 className="block rounded-md ml-[-15px] mt-2 font-medium text-white text-2xl">
              <span className="text-[#ff8800] ">The</span> Codyssey
            </h2>
          </a>
          <nav className="md:flex hidden items-center space-x-10 text-lg font-medium text-white mt-5">
            <a
              href="#Home"
              className="text-white hover:text-[#ff8800] hover:-translate-y-1 hover:duration-75 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToTop();
              }}
            >
              Home
            </a>
            <a
              href="#games"
              className="text-white hover:text-[#ff8800] hover:-translate-y-1 hover:duration-75 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("games-section");
              }}
            >
              Games
            </a>
            <a
              href="#contributor"
              className="text-white hover:text-[#ff8800] hover:-translate-y-1 hover:duration-75 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contributors-section");
              }}
            >
              Contributor
            </a>
          </nav>
          {userData ? (
            <div className="flex items-center mt-7">
              <div className="w-10 h-10 flex justify-center items-center rounded-full bg-[#ff8800] text-white text-xl relative group">
                {userData.name[0].toUpperCase()}
                <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 text-3xl">
                  <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                    <li
                      className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                      onClick={handleOpenProfileModal}
                    >
                      My Profile
                    </li>
                    <li
                      onClick={logout}
                      className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
              <h1 className="ml-2 flex items-center gap-2 text-md sm:text-xl font-medium text-white">
                {userData ? userData.name : null}
              </h1>
            </div>
          ) : (
            <div>
              <button
                className="py-2 px-6 bg-[#ff8800] rounded-2xl text-white font-bold transition active:scale-80 mt-10 cursor-pointer hover:bg-amber-500 hover:-translate-y-1 hover:duration-75"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          )}
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md md:hidden"
          onClick={() => setmMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {mobileMenuOpen ? (
            <X
              className="h-6 w-6 text-white mt-4 mx-2 cursor-pointer"
              aria-hidden="true"
            />
          ) : (
            <Menu
              className="h-6 w-6 text-white mt-4 mx-2 cursor-pointer"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 mt-5">
            <a
              href="#Home"
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-50 hover:text-gray-900"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToTop();
                setmMobileMenuOpen(false);
              }}
            >
              Home
            </a>
            <a
              href="#games"
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-50 hover:text-gray-900"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("games-section");
                setmMobileMenuOpen(false);
              }}
            >
              Games
            </a>
            <a
              href="#contributor"
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-50 hover:text-gray-900"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contributors-section");
                setmMobileMenuOpen(false);
              }}
            >
              Contributor
            </a>
          </div>
        </div>
      )}
      <div
        className="mt-4 h-1 rounded-full bg-[#ff8800]"
        style={{ width: `${scrollPercentage}%` }}
      ></div>
      {isProfileModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-sm inset-shadow-sm inset-shadow-amber-500 top-60">
            <h2 className="text-3xl font-semibold text-white text-center mb-3">
              My Profile
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  Name
                </label>
                <div className="flex items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-transparent outline-none ml-5 text-white w-full"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  Email
                </label>
                <div className="flex items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                  <span className="text-white ml-5">{userData?.email}</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  Current Password
                </label>
                <div className="flex items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-transparent outline-none ml-5 text-white w-full"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  New Password
                </label>
                <div className="flex items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-transparent outline-none ml-5 text-white w-full"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="py-2 px-6 bg-gray-500 rounded-full text-white font-bold hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProfileUpdate}
                  className="py-2 px-6 bg-orange-500 rounded-full text-white font-bold hover:bg-orange-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
