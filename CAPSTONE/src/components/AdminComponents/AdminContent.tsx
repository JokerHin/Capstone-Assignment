import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Pencil, MessageSquare } from "lucide-react";
import questData from "../../../public/PlayerComponent/game-data/quest.json";
import itemDetails from "../../../public/PlayerComponent/game-data/item_detail.json";

interface Subquest {
  _id: string;
  subquest_id: number;
  quest_id: number;
  title: string;
}

interface InventoryItem {
  _id: string;
  item_id: number;
  name: string;
  type: string;
  description?: string;
}

const AdminContent: React.FC = () => {
  const [subquests, setSubquests] = useState<Subquest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("games");
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "", // Add type to the form state
  });

  // Get backend URL from context
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }
  const { backendUrl } = appContext;

  useEffect(() => {
    if (activeTab === "games") {
      const fetchSubquests = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${backendUrl}/subquest`);
          setSubquests(response.data);
        } catch (error) {
          console.error("Error fetching subquests:", error);
          toast.error("Failed to load subquest data. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchSubquests();
    }
  }, [backendUrl, activeTab]);

  // Fetch inventory items data (only when inventory tab is active)
  useEffect(() => {
    if (activeTab === "Inventory") {
      const fetchInventoryItems = async () => {
        setInventoryLoading(true);
        try {
          const response = await axios.get(`${backendUrl}/item`);
          const items = response.data.filter(
            (item: any) => item.type !== "badge"
          );
          setInventoryItems(items);
        } catch (error) {
          console.error("Error fetching inventory items:", error);
          toast.error("Failed to load inventory items.");
        } finally {
          setInventoryLoading(false);
        }
      };

      fetchInventoryItems();
    }
  }, [backendUrl, activeTab]);

  const quests = useMemo(() => {
    return questData.map((quest: any) => ({
      _id: `quest_${quest.quest_id}`,
      quest_id: quest.quest_id,
      title: quest.title || `Quest ${quest.quest_id}`,
    }));
  }, []);

  const questsWithCounts = useMemo(() => {
    return quests.map((quest) => {
      const relatedSubquests = subquests.filter(
        (sq) =>
          String(sq.quest_id) === String(quest.quest_id) ||
          Number(sq.quest_id) === Number(quest.quest_id)
      );
      return {
        ...quest,
        subquestCount: relatedSubquests.length,
      };
    });
  }, [quests, subquests]);

  const handleEditQuest = (questId: number) => {
    navigate(`/admin/subquests/${questId}`);
  };

  const makeAuthRequest = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return axios({
      url: `${backendUrl}${endpoint}`,
      ...options,
      headers,
      withCredentials: true,
    });
  };

  // Handle editing an inventory item
  const handleEditItem = (item: InventoryItem) => {
    setCurrentItem(item);
    setEditForm({
      name: item.name || "",
      description: item.description || "",
      type: item.type || "", // Include type in the form
    });
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle saving item edits
  const handleSaveItem = async () => {
    if (!currentItem) return;

    try {
      if (!editForm.name.trim()) {
        toast.error("Name is required");
        return;
      }

      const { data } = await makeAuthRequest(`/item/${currentItem._id}`, {
        method: "PUT",
        data: editForm,
      });

      if (data.success) {
        toast.success("Item updated successfully");
        setInventoryItems((prev) =>
          prev.map((item) =>
            item._id === currentItem._id
              ? {
                  ...item,
                  name: editForm.name,
                  description: editForm.description,
                  type: editForm.type,
                }
              : item
          )
        );
        closeEditModal();
      } else {
        toast.error(data.message || "Failed to update item");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating item");
    }
  };

  // Close the edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentItem(null);
    setEditForm({ name: "", description: "", type: "" });
  };

  const getItemImage = (type: string, item_id: number) => {
    // Convert item_id to string for lookup
    const itemIdStr = item_id.toString();

    // Check if this item ID exists in the details
    if (itemDetails[itemIdStr as keyof typeof itemDetails]) {
      const itemDetail = itemDetails[itemIdStr as keyof typeof itemDetails];
      if (itemDetail && itemDetail.img) {
        // Use the full path from public directory
        return `/assets/${itemDetail.img}`;
      }
    }

    // Fallback images by type if item is not in our details
    if (type === "quest") return "/assets/green_gem.png";
    if (type === "milestone") return "/assets/potion.png";
    if (type === "currency" || type === "point") return "/assets/coin.png";

    // Default fallback
    const itemNumber = (item_id % 3) + 1;
    return `/assets/items/item${itemNumber}.png`;
  };

  // Define item type options - updated with only the allowed types
  const itemTypes = ["quest", "badge", "milestone", "point"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
      </div>

      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("games")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "games"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Games
          </button>

          <button
            onClick={() => setActiveTab("Inventory")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "Inventory"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Inventory
          </button>
        </nav>
      </div>

      {/* Games Content */}
      {activeTab === "games" && (
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-400">
              Loading game data...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Total Subquests
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-gray-700">
                {questsWithCounts.map((quest, index) => (
                  <tr key={quest._id || index} className="hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        <span>{quest.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {quest.subquestCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-400 hover:text-indigo-300 mr-3 cursor-pointer"
                        onClick={() => handleEditQuest(quest.quest_id)}
                      >
                        <MessageSquare size={16} className="inline mr-1" />
                        Subquests
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Inventory Content */}
      {activeTab === "Inventory" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Game Items</h2>
          </div>

          {inventoryLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-300">Loading inventory items...</div>
            </div>
          ) : inventoryItems.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-300">No inventory items found.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="h-2 bg-orange-500"></div>
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                      <img
                        src={getItemImage(item.type, item.item_id)}
                        alt={item.name}
                        className="w-24 h-24 mb-4 object-contain"
                      />
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white">
                          {item.name || `Item #${item.item_id}`}
                        </h3>
                        {/* Add type display */}
                        <span className="inline-block px-2 py-1 rounded bg-orange-900 text-orange-200 text-xs mt-2">
                          {item.type}
                        </span>
                        <p className="text-sm text-gray-400 mt-2">
                          {item.description || `No description`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm cursor-pointer flex items-center justify-center w-full"
                        onClick={() => handleEditItem(item)}
                      >
                        <Pencil size={14} className="mr-2" /> Edit Item Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Item Modal */}
      {editModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Edit Item: {currentItem.name || `Item #${currentItem.item_id}`}
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
                  placeholder="Item name"
                  required
                />
              </div>
              {/* Add type selection dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 rounded border border-gray-600 text-white px-3 py-2"
                  required
                >
                  <option value="" disabled>
                    Select a type
                  </option>
                  {itemTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
                  placeholder="Item description"
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
                onClick={handleSaveItem}
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

export default AdminContent;
