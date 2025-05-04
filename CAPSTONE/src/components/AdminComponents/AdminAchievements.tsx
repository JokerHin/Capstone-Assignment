import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";

interface Achievement {
  _id?: string;
  id?: number;
  name: string;
  description?: string; // Made optional
  points?: number; // Made optional
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  game: string;
}

const AdminAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievementModal, setNewAchievementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState<Achievement>({
    name: "",
    rarity: "common",
    game: "All Games",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentAchievementId, setCurrentAchievementId] = useState<
    string | null
  >(null);

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl } = appContext;

  // Fetch all achievements when component mounts
  useEffect(() => {
    fetchAchievements();
  }, []);

  // Fetch achievements from API
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/achievements`);

      if (data.success) {
        setAchievements(data.achievements);
      } else {
        toast.error(data.message || "Failed to fetch achievements");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error loading achievements"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle creating or updating an achievement
  const handleSaveAchievement = async () => {
    try {
      if (!newAchievement.name) {
        toast.error("Name is required");
        return;
      }

      if (isEditing && currentAchievementId) {
        // Update existing achievement
        const { data } = await axios.put(
          `${backendUrl}/api/admin/achievements/${currentAchievementId}`,
          newAchievement
        );

        if (data.success) {
          toast.success("Achievement updated successfully");
          fetchAchievements();
          resetAndCloseModal();
        } else {
          toast.error(data.message || "Failed to update achievement");
        }
      } else {
        // Create new achievement
        const { data } = await axios.post(
          `${backendUrl}/api/admin/achievements`,
          newAchievement
        );

        if (data.success) {
          toast.success("Achievement created successfully");
          fetchAchievements();
          resetAndCloseModal();
        } else {
          toast.error(data.message || "Failed to create achievement");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving achievement");
    }
  };

  // Handle deleting an achievement
  const handleDeleteAchievement = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this achievement?"))
      return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/achievements/${id}`
      );

      if (data.success) {
        toast.success("Achievement deleted successfully");
        fetchAchievements();
      } else {
        toast.error(data.message || "Failed to delete achievement");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error deleting achievement"
      );
    }
  };

  // Handle editing an achievement
  const handleEditAchievement = (achievement: Achievement) => {
    setIsEditing(true);
    setCurrentAchievementId(achievement._id || null);
    setNewAchievement({
      name: achievement.name,
      rarity: achievement.rarity,
      game: achievement.game,
    });
    setNewAchievementModal(true);
  };

  // Reset form and close modal
  const resetAndCloseModal = () => {
    setNewAchievement({
      name: "",
      rarity: "common",
      game: "All Games",
    });
    setIsEditing(false);
    setCurrentAchievementId(null);
    setNewAchievementModal(false);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewAchievement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open the modal for creating a new achievement
  const openNewAchievementModal = () => {
    resetAndCloseModal();
    setNewAchievementModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded cursor-pointer"
          onClick={openNewAchievementModal}
        >
          Add Achievement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-300">Loading achievements...</div>
        </div>
      ) : achievements.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-300">
            No achievements found. Add your first one!
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement._id || achievement.id}
              className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div
                className={`h-2 ${
                  achievement.rarity === "common"
                    ? "bg-gray-400"
                    : achievement.rarity === "uncommon"
                    ? "bg-green-500"
                    : achievement.rarity === "rare"
                    ? "bg-blue-500"
                    : achievement.rarity === "epic"
                    ? "bg-purple-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white">
                    {achievement.name}
                  </h3>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm">
                  <div className="text-gray-500">
                    Game:{" "}
                    <span className="text-gray-300">{achievement.game}</span>
                  </div>
                  <div className="text-gray-500">
                    Rarity:{" "}
                    <span
                      className={`
                      ${
                        achievement.rarity === "common"
                          ? "text-gray-300"
                          : achievement.rarity === "uncommon"
                          ? "text-green-400"
                          : achievement.rarity === "rare"
                          ? "text-blue-400"
                          : achievement.rarity === "epic"
                          ? "text-purple-400"
                          : "text-yellow-400"
                      }
                    `}
                    >
                      {achievement.rarity.charAt(0).toUpperCase() +
                        achievement.rarity.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-sm cursor-pointer"
                    onClick={() => handleEditAchievement(achievement)}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1 rounded text-sm cursor-pointer"
                    onClick={() =>
                      handleDeleteAchievement(achievement._id || "")
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievement Modal for Create/Edit */}
      {newAchievementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? "Edit Achievement" : "Add New Achievement"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAchievement.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 rounded border border-gray-600 text-white px-3 py-2"
                  placeholder="Achievement name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Rarity
                  </label>
                  <select
                    name="rarity"
                    value={newAchievement.rarity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 rounded border border-gray-600 text-white px-3 py-2"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Game
                  </label>
                  <select
                    name="game"
                    value={newAchievement.game}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 rounded border border-gray-600 text-white px-3 py-2"
                  >
                    <option value="All Games">All Games</option>
                    <option value="Debug Detective">Debug Detective</option>
                    <option value="Algorithm Adventure">
                      Algorithm Adventure
                    </option>
                    <option value="Function Fighter">Function Fighter</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={resetAndCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                onClick={handleSaveAchievement}
              >
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAchievements;
