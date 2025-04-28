import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { userData, backendUrl, setUserData } = appContext;

  const [updatedName, setUpdatedName] = useState(userData?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
        onClose();
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
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-3xl text-sm inset-shadow-sm inset-shadow-amber-500 top-16 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-semibold text-white text-center mb-5">
          My Profile
        </h2>

        {/* Game Progress Section */}
        <div className="mb-6 bg-[#1a1f38] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">
            Game Progress
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Left column - Current Realm & Progress */}
            <div className="space-y-4">
              <div className="bg-[#262b47] p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">Current Realm</p>
                <p className="text-white font-semibold">
                  {gameProgress.currentRealm}
                </p>
              </div>

              <div className="bg-[#262b47] p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="text-gray-300 text-sm">Overall Progress</p>
                  <p className="text-gray-300 text-sm">
                    {gameProgress.progress}%
                  </p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full"
                    style={{ width: `${gameProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Right column - Points & Next Realm */}
            <div className="space-y-4">
              <div className="bg-[#262b47] p-4 rounded-lg">
                <h4 className="text-gray-300 text-sm mb-1">Total Points</h4>
                <p className="text-2xl font-bold text-white">
                  {gameProgress.totalPoints}
                </p>
              </div>

              <div className="bg-[#262b47] p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">Next Realm</p>
                <p className="text-white">{gameProgress.nextRealm}</p>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="mt-5">
            <h4 className="text-lg font-semibold text-amber-400 mb-3">
              Your Badges
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {userBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center bg-[#262b47] p-2 rounded-lg"
                >
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className="w-12 h-12"
                  />
                  <p className="text-xs text-center text-white mt-1">
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Settings Form */}
        <h3 className="text-xl font-semibold text-amber-400 mb-3">
          Account Settings
        </h3>
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
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
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
  );
};

export default ProfileModal;
