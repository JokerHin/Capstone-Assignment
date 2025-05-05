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

const AdminContent: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [subquests, setSubquests] = useState<Subquest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("games");
  const navigate = useNavigate(); // Add useNavigate

  // Add state for title editing
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

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

      {/* Assets Content - Placeholder */}
      {activeTab === "Inventory" && (
        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
          <p className="text-gray-300">
            Assets management content will be displayed here
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
