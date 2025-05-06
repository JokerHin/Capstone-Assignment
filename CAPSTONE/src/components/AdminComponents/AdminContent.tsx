import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Pencil, Check, X, MessageSquare } from "lucide-react";

interface Quest {
  _id: string;
  quest_id: number;
  title: string;
  name?: string;
  status?: "active" | "draft";
  lastUpdated?: string;
  subquestCount?: number;
}

interface Subquest {
  _id: string;
  subquest_id: number;
  quest_id: number;
  title: string;
  admin_id?: number;
}

interface InventoryItem {
  _id: string;
  item_id: number;
  name: string;
  type: string;
  description?: string;
}

const AdminContent: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [subquests, setSubquests] = useState<Subquest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("games");
  const navigate = useNavigate(); // Add useNavigate

  // Add state for title editing
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl } = appContext;

  // Fetch quests and subquests data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch quests and subquests in parallel
        const [questsResponse, subquestsResponse] = await Promise.all([
          axios.get(`${backendUrl}/quest`),
          axios.get(`${backendUrl}/subquest`),
        ]);

        // Process and format quest data
        const questData = questsResponse.data.map((quest: any) => ({
          ...quest,
          // Use title from database, or name as fallback, or create a default title
          title: quest.title || quest.name || `Quest ${quest.quest_id}`,
          status: "active", // Default status
          lastUpdated: new Date().toISOString().split("T")[0], // Today's date
        }));

        setQuests(questData);
        setSubquests(subquestsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load game data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  // Create a function to make authenticated API requests
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

  // Fetch inventory items data
  useEffect(() => {
    if (activeTab === "Inventory") {
      const fetchInventoryItems = async () => {
        setInventoryLoading(true);
        try {
          const response = await axios.get(`${backendUrl}/item`);

          // Filter out badge type items - these are shown in the badges section
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

  // Calculate subquest counts for each quest
  const questsWithCounts = quests.map((quest) => {
    const relatedSubquests = subquests.filter(
      (sq) => sq.quest_id === quest.quest_id
    );
    return {
      ...quest,
      subquestCount: relatedSubquests.length,
    };
  });

  // Function to handle edit button click and navigate to subquest view
  const handleEditQuest = (questId: number) => {
    navigate(`/admin/subquests/${questId}`);
  };

  // New function to handle title edit mode
  const handleEditTitle = (quest: Quest) => {
    setEditingQuestId(quest._id);
    setEditedTitle(quest.title);
  };

  // New function to save edited title with better error handling
  const handleSaveTitle = async (questId: string) => {
    if (!editedTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      // Make API call to update the quest title
      // First, check if we're dealing with MongoDB _id or quest_id
      const field = questId.length > 10 ? "_id" : "quest_id";
      const endpoint =
        field === "_id"
          ? `${backendUrl}/quest/${questId}`
          : `${backendUrl}/quest/${questId}`;

      const response = await axios.put(endpoint, {
        title: editedTitle,
      });

      if (response.data) {
        // Update the quest title in local state
        setQuests(
          quests.map((q) =>
            q._id === questId ? { ...q, title: editedTitle } : q
          )
        );
        toast.success("Quest title updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating quest title:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update quest title. Server may be unavailable.";
      toast.error(errorMessage);
    } finally {
      setEditingQuestId(null);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestId(null);
  };

  // Handle editing an inventory item
  const handleEditItem = (item: InventoryItem) => {
    setCurrentItem(item);
    setEditForm({
      name: item.name || "",
      description: item.description || "",
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
        // Update the item in the local state
        setInventoryItems((prev) =>
          prev.map((item) =>
            item._id === currentItem._id
              ? {
                  ...item,
                  name: editForm.name,
                  description: editForm.description,
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
    setEditForm({ name: "", description: "" });
  };

  // Get item image based on type and index
  const getItemImage = (type: string, index: number) => {
    if (type === "quest") {
      return "/src/assets/green_gem.png";
    } else if (type === "milestone") {
      return "/src/assets/potion.png";
    } else if (type === "currency") {
      return "/src/assets/coin.png";
    } else {
      const itemNumber = (index % 3) + 1;
      return `/src/assets/items/item${itemNumber}.png`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
      </div>

      {/* Tab Navigation */}
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Last Updated
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
                      <div className="flex items-center">
                        {editingQuestId === quest._id ? (
                          // Edit mode - show input field
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              className="bg-slate-700 text-white px-2 py-1 rounded border border-slate-600 w-full"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveTitle(quest._id)}
                              className="text-green-400 hover:text-green-300"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-400 hover:text-red-300"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          // Display mode - show title with edit icon
                          <div className="flex items-center space-x-2 text-sm font-medium text-white group">
                            <span>{quest.title}</span>
                            <button
                              onClick={() => handleEditTitle(quest)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                              title="Edit title"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {quest.subquestCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {quest.lastUpdated || "N/A"}
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
              {inventoryItems.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="h-2 bg-orange-500"></div>
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                      <img
                        src={getItemImage(item.type, index)}
                        alt={item.name}
                        className="w-24 h-24 mb-4 object-contain"
                      />
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white">
                          {item.name || `Item #${item.item_id}`}
                        </h3>
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
