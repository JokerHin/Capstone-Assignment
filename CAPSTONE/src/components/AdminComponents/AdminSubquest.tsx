import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { ArrowLeft, Plus, Check, X, Pencil, MessageSquare } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import questData from "../PlayerComponent/game-data/quest.json";

interface Subquest {
  _id: string;
  subquest_id: number;
  quest_id: number;
  title: string;
  description?: string;
  admin_id?: number;
}

const AdminSubquest: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const [subquests, setSubquests] = useState<Subquest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubquestId, setEditingSubquestId] = useState<string | null>(
    null
  );
  const [editedSubquestTitle, setEditedSubquestTitle] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

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

        // Filter subquests for this quest
        const filteredSubquests = response.data.filter(
          (sq: any) => sq.quest_id === Number(questId)
        );

        // Format subquests with default titles if needed
        const formattedSubquests = filteredSubquests.map((sq: any) => ({
          ...sq,
          title: sq.title || sq.name || `Subquest ${sq.subquest_id}`,
        }));

        setSubquests(formattedSubquests);
      } catch (error) {
        console.error("Error fetching subquests:", error);
        toast.error("Failed to load subquest data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubquests();
  }, [questId, backendUrl]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open add modal
  const handleAddSubquest = () => {
    setFormData({ title: "", description: "" });
    setShowAddModal(true);
  };

  // Start inline editing for a subquest
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

  // Delete subquest
  const handleDeleteSubquest = async (subquestId: string) => {
    if (!window.confirm("Are you sure you want to delete this subquest?")) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/subquest/${subquestId}`);
      toast.success("Subquest deleted successfully");
      // Update local state
      setSubquests(subquests.filter((sq) => sq._id !== subquestId));
    } catch (error) {
      console.error("Error deleting subquest:", error);
      toast.error("Failed to delete subquest");
    }
  };

  // Submit form (create new subquest)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      // Create new subquest
      const nextSubquestId =
        Math.max(0, ...subquests.map((sq) => sq.subquest_id || 0)) + 1;

      const newSubquest = {
        title: formData.title,
        description: formData.description,
        quest_id: Number(questId),
        subquest_id: nextSubquestId,
        admin_id: 1, // Default admin ID
      };

      const response = await axios.post(`${backendUrl}/subquest`, newSubquest);

      if (response.data) {
        toast.success("Subquest added successfully");
        setSubquests([...subquests, response.data]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Error saving subquest:", error);
      toast.error("Failed to save subquest");
    }
  };

  // Navigate back to Admin Content page
  const handleBack = () => {
    navigate("/AdminHome?tab=content");
  };

  // Navigate to dialogue management for a specific subquest
  const navigateToDialogues = (subquestId: number) => {
    navigate(`/admin/dialogues/${questId}/${subquestId}`);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      {/* Sidebar */}
      <AdminSidebar activeTab="content" />

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="space-y-6">
          {/* Header with back button */}
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
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
              onClick={handleAddSubquest}
            >
              <div className="flex items-center">
                <Plus size={16} className="mr-2" />
                Add Subquest
              </div>
            </button>
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
                <button
                  onClick={handleAddSubquest}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Subquest
                </button>
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
                          className="text-blue-400 hover:text-blue-300 mr-3"
                          title="Manage dialogues"
                        >
                          <MessageSquare size={16} className="inline mr-1" />
                          Dialogues
                        </button>
                        <button
                          onClick={() => handleDeleteSubquest(subquest._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add New Subquest</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter subquest title"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
                >
                  Add Subquest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubquest;
