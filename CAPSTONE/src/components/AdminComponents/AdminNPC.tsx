import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface NPC {
  name: string;
  type: string;
  img: string;
  scale: number;
  frameSize: {
    width: number;
    height: number;
  };
  animation: {
    idle: {
      startFrame: number;
      endFrame: number;
      frameRate: number;
      repeat: number;
    };
  };
  initialFrame: number;
}

type NPCList = Record<string, NPC>;

const AdminNPC: React.FC = () => {
  const [npcs, setNpcs] = useState<NPCList>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Load NPC data
    const fetchNPCs = async () => {
      try {
        setLoading(true);
        // Try to fetch directly from the game data folder
        const response = await axios.get(
          "/src/components/PlayerComponent/game-data/npc_detail.json"
        );
        setNpcs(response.data);
      } catch (err) {
        console.error("Error loading NPC data:", err);
        setError("Failed to load NPC data. Please try again later.");
        toast.error("Failed to load NPC data");
      } finally {
        setLoading(false);
      }
    };

    fetchNPCs();
  }, []);

  const handleNPCClick = (npcKey: string) => {
    setSelectedNPC(npcKey);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedNPC(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NPC Management</h1>
        {/* No "Add New NPC" button */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-400">Loading NPCs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Object.entries(npcs).map(([npcKey, npc]) => (
            <div
              key={npcKey}
              className="bg-slate-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              onClick={() => handleNPCClick(npcKey)}
            >
              <div className="p-4 h-48 flex items-center justify-center bg-slate-700">
                <img
                  src={`/src/assets/${npc.img}`}
                  alt={npc.name}
                  className="max-h-40 max-w-full object-contain"
                  onError={(e) => {
                    // Set a placeholder when image fails to load
                    (e.target as HTMLImageElement).src =
                      "/src/assets/placeholder.png";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white">{npc.name}</h3>
                <p className="text-sm text-gray-400 mt-1">ID: {npcKey}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improved NPC Details Modal */}
      {showDetailsModal && selectedNPC && npcs[selectedNPC] && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full">
            {/* Modal Header with gradient background */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">
                {npcs[selectedNPC].name}
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white hover:bg-slate-700 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col md:flex-row">
              {/* NPC Image */}
              <div className="md:w-2/5 bg-slate-900 p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                  <img
                    src={`/src/assets/${npcs[selectedNPC].img}`}
                    alt={npcs[selectedNPC].name}
                    className="relative z-10 max-h-64 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/src/assets/placeholder.png";
                    }}
                  />
                </div>
              </div>

              {/* NPC Details */}
              <div className="md:w-3/5 p-8">
                <h3 className="text-xl font-medium text-orange-500 mb-6">
                  NPC Details
                </h3>

                <div className="space-y-4 text-gray-200">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">
                      Character ID
                    </span>
                    <span className="text-white bg-slate-700 px-3 py-1 rounded-full text-sm">
                      {selectedNPC}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">Type</span>
                    <span className="text-white">{npcs[selectedNPC].type}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">Scale</span>
                    <span className="text-white">
                      {npcs[selectedNPC].scale}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">
                      Frame Size
                    </span>
                    <span className="text-white">
                      {npcs[selectedNPC].frameSize.width} ×{" "}
                      {npcs[selectedNPC].frameSize.height}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">
                      Animation Frames
                    </span>
                    <span className="text-white">
                      {npcs[selectedNPC].animation.idle.startFrame} -{" "}
                      {npcs[selectedNPC].animation.idle.endFrame}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">
                      Frame Rate
                    </span>
                    <span className="text-white">
                      {npcs[selectedNPC].animation.idle.frameRate} fps
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">Repeat</span>
                    <span className="text-white">
                      {npcs[selectedNPC].animation.idle.repeat === -1
                        ? "Infinite"
                        : npcs[selectedNPC].animation.idle.repeat}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400 font-medium">
                      Initial Frame
                    </span>
                    <span className="text-white">
                      {npcs[selectedNPC].initialFrame}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3">
                    <span className="text-gray-400 font-medium">
                      Image File
                    </span>
                    <span className="text-white bg-slate-700 px-3 py-1 rounded text-sm truncate max-w-[180px]">
                      {npcs[selectedNPC].img}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 flex justify-end"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNPC;
