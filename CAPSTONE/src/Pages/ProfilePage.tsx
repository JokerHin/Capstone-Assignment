import { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { ArrowLeft } from "lucide-react";
import "../Pages/Animation.css";
import questData from "../../public/PlayerComponent/game-data/quest.json";

interface PlayerProgress {
  _id: string;
  player_id: string;
  subquest_id: string;
  status: string;
}

interface GameProgress {
  currentRealm: string;
  totalPoints: number;
  progress: number;
  nextRealm: string;
  highestQuestId: number;
  currentSubquestId: string;
  currentSubquestTitle?: string;
  nextSubquestId?: string;
  nextSubquestTitle?: string;
  completedQuestIds?: number[];
}

// Update the Badge interface to match our item model
interface Badge {
  id: number;
  name: string;
  image: string;
  requiredQuest: number;
  unlocked: boolean;
  item_id?: string;
  description?: string;
  _id?: string;
}

interface Item {
  _id: string;
  item_id: number;
  name: string;
  type: string;
  description?: string;
}

interface Subquest {
  _id: string;
  subquest_id: string;
  quest_id: string;
  title: string;
  description?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { userData, backendUrl, setUserData, isLoggedin } = appContext;

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedin) {
      navigate("/login");
      toast.error("Please login to view your profile");
    }
  }, [isLoggedin, navigate]);

  const [updatedName, setUpdatedName] = useState(userData?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [activeTab, setActiveTab] = useState("progress");

  // Add state for player progress data
  const [loading, setLoading] = useState(false);
  const [gameStats, setGameStats] = useState<GameProgress>({
    currentRealm: "Not started",
    totalPoints: 0,
    progress: 0,
    nextRealm: "Realm 1",
    highestQuestId: 0,
    currentSubquestId: "",
  });

  const [badgeItems, setBadgeItems] = useState<Item[]>([]);
  const [apiSubquests, setApiSubquests] = useState<Subquest[]>([]);

  // Fetch player progress data - Modified to properly handle dependencies and refetch on component mount
  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (isLoggedin && userData?.id) {
        // Only set loading at the beginning of the entire fetch process
        setLoading(true);
        try {
          // Fetch subquests first
          const subquestsResponse = await axios.get(`${backendUrl}/subquest`);
          const subquestsData = subquestsResponse.data;
          setApiSubquests(subquestsData);

          // Then fetch player progress with the subquests data
          const progressResponse = await axios.get(
            `${backendUrl}/player-progress`
          );

          // Filter progress for current player
          const userProgressData = progressResponse.data.filter(
            (progress: PlayerProgress) => progress.player_id === userData.id
          );

          // Calculate game progress with the freshly loaded data
          calculateGameProgress(userProgressData, subquestsData);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load progress data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndProcessData();

    // No other dependencies needed - will run when component mounts and when login/user state changes
  }, [isLoggedin, userData, backendUrl]);

  // Remove the separate fetchSubquests function since we're fetching both together

  // Update calculateGameProgress to accept the subquests data parameter
  const calculateGameProgress = (
    progressData: PlayerProgress[],
    subquestsData: Subquest[] = []
  ) => {
    console.log("Calculating game progress with:", {
      progressData: progressData.length,
      subquestsData: subquestsData.length || apiSubquests.length,
    });

    // Use passed subquests or fallback to state if available
    const subquests = subquestsData.length > 0 ? subquestsData : apiSubquests;

    if (!progressData.length || !subquests.length) {
      setGameStats({
        currentRealm: "Not started",
        totalPoints: 0,
        progress: 0,
        nextRealm: "Realm 1: The House of Blueprints",
        highestQuestId: 0,
        currentSubquestId: "",
        completedQuestIds: [],
      });
      return;
    }

    // Find current subquest and its realm
    let highestQuestId = 0;
    let completedSubquests = 0;
    let currentSubquestId = "";
    let currentSubquestTitle = "";
    let nextSubquestId = "";
    let nextSubquestTitle = "";
    let currentQuestId = 0;

    console.log("Progress data to process:", progressData);

    // Get the last progress entry - this is the player's current position
    const sortedProgress = [...progressData].sort(
      (a, b) => Number(a.subquest_id) - Number(b.subquest_id)
    );
    const currentProgress = sortedProgress[sortedProgress.length - 1];

    if (currentProgress) {
      currentSubquestId = currentProgress.subquest_id;

      // Find the current subquest to get its quest_id
      const currentSubquest = subquests.find(
        (sq) => String(sq.subquest_id) === String(currentSubquestId)
      );

      if (currentSubquest) {
        currentQuestId = Number(currentSubquest.quest_id);
        currentSubquestTitle = currentSubquest.title;

        // This is the key change: we consider all previous realms as completed
        highestQuestId = currentQuestId;

        console.log("Current Quest ID:", currentQuestId);
        console.log("Current Subquest ID:", currentSubquestId);
      }
    }

    // Create a quest-specific tracking structure for subquest totals
    const questSubquestCounts: Record<
      number,
      { total: number; completed: number }
    > = {};

    // Count total subquests per quest
    subquests.forEach((subquest) => {
      const questId = Number(subquest.quest_id);
      if (!questSubquestCounts[questId]) {
        questSubquestCounts[questId] = { total: 0, completed: 0 };
      }
      questSubquestCounts[questId].total++;
    });

    for (let questId = 1; questId < currentQuestId; questId++) {
      if (questSubquestCounts[questId]) {
        // Add all subquests from previous realms to completedSubquests
        completedSubquests += questSubquestCounts[questId].total;

        // Mark all previous quests as fully completed
        questSubquestCounts[questId].completed =
          questSubquestCounts[questId].total;
      }
    }

    // Specific tracking of completed quests
    const completedQuestIds: number[] = [];

    // Add all previous quests as completed
    for (let i = 1; i < currentQuestId; i++) {
      completedQuestIds.push(i);
    }

    console.log("Quest subquest counts:", questSubquestCounts);
    console.log("Quests fully completed:", completedQuestIds);
    console.log("Total completed subquests count:", completedSubquests);
    console.log("Total points calculated:", completedSubquests * 10);
    console.log("Current highest quest ID:", highestQuestId);

    // Find next subquest
    if (currentSubquestId) {
      const currentSubquest = subquests.find(
        (sq) => String(sq.subquest_id) === String(currentSubquestId)
      );

      if (currentSubquest) {
        // Get the quest this subquest belongs to
        const currentQuestId = currentSubquest.quest_id;

        // Find all subquests for this quest, sorted by ID
        const questSubquests = subquests
          .filter((sq) => String(sq.quest_id) === String(currentQuestId))
          .sort((a, b) => Number(a.subquest_id) - Number(b.subquest_id));

        // Find the current subquest index
        const currentIndex = questSubquests.findIndex(
          (sq) => String(sq.subquest_id) === String(currentSubquestId)
        );

        // If there's another subquest after the current one in the same quest
        if (currentIndex >= 0 && currentIndex < questSubquests.length - 1) {
          const nextSubquest = questSubquests[currentIndex + 1];
          nextSubquestId = String(nextSubquest.subquest_id);
          nextSubquestTitle = nextSubquest.title;
        }
        // If this is the last subquest in the current quest, get first subquest of next quest
        else if (currentIndex === questSubquests.length - 1) {
          const nextQuestId = Number(currentQuestId) + 1;

          // Find subquests for the next quest
          const nextQuestSubquests = subquests
            .filter((sq) => Number(sq.quest_id) === nextQuestId)
            .sort((a, b) => Number(a.subquest_id) - Number(b.subquest_id));

          if (nextQuestSubquests.length > 0) {
            const firstSubquest = nextQuestSubquests[0];
            nextSubquestId = String(firstSubquest.subquest_id);
            nextSubquestTitle = firstSubquest.title;
          }
        }
      }
    }

    // Calculate points (10 per completed subquest)
    const totalPoints = completedSubquests * 10;

    const completedRealms = highestQuestId - 1;
    const progressPercent = Math.min(
      Math.round((completedRealms / 6) * 100),
      100
    );

    // Get quest information for display
    const currentQuestData = questData.find(
      (q) => q.quest_id === highestQuestId
    );
    const currentRealmName = currentQuestData
      ? `Realm ${highestQuestId}: ${currentQuestData.title}`
      : "Not started";

    // Get next quest title
    const nextQuestData = questData.find(
      (q) => q.quest_id === highestQuestId + 1
    );
    const nextRealmName = nextQuestData
      ? `Realm ${highestQuestId + 1}: ${nextQuestData.title}`
      : "All realms completed!";

    console.log("Completed quests:", completedQuestIds);
    console.log("Total points:", totalPoints);
    console.log("Completed subquests:", completedSubquests);

    setGameStats({
      currentRealm: currentRealmName,
      totalPoints,
      progress: progressPercent,
      nextRealm: nextRealmName,
      highestQuestId,
      currentSubquestId,
      currentSubquestTitle,
      nextSubquestId,
      nextSubquestTitle,
      completedQuestIds,
    });
  };

  // Fetch badge items for badge names - updated to match AdminAchievements approach
  useEffect(() => {
    if (isLoggedin) {
      fetchBadgeItems();
    }
  }, [isLoggedin, backendUrl]);

  const fetchBadgeItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/item?type=badge`);
      setBadgeItems(response.data);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Define badge data with real names from badge items
  const badges: Badge[] = useMemo(() => {
    // Default badge configuration with clear, descriptive names
    const defaultBadges = [
      {
        id: 1,
        name: "Classes Badge",
        image: "./src/assets/badge.png",
        requiredQuest: 1,
        unlocked: false,
      },
      {
        id: 2,
        name: "Objects Badge",
        image: "./src/assets/badge.png",
        requiredQuest: 2,
        unlocked: false,
      },
      {
        id: 3,
        name: "Encapsulation Badge",
        image: "./src/assets/badge.png",
        requiredQuest: 3,
        unlocked: false,
      },
      {
        id: 4,
        name: "Inheritance Badge",
        image: "./src/assets/badge.png",
        requiredQuest: 4,
        unlocked: false,
      },
      {
        id: 5,
        name: "Polymorphism Badge",
        image: "./src/assets/badge.png",
        requiredQuest: 5,
        unlocked: false,
      },
      {
        id: 6,
        name: "Abstraction Badge",
        image: "./src/assets/badge.png",
        requiredQuest: 6,
        unlocked: false,
      },
    ];

    // If we have badge items from the API, use their names and descriptions
    if (badgeItems.length > 0) {
      return defaultBadges.map((badge) => {
        // Find corresponding badge item (matching item_id with badge id)
        const badgeItem = badgeItems.find(
          (item) => Number(item.item_id) === badge.id
        );

        // A badge is unlocked only if the player has COMPLETED the realm
        // That means the badge's requiredQuest must be LESS THAN the player's current quest
        const unlocked = badge.requiredQuest < gameStats.highestQuestId;

        console.log(
          `Badge ${badge.id} (${badge.name}): Required Quest = ${badge.requiredQuest}, Player Quest = ${gameStats.highestQuestId}, Unlocked = ${unlocked}`
        );

        return {
          ...badge,
          name: badgeItem?.name || badge.name,
          description: badgeItem?.description,
          _id: badgeItem?._id,
          unlocked,
        };
      });
    }

    // If no badge items yet, use defaults with same unlocking logic
    return defaultBadges.map((badge) => ({
      ...badge,
      unlocked: badge.requiredQuest < gameStats.highestQuestId,
    }));
  }, [badgeItems, gameStats.highestQuestId]);

  // Get badge image based on index - update to use public directory
  const getBadgeImage = (index: number) => {
    const badgeNumber = (index % 6) + 1;
    return `/assets/badges/badge${badgeNumber}.png`;
  };

  // Get unlocked badges based on quest progress
  const unlockedBadges = badges.filter((badge) => badge.unlocked);

  const handleProfileUpdate = async () => {
    if (!userData) {
      toast.error("User data not available");
      return;
    }

    try {
      // Build a simple request with only the required fields
      const requestBody: {
        email: string;
        name?: string;
        password?: string;
        newPassword?: string;
      } = {
        email: userData.email, // Email is required for identification
      };

      // Only include fields that are actually changing
      if (updatedName && updatedName !== userData.name) {
        requestBody.name = updatedName;
      }

      // For password changes, include both current and new password
      if (newPassword) {
        if (!currentPassword) {
          toast.error("Current password is required to change password");
          return;
        }

        requestBody.password = currentPassword;
        requestBody.newPassword = newPassword;
      }

      // If nothing is changing, don't make the request
      if (Object.keys(requestBody).length === 1) {
        // Only email is set
        toast.info("No changes to update");
        return;
      }

      console.log("Sending profile update request:", {
        ...requestBody,
        password: requestBody.password ? "[REDACTED]" : undefined,
        newPassword: requestBody.newPassword ? "[REDACTED]" : undefined,
      });

      // Make the API request
      const response = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        requestBody
      );

      if (response.data.success) {
        // Update local user data
        setUserData({
          ...userData,
          name: updatedName || userData.name,
        });

        // Update name in localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          localStorage.setItem(
            "userData",
            JSON.stringify({
              ...parsedUserData,
              name: updatedName || userData.name,
            })
          );
        }

        toast.success("Profile updated successfully");

        // Clear password fields after success
        setCurrentPassword("");
        setNewPassword("");

        // Don't reset progress state or refresh data unnecessarily
        // We keep the existing progress when the name is updated
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);

      // More detailed error handling
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 400
          ? "Missing required information"
          : error.response?.status === 401
          ? "Incorrect current password"
          : error.response?.status === 500
          ? "Server error, please try again later"
          : error.message) ||
        "Failed to update profile";

      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-8 slide-in-right">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-700 rounded-full flex items-center justify-center text-3xl font-bold mb-4 sm:mb-0 sm:mr-6">
              {userData?.name ? userData.name[0].toUpperCase() : "U"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {userData?.name || "User"}
              </h1>
              <p className="text-gray-300">
                {userData?.email || "email@example.com"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="bg-blue-600/20 text-blue-400 text-xs rounded-full px-3 py-1">
                  {loading ? "..." : gameStats.totalPoints} Points
                </span>
                <span className="bg-green-600/20 text-green-400 text-xs rounded-full px-3 py-1">
                  {loading ? "..." : unlockedBadges.length}/{badges.length}{" "}
                  Badges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            className={`py-3 px-6 font-medium transition-colors cursor-pointer ${
              activeTab === "progress"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("progress")}
          >
            Game Progress
          </button>
          <button
            className={`py-3 px-6 font-medium transition-colors cursor-pointer ${
              activeTab === "account"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </button>
        </div>

        {/* Game Progress Tab */}
        {activeTab === "progress" && (
          <div className="fade-in">
            {/* Progress Overview section with two columns */}
            <div className="bg-slate-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">
                Current Progress
              </h2>

              {/* Overall Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-gray-300 text-sm mb-1">
                  <span>Overall Progress (6 Realms)</span>
                  <span>{loading ? "..." : gameStats.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${loading ? 0 : gameStats.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Two-column layout for Current and Next Realm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Current Realm */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-300 mb-2">
                    Current Realm
                  </h3>
                  <div className="text-white font-semibold mb-2">
                    {loading ? "Loading..." : gameStats.currentRealm}
                  </div>

                  {/* Current Subquest with Title */}
                  {gameStats.currentSubquestId && (
                    <div className="mt-2 bg-slate-600 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Current Subquest
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          Subquest {gameStats.currentSubquestId}
                        </span>
                        <span className="bg-yellow-900/60 text-yellow-300 text-xs px-2 py-1 rounded">
                          In Progress
                        </span>
                      </div>
                      {gameStats.currentSubquestTitle && (
                        <div className="text-sm text-white mt-1">
                          {gameStats.currentSubquestTitle}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Next Realm */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-300 mb-2">
                    Next Realm
                  </h3>
                  <div className="text-white">
                    {loading ? "Loading..." : gameStats.nextRealm}
                  </div>

                  {/* Next Subquest with Title */}
                  {!loading && gameStats.nextSubquestId && (
                    <div className="mt-2 bg-slate-600 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Next Subquest
                      </h4>
                      <div className="text-white font-medium">
                        Subquest {gameStats.nextSubquestId}
                      </div>
                      {gameStats.nextSubquestTitle && (
                        <div className="text-sm text-white mt-1">
                          {gameStats.nextSubquestTitle}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        Complete your current subquest to unlock
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="bg-slate-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-amber-400 mb-4">
                Your Badges
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({unlockedBadges.length}/{badges.length})
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {badges.map((badge, index) => (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center ${
                      badge.unlocked
                        ? "bg-slate-700"
                        : "bg-slate-800 opacity-60"
                    } p-4 rounded-lg transition-all`}
                  >
                    <img
                      src={getBadgeImage(index)}
                      alt={badge.name}
                      className={`w-16 mb-2 ${
                        badge.unlocked ? "" : "grayscale"
                      }`}
                    />
                    <span className="text-center text-sm">{badge.name}</span>
                    {badge.description && (
                      <span className="text-xs text-gray-400 mt-1 text-center">
                        {badge.description}
                      </span>
                    )}
                    {!badge.unlocked && (
                      <span className="text-xs text-gray-500 mt-1">Locked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === "account" && (
          <div className="bg-slate-800 rounded-lg p-6 fade-in">
            <h2 className="text-xl font-semibold text-amber-400 mb-6">
              Account Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileUpdate}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
