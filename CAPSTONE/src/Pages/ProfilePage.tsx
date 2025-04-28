import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { ArrowLeft } from "lucide-react";
import "../Pages/Animation.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { userData, backendUrl, setUserData, isLoggedin } = appContext;

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedin) {
      navigate("/login");
      toast.error("Please login to view your profile");
    }
  }, [isLoggedin, navigate]);

  const [updatedName, setUpdatedName] = useState(userData?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [activeTab, setActiveTab] = useState("progress");

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
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Sample game progress data - in a real app, this would come from your backend
  const gameProgress = {
    currentRealm: "Realm 1: The House of Blueprints (Classes)",
    totalPoints: 1200,
    progress: 60,
    nextRealm: "Realm 2: The Object Outpost (Objects)",
  };

  // Sample badges - in a real app, these would come from your backend
  const userBadges = [
    { id: 1, name: "Coder", image: "./src/assets/badge.png" },
    { id: 2, name: "Explorer", image: "./src/assets/badge.png" },
    { id: 3, name: "Achiever", image: "./src/assets/badge.png" },
    { id: 4, name: "Developer", image: "./src/assets/badge.png" },
    { id: 5, name: "Tester", image: "./src/assets/badge.png" },
    { id: 6, name: "Creator", image: "./src/assets/badge.png" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-8 slide-in-right">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-700 rounded-full flex items-center justify-center text-3xl font-bold mb-4 sm:mb-0 sm:mr-6">
              {userData?.name ? userData.name[0].toUpperCase() : "U"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {userData?.name || "User"}
              </h1>
              <p className="text-gray-300">
                {userData?.email || "email@example.com"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="bg-blue-600/20 text-blue-400 text-xs rounded-full px-3 py-1">
                  {gameProgress.totalPoints} Points
                </span>
                <span className="bg-green-600/20 text-green-400 text-xs rounded-full px-3 py-1">
                  {userBadges.length} Badges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            className={`py-3 px-6 font-medium transition-colors cursor-pointer ${
              activeTab === "progress"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("progress")}
          >
            Game Progress
          </button>
          <button
            className={`py-3 px-6 font-medium transition-colors cursor-pointer ${
              activeTab === "account"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </button>
        </div>

        {/* Game Progress Tab */}
        {activeTab === "progress" && (
          <div className="fade-in">
            {/* Progress Overview - Now full width since we removed Recent Achievements */}
            <div className="bg-slate-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">
                Current Progress
              </h2>
              <div className="mb-4">
                <div className="text-gray-300 text-sm mb-1">Current Realm</div>
                <div className="text-white font-semibold">
                  {gameProgress.currentRealm}
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-gray-300 text-sm mb-1">
                  <span>Overall Completion</span>
                  <span>{gameProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full"
                    style={{ width: `${gameProgress.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-gray-300 text-sm mb-1">Next Realm</div>
                <div className="text-white">{gameProgress.nextRealm}</div>
              </div>
            </div>

            {/* Badges Grid - No change needed */}
            <div className="bg-slate-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">
                Your Badges
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {userBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-16  mb-2"
                    />
                    <span className="text-center text-sm">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Tab - No change needed */}
        {activeTab === "account" && (
          <div className="bg-slate-800 rounded-lg p-6 fade-in">
            <h2 className="text-xl font-semibold text-amber-400 mb-6">
              Account Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileUpdate}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
