import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
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

interface Position {
  _id: string;
  position_id: string;
  location_id?: string;
  subquest_id: string;
  npc?: string;
  coordinates?: any;
}

interface Quest {
  _id: string;
  quest_id: number;
  title: string;
}

interface Subquest {
  _id: string;
  subquest_id: number;
  quest_id: number | string;
  title: string;
}

const AdminDialogue: React.FC = () => {
  const { questId, subquestId } = useParams<{
    questId: string;
    subquestId: string;
  }>();
  const navigate = useNavigate();
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [filteredDialogues, setFilteredDialogues] = useState<Dialogue[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [subquest, setSubquest] = useState<Subquest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
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

  // Add states for choice editing
  const [editingChoiceId, setEditingChoiceId] = useState<string | null>(null);
  const [editedChoiceText, setEditedChoiceText] = useState("");
  const [editedChoicePackageId, setEditedChoicePackageId] = useState("");
  const [editedChoiceAltText, setEditedChoiceAltText] = useState("");

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl } = appContext;

  // Add this function to generate consistent colors for NPCs
  const getNpcColor = (npcName: string) => {
    // Create a simple hash from the npc name
    const hash = npcName.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Enhanced color palette with orange tones and more vibrant colors
    const colors = [
      { bg: "bg-blue-600", text: "text-blue-100" },
      { bg: "bg-emerald-600", text: "text-emerald-100" },
      { bg: "bg-purple-600", text: "text-purple-100" },
      { bg: "bg-orange-600", text: "text-orange-100" },
      { bg: "bg-amber-600", text: "text-amber-100" },
      { bg: "bg-pink-600", text: "text-pink-100" },
      { bg: "bg-indigo-600", text: "text-indigo-100" },
      { bg: "bg-cyan-600", text: "text-cyan-100" },
      { bg: "bg-yellow-600", text: "text-yellow-100" },
      { bg: "bg-lime-600", text: "text-lime-100" },
      { bg: "bg-rose-600", text: "text-rose-100" },
      { bg: "bg-fuchsia-600", text: "text-fuchsia-100" },
    ];

    // Use the hash to pick a color from the predefined list
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Create a function to find NPC name for a position
  const getNpcNameForPosition = (positionId: string | undefined) => {
    if (!positionId) return null;

    const position = positions.find((p) => p.position_id === positionId);
    return position?.npc || null;
  };

  // Fetch dialogues, positions, choices, quest, and subquest data
  useEffect(() => {
    const fetchData = async () => {
      if (!questId || !subquestId) return;

      setLoading(true);
      try {
        // Fetch all data in parallel
        const [
          dialoguesResponse,
          choicesResponse,
          positionsResponse,
          subquestsResponse,
        ] = await Promise.all([
          axios.get(`${backendUrl}/dialogue`),
          axios.get(`${backendUrl}/choice`),
          axios.get(`${backendUrl}/position/subquest/${subquestId}`), // Get positions for this subquest
          axios.get(`${backendUrl}/subquest`),
        ]);

        // Set all positions for this subquest
        setPositions(positionsResponse.data);

        // Find the specific subquest
        const subquestData = subquestsResponse.data.find(
          (sq: any) =>
            String(sq.subquest_id) === String(subquestId) ||
            Number(sq.subquest_id) === Number(subquestId)
        );

        if (subquestData) {
          setSubquest(subquestData);

          // Find the related quest
          if (subquestData.quest_id) {
            setQuest({
              _id: `quest_${subquestData.quest_id}`,
              quest_id: Number(subquestData.quest_id),
              title: `Quest ${subquestData.quest_id}`,
            });
          }
        }

        // Get all dialogues
        const allDialogues = dialoguesResponse.data;
        setDialogues(allDialogues);

        const positionIds = positionsResponse.data.map(
          (p: Position) => p.position_id
        );
        const filteredDialogues = allDialogues.filter(
          (dialogue: Dialogue) =>
            dialogue.position_id && positionIds.includes(dialogue.position_id)
        );
        setFilteredDialogues(filteredDialogues);

        // Get all choices
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleEditDialogueText = (dialogue: Dialogue) => {
    setEditingDialogueId(dialogue._id);
    setEditedText(dialogue.text);
  };

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
        const updatedDialogues = dialogues.map((d) =>
          d._id === dialogueId ? { ...d, text: editedText } : d
        );
        setDialogues(updatedDialogues);

        const updatedFilteredDialogues = filteredDialogues.map((d) =>
          d._id === dialogueId ? { ...d, text: editedText } : d
        );
        setFilteredDialogues(updatedFilteredDialogues);

        toast.success("Dialogue text updated successfully");
      }
    } catch (error) {
      console.error("Error updating dialogue text:", error);
      toast.error("Failed to update dialogue text");
    } finally {
      setEditingDialogueId(null);
    }
  };

  // Add function to handle editing choices
  const handleEditChoice = (choice: Choice) => {
    setEditingChoiceId(choice._id);
    setEditedChoiceText(choice.text);
    setEditedChoicePackageId(choice.package_id || "");
    setEditedChoiceAltText(choice.alt_text ? String(choice.alt_text) : "");
  };

  // Add function to save edited choice
  const handleSaveChoice = async (choiceId: string) => {
    if (!editedChoiceText.trim()) {
      toast.error("Choice text cannot be empty");
      return;
    }

    try {
      const updatedChoice = {
        text: editedChoiceText,
        package_id: editedChoicePackageId || undefined,
        alt_text: editedChoiceAltText || undefined,
      };

      const response = await axios.put(
        `${backendUrl}/choice/${choiceId}`,
        updatedChoice
      );

      if (response.data) {
        // Update local state with the edited choice
        const updatedChoices = choices.map((c) =>
          c._id === choiceId
            ? {
                ...c,
                text: editedChoiceText,
                package_id: editedChoicePackageId || c.package_id,
                alt_text: editedChoiceAltText || c.alt_text,
              }
            : c
        );
        setChoices(updatedChoices);

        toast.success("Choice updated successfully");
      }
    } catch (error) {
      console.error("Error updating choice:", error);
      toast.error("Failed to update choice");
    } finally {
      setEditingChoiceId(null);
    }
  };

  // Add function to cancel choice editing
  const handleCancelChoiceEdit = () => {
    setEditingChoiceId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      toast.error("Text is required");
      return;
    }

    try {
      if (showEditModal && currentDialogue) {
        const updatedDialogue = {
          text: formData.text,
          package_id: formData.package_id || undefined,
          action_id: formData.action_id || undefined,
        };

        const response = await axios.put(
          `${backendUrl}/dialogue/${currentDialogue._id}`,
          updatedDialogue
        );

        if (response.data) {
          toast.success("Dialogue updated successfully");

          // Update both arrays of dialogues with all edited fields
          const updatedDialogues = dialogues.map((d) =>
            d._id === currentDialogue._id
              ? {
                  ...d,
                  text: formData.text,
                  package_id: formData.package_id || d.package_id,
                  action_id: formData.action_id || d.action_id,
                }
              : d
          );
          setDialogues(updatedDialogues);

          const updatedFilteredDialogues = filteredDialogues.map((d) =>
            d._id === currentDialogue._id
              ? {
                  ...d,
                  text: formData.text,
                  package_id: formData.package_id || d.package_id,
                  action_id: formData.action_id || d.action_id,
                }
              : d
          );
          setFilteredDialogues(updatedFilteredDialogues);

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

          {/* Positions Info */}
          {!loading && positions.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-5 shadow-lg">
              <h3 className="text-md font-semibold text-white mb-2">
                NPCs in this Subquest:
              </h3>
              <div className="flex flex-wrap gap-2">
                {positions
                  .filter((position) => position.npc) // Only show positions with NPCs
                  .map((position) => {
                    const { bg, text } = getNpcColor(position.npc || "Unknown");
                    return (
                      <span
                        key={position._id}
                        className={`text-xs ${bg} ${text} px-2 py-1 rounded`}
                      >
                        {position.npc} (Position: {position.position_id})
                      </span>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Dialogues */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-6 text-center bg-slate-800 rounded-lg">
                <p className="text-gray-400">Loading dialogues...</p>
              </div>
            ) : filteredDialogues.length === 0 ? (
              <div className="p-10 text-center bg-slate-800 rounded-lg">
                <p className="text-gray-400 mb-5">
                  No dialogues found for this subquest.
                </p>
                <p className="text-sm text-gray-500">
                  Dialogues are linked to positions. This subquest may not have
                  any associated dialogues.
                </p>
              </div>
            ) : (
              filteredDialogues.map((dialogue) => {
                const npcName = getNpcNameForPosition(dialogue.position_id);
                const { bg, text } = npcName
                  ? getNpcColor(npcName)
                  : { bg: "bg-gray-700", text: "text-gray-300" };

                // Get choices for this dialogue
                const dialogueChoices = choices.filter(
                  (c) => c.dialogue_id === dialogue.dialogue_id
                );

                return (
                  <div
                    key={dialogue._id}
                    className="rounded-lg p-5 shadow-lg bg-slate-800" // Keep consistent background
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-400 mr-2">
                          ID: {dialogue.dialogue_id}
                        </span>
                        {dialogue.position_id && (
                          <span
                            className={`text-xs ${bg} ${text} px-2 py-1 rounded`}
                          >
                            {npcName
                              ? `${npcName} (Position: ${dialogue.position_id})`
                              : `Position: ${dialogue.position_id}`}
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
                    {dialogueChoices.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-300 mb-2">
                          Player Choices:
                        </h4>
                        <div className="space-y-3">
                          {dialogueChoices.map((choice) => (
                            <div
                              key={choice._id}
                              className="ml-6 p-3 bg-slate-700 bg-opacity-50 rounded-lg border-l-2 border-blue-500"
                            >
                              {editingChoiceId === choice._id ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Choice Text
                                    </label>
                                    <textarea
                                      value={editedChoiceText}
                                      onChange={(e) =>
                                        setEditedChoiceText(e.target.value)
                                      }
                                      className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 text-sm"
                                      rows={2}
                                      placeholder="Enter choice text"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">
                                        Package ID (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={editedChoicePackageId}
                                        onChange={(e) =>
                                          setEditedChoicePackageId(
                                            e.target.value
                                          )
                                        }
                                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 text-sm"
                                        placeholder="Package ID"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">
                                        Alt Text ID (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={editedChoiceAltText}
                                        onChange={(e) =>
                                          setEditedChoiceAltText(e.target.value)
                                        }
                                        className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 text-sm"
                                        placeholder="Alt Text ID"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                      onClick={() => handleCancelChoiceEdit()}
                                      className="px-3 py-1 bg-gray-600 text-gray-200 text-xs rounded hover:bg-gray-500"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSaveChoice(choice._id)
                                      }
                                      className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-500"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="group">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-300 break-words">
                                        {choice.text}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-xs text-gray-400">
                                          ID: {choice.choice_id}
                                        </span>
                                        {choice.package_id && (
                                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                                            Package: {choice.package_id}
                                          </span>
                                        )}
                                        {choice.alt_text && (
                                          <span className="text-xs bg-orange-900 text-orange-300 px-2 py-1 rounded">
                                            Alt Text: {choice.alt_text}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleEditChoice(choice)}
                                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300"
                                      title="Edit choice"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

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
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                    disabled // Keep position_id disabled as it connects to the subquest
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
