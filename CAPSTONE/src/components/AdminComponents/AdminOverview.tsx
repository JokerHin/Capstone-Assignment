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

// User type for leaderboard
interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  rank: number;
}

const AdminOverview: React.FC = () => {
  const [monthlyUserData, setMonthlyUserData] = useState<
    Array<{ name: string; users: number }>
  >([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const badgeContainerRef = useRef<HTMLDivElement>(null);

  // Add new state for leaderboard users
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
    []
  );
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Set active realms to constant 6 (matching quest.json)
  const activeRealms = 6;
  const [totalSubquests, setTotalSubquests] = useState(0);
  const [subquestsLoading, setSubquestsLoading] = useState(true);

  // Remove admin credential state and forms
  const [useDefaultData, setUseDefaultData] = useState(false);

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl, userData: contextUserData, isLoggedin } = appContext;

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

  // Fetch user data - simplified to use already logged in state
  useEffect(() => {
    fetchUserData();
    fetchLeaderboardData();
  }, [backendUrl, isLoggedin]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      if (!isLoggedin || !contextUserData || useDefaultData) {
        console.log("Using demo data for admin overview");
        const demoData = getDefaultMonthlyData();
        setMonthlyUserData(demoData);
        setTotalUsers(125);
        return;
      }

      if (contextUserData.userType !== "admin") {
        console.log("User is not an admin, using demo data");
        const demoData = getDefaultMonthlyData();
        setMonthlyUserData(demoData);
        setTotalUsers(125);
        setUseDefaultData(true);
        return;
      }

      // Get auth token
      const token = localStorage.getItem("token");
      const headers: any = {};

      headers["admin-email"] = contextUserData.email;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const { data } = await axios.get(`${backendUrl}/api/admin/user-stats`, {
        withCredentials: true,
        headers: headers,
      });

      if (data.success) {
        const monthlyData = processMonthlyData(data.monthlyStats);
        setMonthlyUserData(monthlyData);
        setTotalUsers(data.totalUsers || 0);
      } else {
        setError("Failed to fetch user data");
        toast.error(data.message || "Error loading user data");
        setUseDefaultData(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data");
      setUseDefaultData(true);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch leaderboard data
  const fetchLeaderboardData = async () => {
    setLeaderboardLoading(true);
    try {
      // Use the regular users API
      const response = await axios.get(`${backendUrl}/api/admin/users`, {
        withCredentials: true,
        headers: {
          "admin-email": contextUserData?.email,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success && Array.isArray(response.data.users)) {
        const users = response.data.users || [];

        // Sort users by createdAt date (newest first)
        const sortedUsers = users
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // Newest first
          })
          .map((user: any, index: number) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt || new Date().toISOString(),
            rank: index + 1,
          }));

        setLeaderboardUsers(sortedUsers);
      } else {
        // If API call fails, use demo data
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Create demo leaderboard data with user-like names
      const demoLeaderboard: LeaderboardUser[] = [];
      const names = [
        "Alex Johnson",
        "Sarah Williams",
        "Michael Brown",
        "Emily Davis",
        "Daniel Wilson",
        "Olivia Martinez",
        "James Taylor",
        "Sophia Anderson",
        "Benjamin Thomas",
        "Isabella White",
        "Noah Garcia",
        "Emma Rodriguez",
      ];

      // Create users with dates counting back from today
      const today = new Date();

      for (let i = 0; i < names.length; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i); // Each user joined a day before

        demoLeaderboard.push({
          _id: `demo-${i + 1}`,
          name: names[i],
          email: `${names[i].toLowerCase().replace(" ", ".")}@example.com`,
          createdAt: date.toISOString(),
          rank: i + 1,
        });
      }

      setLeaderboardUsers(demoLeaderboard);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch subquest data but skip realm count (use static 6)
  useEffect(() => {
    const fetchSubquestData = async () => {
      try {
        setSubquestsLoading(true);

        // Fetch just subquests
        const subquestsResponse = await axios.get(`${backendUrl}/subquest`);

        if (subquestsResponse.data) {
          setTotalSubquests(subquestsResponse.data.length);
        }
      } catch (error) {
        console.error("Error fetching subquest data:", error);
        toast.error("Error loading game statistics");
      } finally {
        setSubquestsLoading(false);
      }
    };

    fetchSubquestData();
  }, [backendUrl]);

  // Fetch achievements - simplified
  useEffect(() => {
    fetchAchievements();
  }, [backendUrl, isLoggedin]);

  const fetchAchievements = async () => {
    try {
      setAchievementsLoading(true);

      // If not logged in or using default data, show demo achievements
      if (!isLoggedin || !contextUserData || useDefaultData) {
        const demoAchievements = [];
        for (let i = 1; i <= 6; i++) {
          demoAchievements.push({
            _id: `demo-${i}`,
            name: `Achievement ${i}`,
            description: `This is a demo achievement ${i}`,
            rarity: "common",
            points: 100 * i,
          });
        }
        setAchievements(demoAchievements);
        setTotalAchievements(demoAchievements.length);
        return;
      }

      // Use the regular item endpoint with type=badge filter instead of the achievement endpoint
      const response = await axios.get(`${backendUrl}/item?type=badge`);

      if (response.data && Array.isArray(response.data)) {
        setAchievements(response.data);
        setTotalAchievements(response.data.length);
      } else {
        console.error("Invalid achievement data format:", response.data);
        throw new Error("Invalid achievement data format");
      }
    } catch (error: any) {
      console.error("Error fetching achievements:", error);
      // Create demo achievement data as fallback
      const demoAchievements = [];
      for (let i = 1; i <= 6; i++) {
        demoAchievements.push({
          _id: `demo-${i}`,
          name: `Achievement ${i}`,
          description: `This is a demo achievement ${i}`,
          rarity: "common",
          points: 100 * i,
        });
      }
      setAchievements(demoAchievements);
      setTotalAchievements(demoAchievements.length);
      toast.info("Using demo achievement data");
    } finally {
      setAchievementsLoading(false);
    }
  };

  // Get badge image URL based on index
  const getBadgeImage = (index: number) => {
    const badgeNumber = (index % 6) + 1; // Cycle through badges 1-6
    return `/src/assets/badges/badge${badgeNumber}.png`;
  };

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

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Format date function for showing joined date nicely
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

      {/* Stats Cards - Updated with static realm count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Total Users</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {loading ? "Loading..." : totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-white/80 mt-1">
            {monthlyUserData.length > 0 &&
            monthlyUserData[new Date().getMonth()].users > 0
              ? `↑ ${monthlyUserData[new Date().getMonth()].users} this month`
              : "No new users this month"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Active Realms</h3>
          <p className="text-3xl font-bold text-white mt-2">{activeRealms}</p>
          <p className="text-sm text-white/80 mt-1">
            {`${activeRealms} realms available`}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">Total Subquests</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {subquestsLoading ? "Loading..." : totalSubquests}
          </p>
          <p className="text-sm text-white/80 mt-1">
            {subquestsLoading
              ? "Loading..."
              : `${Math.round(totalSubquests / activeRealms)} per realm avg`}
          </p>
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
                    data={monthlyUserData}
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
                {achievements.map((badge, index) => (
                  <div
                    key={badge._id}
                    className="flex flex-col items-center w-32 flex-shrink-0"
                  >
                    <div className="relative w-20 h-20 mb-2 group">
                      <img
                        src={getBadgeImage(index)}
                        alt={badge.name}
                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-200"
                      />
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

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Latest Users</h2>
          </div>

          <div className="overflow-hidden flex-grow relative">
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
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {leaderboardLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-400"
                      >
                        Loading leaderboard...
                      </td>
                    </tr>
                  ) : leaderboardUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    leaderboardUsers.map((user) => {
                      const initials = getUserInitials(user.name);
                      const isTopThree = user.rank <= 3;

                      return (
                        <tr
                          key={user._id}
                          className={`border-b border-slate-700 hover:bg-slate-700 ${
                            isTopThree ? "bg-slate-700/30" : ""
                          }`}
                        >
                          <td className="py-3 whitespace-nowrap">
                            <div
                              className={`
                                w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                                ${
                                  user.rank === 1
                                    ? "bg-yellow-500 text-yellow-900"
                                    : user.rank === 2
                                    ? "bg-gray-300 text-gray-800"
                                    : user.rank === 3
                                    ? "bg-amber-700 text-amber-100"
                                    : "bg-slate-600 text-slate-200"
                                }
                              `}
                            >
                              {user.rank}
                            </div>
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2 text-xs">
                                {initials}
                              </div>
                              <span className="font-medium text-white text-sm">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 whitespace-nowrap text-right font-semibold text-white text-sm">
                            {formatJoinedDate(user.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
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
