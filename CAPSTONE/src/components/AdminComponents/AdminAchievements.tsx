import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { Pencil } from "lucide-react";

// Update the Badge interface to allow string for rarity
interface Badge {
  _id: string;
  item_id?: number;
  name: string;
  description?: string;
  rarity?: string;
  game?: string;
  points?: number;
  image?: string;
}

// Updated to only show and edit badges, not add or delete
const AdminAchievements: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl, isLoggedin } = appContext;

  // Simplified makeRequest function
  const makeRequest = async (endpoint: string, options: any = {}) => {
    try {
      return await axios({
        url: `${backendUrl}${endpoint}`,
        method: options.method || "GET",
        data: options.data,
        withCredentials: true,
      });
    } catch (error) {
      console.error("API request error:", error);
      return null;
    }
  };

  // Fetch badges - simplified without demo data
  useEffect(() => {
    if (isLoggedin) {
      fetchBadges();
    } else {
      setLoading(false);
      toast.error("Please log in as an administrator to access achievements");
    }
  }, [backendUrl, isLoggedin]);

  const fetchBadges = async () => {
    try {
      setLoading(true);

      // Make authenticated request
      const response = await makeRequest("/api/admin/achievements");

      if (response && response.data.success) {
        setBadges(response.data.achievements);
      } else {
        toast.error("Failed to fetch achievements. Please try again later.");
        setBadges([]);
      }
    } catch (error: any) {
      console.error("Error fetching achievements:", error);
      toast.error(
        "Authentication error. Please login as admin to view achievements."
      );
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a badge
  const handleEditBadge = (badge: Badge) => {
    setCurrentBadge(badge);
    setEditForm({
      name: badge.name,
      description: badge.description || "",
    });
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle saving badge edits - UPDATED to use POST with correct path
  const handleSaveBadge = async () => {
    if (!currentBadge) return;

    try {
      if (!editForm.name.trim()) {
        toast.error("Name is required");
        return;
      }

      // Use POST with the correct path structure
      const response = await makeRequest(
        `/api/admin/achievements/${currentBadge._id}/update`,
        {
          method: "POST", // Explicitly set POST method
          data: editForm,
        }
      );

      if (response && response.data.success) {
        toast.success("Badge updated successfully");
        // Update the badge in the local state
        setBadges((prev) =>
          prev.map((badge) =>
            badge._id === currentBadge._id
              ? {
                  ...badge,
                  name: editForm.name,
                  description: editForm.description,
                }
              : badge
          )
        );
        closeEditModal();
      } else {
        toast.error("Failed to update badge");
      }
    } catch (error: any) {
      toast.error("Error updating badge");
    }
  };

  // Close the edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentBadge(null);
    setEditForm({ name: "", description: "" });
  };

  // Get badge image URL based on index
  const getBadgeImage = (index: number) => {
    const badgeNumber = (index % 6) + 1;
    return `/src/assets/badges/badge${badgeNumber}.png`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Achievement Badges</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-300">Loading badges...</div>
        </div>
      ) : badges.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-300">
            {isLoggedin
              ? "No badges found."
              : "Please log in as an administrator to view badges."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, index) => (
            <div
              key={badge._id}
              className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-2 bg-orange-500"></div>
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={getBadgeImage(index)}
                    alt={badge.name}
                    className="w-24 h-24 mb-4 object-contain"
                  />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {badge.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm cursor-pointer flex items-center justify-center w-full"
                    onClick={() => handleEditBadge(badge)}
                  >
                    <Pencil size={14} className="mr-2" /> Edit Badge Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Badge Modal */}
      {editModalOpen && currentBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Edit Badge: {currentBadge.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 rounded border border-gray-600 text-white px-3 py-2"
                  placeholder="Badge name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 rounded border border-gray-600 text-white px-3 py-2"
                  placeholder="Badge description"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                onClick={handleSaveBadge}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAchievements;
