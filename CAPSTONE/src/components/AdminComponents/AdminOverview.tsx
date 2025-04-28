import React, { useState, useEffect, useContext, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { AppContent } from "../../context/AppContext";
import { toast } from "react-toastify";
import BadgeImg from "../../assets/badge.png";

// Sample data for the leaderboard
const leaderboardData = [
  { id: 1, rank: 1, name: "Alex Johnson", score: 9850, avatar: "AJ" },
  { id: 2, rank: 2, name: "Sarah Williams", score: 8740, avatar: "SW" },
  { id: 3, rank: 3, name: "Michael Brown", score: 7650, avatar: "MB" },
  { id: 4, rank: 4, name: "Emily Davis", score: 7200, avatar: "ED" },
  { id: 5, rank: 5, name: "Daniel Wilson", score: 6980, avatar: "DW" },
  { id: 6, rank: 6, name: "Olivia Martinez", score: 6540, avatar: "OM" },
  { id: 7, rank: 7, name: "James Taylor", score: 6120, avatar: "JT" },
  { id: 8, rank: 8, name: "Sophia Anderson", score: 5890, avatar: "SA" },
  { id: 9, rank: 9, name: "Benjamin Thomas", score: 5670, avatar: "BT" },
  { id: 10, rank: 10, name: "Isabella White", score: 5340, avatar: "IW" },
];

const AdminOverview: React.FC = () => {
  const [userData, setUserData] = useState<
    Array<{ name: string; users: number }>
  >([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const badgeContainerRef = useRef<HTMLDivElement>(null);

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl } = appContext;

  // Scroll the badges container horizontally
  const scrollBadges = (direction: "left" | "right") => {
    if (badgeContainerRef.current) {
      const scrollAmount = 250;
      badgeContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/admin/user-stats`);

        if (data.success) {
          // Process monthly data
          const monthlyData = processMonthlyData(data.monthlyStats);
          setUserData(monthlyData);
          setTotalUsers(data.totalUsers || 0);
        } else {
          setError("Failed to fetch user data");
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
        toast.error("Error loading user statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [backendUrl]);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setAchievementsLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/admin/achievements`
        );

        if (data.success) {
          setAchievements(data.achievements);
          setTotalAchievements(data.achievements.length);
        } else {
          toast.error(data.message || "Failed to fetch achievements");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Error loading achievements"
        );
      } finally {
        setAchievementsLoading(false);
      }
    };

    fetchAchievements();
  }, [backendUrl]);

  // Process the monthly data from the API response
  const processMonthlyData = (monthlyStats: any) => {
    if (!monthlyStats) return getDefaultMonthlyData();

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((month, index) => {
      const monthData = monthlyStats.find(
        (stat: any) =>
          new Date(stat._id).getMonth() === index &&
          new Date(stat._id).getFullYear() === currentYear
      );

      return {
        name: month,
        users: monthData ? monthData.count : 0,
      };
    });

    return monthlyData;
  };

  // Fallback data if API fails
  const getDefaultMonthlyData = () => {
    return [
      { name: "Jan", users: 0 },
      { name: "Feb", users: 0 },
      { name: "Mar", users: 0 },
      { name: "Apr", users: 0 },
      { name: "May", users: 0 },
      { name: "Jun", users: 0 },
      { name: "Jul", users: 0 },
      { name: "Aug", users: 0 },
      { name: "Sep", users: 0 },
      { name: "Oct", users: 0 },
      { name: "Nov", users: 0 },
      { name: "Dec", users: 0 },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 sm:mb-0">
          Dashboard Overview
        </h1>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards - More responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Total Users</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {loading ? "Loading..." : totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-white/80 mt-1">
            {userData.length > 0 && userData[new Date().getMonth()].users > 0
              ? `↑ ${userData[new Date().getMonth()].users} this month`
              : "No new users this month"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Active Games</h3>
          <p className="text-3xl font-bold text-white mt-2">8</p>
          <p className="text-sm text-white/80 mt-1">↑ 2 new games added</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Game Sessions</h3>
          <p className="text-3xl font-bold text-white mt-2">3,856</p>
          <p className="text-sm text-white/80 mt-1">↑ 8% from last week</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {achievementsLoading ? "Loading..." : totalAchievements}
          </p>
          <p className="text-sm text-white/80 mt-1">
            {achievementsLoading
              ? "Loading..."
              : `${totalAchievements} total achievements`}
          </p>
        </div>
      </div>

      {/* Grid Layout for charts - More responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              User Registrations by Month
            </h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">Loading data...</p>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#333",
                        borderColor: "#555",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="users"
                      name="Users"
                      fill="#ff8800"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Achievements with Badges */}
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Achievement Badges</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => scrollBadges("left")}
                  className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600"
                >
                  &#8592;
                </button>
                <button
                  onClick={() => scrollBadges("right")}
                  className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600"
                >
                  &#8594;
                </button>
              </div>
            </div>

            {achievementsLoading ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-gray-400">Loading achievements...</p>
              </div>
            ) : achievements.length === 0 ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-gray-400">No achievements found</p>
              </div>
            ) : (
              <div
                ref={badgeContainerRef}
                className="flex space-x-6 overflow-x-auto py-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {achievements.map((badge) => (
                  <div
                    key={badge._id}
                    className="flex flex-col items-center w-24 flex-shrink-0"
                  >
                    <div className="relative w-16 h-16 mb-2 group">
                      <img
                        src={BadgeImg}
                        alt={badge.name}
                        className={`w-full h-full object-contain hover:scale-110 transition-transform duration-200 
                          ${
                            badge.rarity === "legendary"
                              ? "filter hue-rotate-60"
                              : badge.rarity === "epic"
                              ? "filter hue-rotate-270"
                              : badge.rarity === "rare"
                              ? "filter hue-rotate-180"
                              : badge.rarity === "uncommon"
                              ? "filter hue-rotate-90"
                              : ""
                          }`}
                      />
                      <div className="absolute top-0 right-0 bg-gray-800 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white">
                        {badge.points}
                      </div>
                    </div>
                    <span className="text-white text-xs text-center font-medium">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard - Extended Height */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
          </div>

          <div className="overflow-hidden flex-grow">
            <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-slate-800 z-10">
                  <tr className="border-b border-slate-700">
                    <th className="py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((player) => (
                    <tr
                      key={player.id}
                      className={`border-b border-slate-700 hover:bg-slate-700 ${
                        player.rank <= 3 ? "bg-slate-700/30" : ""
                      }`}
                    >
                      <td className="py-3 whitespace-nowrap">
                        <div
                          className={`
                          w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                          ${
                            player.rank === 1
                              ? "bg-yellow-500 text-yellow-900"
                              : player.rank === 2
                              ? "bg-gray-300 text-gray-800"
                              : player.rank === 3
                              ? "bg-amber-700 text-amber-100"
                              : "bg-slate-600 text-slate-200"
                          }
                        `}
                        >
                          {player.rank}
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2 text-xs">
                            {player.avatar}
                          </div>
                          <span className="font-medium text-white text-sm">
                            {player.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap text-right font-semibold text-white text-sm">
                        {player.score.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
