import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { ArrowLeft, Check, X, Pencil, MessageSquare } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import questData from "../PlayerComponent/game-data/quest.json";

interface Subquest {
  _id: string;
  subquest_id: number;
  quest_id: number | string;
  title: string;
  description?: string;
  admin_id?: number;
}

const AdminSubquest: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const [subquests, setSubquests] = useState<Subquest[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove showAddModal state
  const [editingSubquestId, setEditingSubquestId] = useState<string | null>(
    null
  );
  const [editedSubquestTitle, setEditedSubquestTitle] = useState("");
  // Remove formData state

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }
  const { backendUrl } = appContext;

  // Find the quest from the imported JSON data
  const quest = useMemo(() => {
    if (!questId) return null;
    const foundQuest = questData.find((q) => q.quest_id === Number(questId));
    return foundQuest
      ? {
          _id: `quest_${foundQuest.quest_id}`,
          quest_id: Number(foundQuest.quest_id),
          title: foundQuest.title || `Quest ${foundQuest.quest_id}`,
        }
      : null;
  }, [questId]);

  // Fetch subquests data
  useEffect(() => {
    if (!questId) return;

    const fetchSubquests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${backendUrl}/subquest`);

        // Filter subquests for this quest - match against both string and number types
        const filteredSubquests = response.data.filter(
          (sq: any) =>
            String(sq.quest_id) === String(questId) ||
            Number(sq.quest_id) === Number(questId)
        );

        // Format subquests with default titles if needed
        const formattedSubquests = filteredSubquests.map((sq: any) => ({
          ...sq,
          title: sq.title || sq.name || `Subquest ${sq.subquest_id}`,
        }));

        // Sort subquests by subquest_id in ascending order
        const sortedSubquests = formattedSubquests.sort(
          (a: Subquest, b: Subquest) => {
            return Number(a.subquest_id) - Number(b.subquest_id);
          }
        );

        setSubquests(sortedSubquests);
      } catch (error) {
        console.error("Error fetching subquests:", error);
        toast.error("Failed to load subquest data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubquests();
  }, [questId, backendUrl]);

  const handleEditSubquest = (subquest: Subquest) => {
    setEditingSubquestId(subquest._id);
    setEditedSubquestTitle(subquest.title);
  };

  // Save edited subquest title
  const handleSaveSubquestTitle = async (subquestId: string) => {
    if (!editedSubquestTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const subquest = subquests.find((sq) => sq._id === subquestId);
      if (!subquest) return;

      const response = await axios.put(`${backendUrl}/subquest/${subquestId}`, {
        title: editedSubquestTitle,
      });

      if (response.data) {
        toast.success("Subquest title updated successfully");
        // Update local state
        setSubquests(
          subquests.map((sq) =>
            sq._id === subquestId ? { ...sq, title: editedSubquestTitle } : sq
          )
        );
      }
    } catch (error) {
      console.error("Error updating subquest title:", error);
      toast.error("Failed to update subquest title");
    } finally {
      setEditingSubquestId(null);
    }
  };

  // Cancel subquest title editing
  const handleCancelSubquestEdit = () => {
    setEditingSubquestId(null);
  };

  // Navigate to dialogue management for a specific subquest
  const navigateToDialogues = (subquestId: number) => {
    navigate(`/admin/dialogues/${questId}/${subquestId}`);
  };

  // Go back to AdminContent page
  const handleBack = () => {
    navigate("/AdminHome?tab=content");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      <AdminSidebar activeTab="content" />

      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white mr-4"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-3xl font-bold">
                {loading
                  ? "Loading Quest..."
                  : quest
                  ? "Subquests"
                  : "Quest Not Found"}
              </h1>
            </div>
          </div>

          {/* Quest Overview Card */}
          {!loading && quest && (
            <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
              <div className="flex justify-between">
                <div className="flex-grow">
                  <span className="text-xs font-medium text-gray-400">
                    Quest ID: {quest.quest_id}
                  </span>
                  <div className="mt-1">
                    <h2 className="text-lg font-semibold text-white">
                      {quest.title}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subquests Table */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                Loading subquests...
              </div>
            ) : subquests.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-400 mb-5">
                  No subquests found for this quest.
                </p>
                {/* Remove Add First Subquest button */}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Title
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
                  {subquests.map((subquest) => (
                    <tr key={subquest._id} className="hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {subquest.subquest_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingSubquestId === subquest._id ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="text"
                              value={editedSubquestTitle}
                              onChange={(e) =>
                                setEditedSubquestTitle(e.target.value)
                              }
                              className="bg-slate-700 text-white px-2 py-1 rounded border border-slate-600 w-full"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                handleSaveSubquestTitle(subquest._id)
                              }
                              className="text-green-400 hover:text-green-300"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelSubquestEdit}
                              className="text-red-400 hover:text-red-300"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center group">
                            <div className="text-sm font-medium text-white">
                              {subquest.title}
                            </div>
                            <button
                              onClick={() => handleEditSubquest(subquest)}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                              title="Edit title"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            navigateToDialogues(subquest.subquest_id)
                          }
                          className="text-blue-400 hover:text-blue-300"
                          title="Manage dialogues"
                        >
                          <MessageSquare size={16} className="inline mr-1" />
                          Dialogues
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Remove Add Modal */}
    </div>
  );
};

export default AdminSubquest;
