import React, { useState } from "react";

interface Game {
  id: number;
  title: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "draft";
  lastUpdated: string;
}

const sampleGames: Game[] = [
  {
    id: 1,
    title: "Code Runner",
    type: "Platform",
    difficulty: "easy",
    status: "active",
    lastUpdated: "2023-06-12",
  },
  {
    id: 2,
    title: "Algorithm Adventure",
    type: "Puzzle",
    difficulty: "hard",
    status: "active",
    lastUpdated: "2023-05-28",
  },
  {
    id: 3,
    title: "Debug Detective",
    type: "Mystery",
    difficulty: "medium",
    status: "draft",
    lastUpdated: "2023-07-03",
  },
  {
    id: 4,
    title: "Function Fighter",
    type: "Action",
    difficulty: "medium",
    status: "active",
    lastUpdated: "2023-04-18",
  },
  {
    id: 5,
    title: "Variable Valley",
    type: "Adventure",
    difficulty: "easy",
    status: "active",
    lastUpdated: "2023-07-15",
  },
];

const AdminContent: React.FC = () => {
  const [games] = useState<Game[]>(sampleGames);
  const [activeTab, setActiveTab] = useState("games");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
          Add New Game
        </button>
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
            onClick={() => setActiveTab("levels")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "levels"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Levels
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "assets"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Assets
          </button>
        </nav>
      </div>

      {/* Games Content */}
      {activeTab === "games" && (
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
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
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Difficulty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Status
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
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {game.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {game.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        game.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : game.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {game.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        game.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {game.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {game.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-400 hover:text-indigo-300 mr-3">
                      Edit
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Levels Content - Placeholder */}
      {activeTab === "levels" && (
        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
          <p className="text-gray-300">
            Levels management content will be displayed here
          </p>
        </div>
      )}

      {/* Assets Content - Placeholder */}
      {activeTab === "assets" && (
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
