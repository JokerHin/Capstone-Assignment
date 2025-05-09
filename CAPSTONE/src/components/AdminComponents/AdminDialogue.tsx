import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { ArrowLeft, Plus, Pencil, Trash, Check, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

// Update the interface to match your database model
interface Dialogue {
  _id: string;
  dialogue_id: string;
  text: string;
  position_id?: string;
  package_id?: string;
  action_id?: string;
}

interface Choice {
  _id: string;
  choice_id: number | string;
  dialogue_id: string;
  text: string;
  package_id?: string;
  alt_text?: number | string;
}

interface Quest {
  _id: string;
  quest_id: number;
  title: string;
}

interface Subquest {
  _id: string;
  subquest_id: number;
  quest_id: number;
  title: string;
}

const AdminDialogue: React.FC = () => {
  const { questId, subquestId } = useParams<{
    questId: string;
    subquestId: string;
  }>();
  const navigate = useNavigate();
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [subquest, setSubquest] = useState<Subquest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  // Update formData to match the dialogue model
  const [formData, setFormData] = useState({
    text: "",
    position_id: "",
    package_id: "",
    action_id: "",
  });
  const [editingDialogueId, setEditingDialogueId] = useState<string | null>(
    null
  );
  const [editedText, setEditedText] = useState("");

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl } = appContext;

  // Fetch dialogues, choices, quest, and subquest data
  useEffect(() => {
    const fetchData = async () => {
      if (!questId || !subquestId) return;

      setLoading(true);
      try {
        // Fetch all data in parallel
        const [
          dialoguesResponse,
          choicesResponse,
          questsResponse,
          subquestsResponse,
        ] = await Promise.all([
          axios.get(`${backendUrl}/dialogue`),
          axios.get(`${backendUrl}/choice`),
          axios.get(`${backendUrl}/quest`),
          axios.get(`${backendUrl}/subquest`),
        ]);

        // Find the specific quest
        const questData = questsResponse.data.find(
          (q: any) => q.quest_id === Number(questId)
        );
        if (questData) {
          setQuest(questData);
        }

        // Find the specific subquest
        const subquestData = subquestsResponse.data.find(
          (sq: any) => sq.subquest_id === Number(subquestId)
        );
        if (subquestData) {
          setSubquest(subquestData);
        }

        // Get all dialogues for now - we'll filter client-side since the model doesn't have subquest_id
        setDialogues(dialoguesResponse.data);

        // Get all choices (will filter by dialogue_id when rendering)
        setChoices(choicesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dialogue data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [questId, subquestId, backendUrl]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open add modal
  const handleAddDialogue = () => {
    setCurrentDialogue(null);
    setFormData({
      text: "",
      position_id: "",
      package_id: "",
      action_id: "",
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const handleEditDialogue = (dialogue: Dialogue) => {
    setCurrentDialogue(dialogue);
    setFormData({
      text: dialogue.text,
      position_id: dialogue.position_id || "",
      package_id: dialogue.package_id || "",
      action_id: dialogue.action_id || "",
    });
    setShowEditModal(true);
  };

  // New function to handle inline dialogue text edit
  const handleEditDialogueText = (dialogue: Dialogue) => {
    setEditingDialogueId(dialogue._id);
    setEditedText(dialogue.text);
  };

  // New function to save edited dialogue text
  const handleSaveDialogueText = async (dialogueId: string) => {
    if (!editedText.trim()) {
      toast.error("Text cannot be empty");
      return;
    }

    try {
      const response = await axios.put(`${backendUrl}/dialogue/${dialogueId}`, {
        text: editedText,
      });

      if (response.data) {
        setDialogues(
          dialogues.map((d) =>
            d._id === dialogueId ? { ...d, text: editedText } : d
          )
        );
        toast.success("Dialogue text updated successfully");
      }
    } catch (error) {
      console.error("Error updating dialogue text:", error);
      toast.error("Failed to update dialogue text");
    } finally {
      setEditingDialogueId(null);
    }
  };

  // Delete dialogue
  const handleDeleteDialogue = async (dialogueId: string) => {
    if (!window.confirm("Are you sure you want to delete this dialogue?")) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/dialogue/${dialogueId}`);
      toast.success("Dialogue deleted successfully");

      // Also delete related choices
      const dialogueChoices = choices.filter(
        (c) => c.dialogue_id === dialogueId
      );
      for (const choice of dialogueChoices) {
        await axios.delete(`${backendUrl}/choice/${choice._id}`);
      }

      // Update local state
      setDialogues(dialogues.filter((d) => d._id !== dialogueId));
      setChoices(choices.filter((c) => c.dialogue_id !== dialogueId));
    } catch (error) {
      console.error("Error deleting dialogue:", error);
      toast.error("Failed to delete dialogue");
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      toast.error("Text is required");
      return;
    }

    try {
      if (showAddModal) {
        // Get the next dialogue_id as a string
        const maxDialogueId = Math.max(
          ...dialogues.map((d) => parseInt(d.dialogue_id) || 0)
        );
        const nextDialogueId = String(maxDialogueId + 1);

        // Create new dialogue
        const newDialogue = {
          text: formData.text,
          dialogue_id: nextDialogueId,
          position_id: formData.position_id || null,
          package_id: formData.package_id || null,
          action_id: formData.action_id || null,
        };

        const response = await axios.post(
          `${backendUrl}/dialogue`,
          newDialogue
        );

        if (response.data) {
          toast.success("Dialogue added successfully");
          setDialogues([...dialogues, response.data]);
          setShowAddModal(false);
        }
      } else if (showEditModal && currentDialogue) {
        const updatedDialogue = {
          text: formData.text,
          dialogue_id: currentDialogue.dialogue_id,
          position_id: formData.position_id || undefined,
          package_id: formData.package_id || undefined,
          action_id: formData.action_id || undefined,
        };

        const response = await axios.put(
          `${backendUrl}/dialogue/${currentDialogue._id}`,
          updatedDialogue
        );

        if (response.data) {
          toast.success("Dialogue updated successfully");

          // Update local state
          setDialogues(
            dialogues.map((d) =>
              d._id === currentDialogue._id ? { ...d, ...updatedDialogue } : d
            )
          );

          setShowEditModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving dialogue:", error);
      toast.error("Failed to save dialogue");
    }
  };

  // Navigate back
  const handleBack = () => {
    navigate(`/admin/subquests/${questId}`);
  };

  // Render section
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      <AdminSidebar activeTab="content" />

      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="space-y-6">
          {/* Header */}
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
                  ? "Loading..."
                  : subquest
                  ? `Dialogues for ${subquest.title}`
                  : "Subquest Not Found"}
              </h1>
            </div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
              onClick={handleAddDialogue}
            >
              <div className="flex items-center">
                <Plus size={16} className="mr-2" />
                Add Dialogue
              </div>
            </button>
          </div>

          {/* Quest and Subquest Info */}
          {!loading && quest && subquest && (
            <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-400">
                    Quest: {quest.title} (ID: {quest.quest_id})
                  </span>
                  <h2 className="text-lg font-semibold text-white mt-1">
                    {subquest.title} (Subquest ID: {subquest.subquest_id})
                  </h2>
                </div>
              </div>
            </div>
          )}

          {/* Dialogues */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-6 text-center bg-slate-800 rounded-lg">
                <p className="text-gray-400">Loading dialogues...</p>
              </div>
            ) : dialogues.length === 0 ? (
              <div className="p-10 text-center bg-slate-800 rounded-lg">
                <p className="text-gray-400 mb-5">
                  No dialogues found for this subquest.
                </p>
                <button
                  onClick={handleAddDialogue}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Dialogue
                </button>
              </div>
            ) : (
              dialogues.map((dialogue) => (
                <div
                  key={dialogue._id}
                  className="bg-slate-800 rounded-lg p-5 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-400 mr-2">
                        ID: {dialogue.dialogue_id}
                      </span>
                      {dialogue.position_id && (
                        <span className="text-xs bg-purple-900 px-2 py-1 rounded text-purple-300">
                          Position: {dialogue.position_id}
                        </span>
                      )}
                      {dialogue.package_id && (
                        <span className="text-xs bg-green-900 px-2 py-1 rounded text-green-300">
                          Package: {dialogue.package_id}
                        </span>
                      )}
                      {dialogue.action_id && (
                        <span className="text-xs bg-blue-900 px-2 py-1 rounded text-blue-300">
                          Action: {dialogue.action_id}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDialogue(dialogue)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDialogue(dialogue._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Dialogue Text - Editable Inline */}
                  {editingDialogueId === dialogue._id ? (
                    <div className="flex items-start space-x-2">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 w-full"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleSaveDialogueText(dialogue._id)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingDialogueId(null)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="group relative p-3 bg-slate-700 rounded-lg mb-3 cursor-pointer"
                      onClick={() => handleEditDialogueText(dialogue)}
                    >
                      <p className="text-white">{dialogue.text}</p>
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil size={14} className="text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Choices (if any) */}
                  {choices
                    .filter((c) => c.dialogue_id === dialogue.dialogue_id)
                    .map((choice) => (
                      <div
                        key={choice._id}
                        className="ml-6 p-3 bg-slate-700 bg-opacity-50 rounded-lg mt-2 border-l-2 border-blue-500"
                      >
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-300">
                            Option: {choice.text}
                          </p>
                          <span className="text-xs text-gray-400">
                            ID: {choice.choice_id}
                          </span>
                        </div>
                        {choice.package_id && (
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded mt-1 inline-block">
                            Package ID: {choice.package_id}
                          </span>
                        )}
                        {choice.alt_text && (
                          <span className="text-xs bg-orange-900 text-orange-300 px-2 py-1 rounded mt-1 ml-1 inline-block">
                            Alt Text ID: {choice.alt_text}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add New Dialogue</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Text
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter dialogue text"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    Position ID
                  </label>
                  <input
                    type="text"
                    name="position_id"
                    value={formData.position_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    Package ID
                  </label>
                  <input
                    type="text"
                    name="package_id"
                    value={formData.package_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    Action ID
                  </label>
                  <input
                    type="text"
                    name="action_id"
                    value={formData.action_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
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
                  Add Dialogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Dialogue</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Text
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter dialogue text"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    Position ID
                  </label>
                  <input
                    type="text"
                    name="position_id"
                    value={formData.position_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    Package ID
                  </label>
                  <input
                    type="text"
                    name="package_id"
                    value={formData.package_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">
                    Action ID
                  </label>
                  <input
                    type="text"
                    name="action_id"
                    value={formData.action_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
                >
                  Update Dialogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDialogue;
