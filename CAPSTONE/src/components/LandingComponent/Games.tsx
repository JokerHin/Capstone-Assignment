import { Lock, CheckCircle } from "lucide-react";
import { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContent } from "../../context/AppContext";
import red from "../../../public/assets/red.gif";
import questData from "../../../public/PlayerComponent/game-data/quest.json";
import points from "../../../public/assets/points.png";

interface PlayerProgress {
  _id: string;
  player_id: string;
  subquest_id: string;
  status: string;
}

interface Subquest {
  _id: string;
  subquest_id: string;
  quest_id: string;
  title: string;
  description?: string;
}

export default function Games() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [currentQuestId, setCurrentQuestId] = useState<number>(1);
  const [apiSubquests, setApiSubquests] = useState<Subquest[]>([]);
  const [loadingSubquests, setLoadingSubquests] = useState(true);

  // Get login state and user data from context
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }
  const { isLoggedin, userData, backendUrl } = appContext;

  // Default realm images - use these if you don't have specific images for each realm
  const realmImages = [
    "https://cdn2.unrealengine.com/s05-keyart-1920x1080-logo-1920x1080-8eefea7d608b.png?resize=1&w=1920",
    "https://www.ji-cloud.cn/ueditor/php/upload/image/20230414/1681454294321103.jpg",
    "https://images8.alphacoders.com/131/1316590.jpeg",
    "https://images6.alphacoders.com/125/1250786.jpg",
    "https://wallpapers.com/images/hd/fall-guys-fun-skins-l7pnkwqhyrmtivot.jpg",
    "https://assets.nintendo.com/image/upload/q_auto/f_auto/ncom/software/switch/70010000042975/937afd0c84319831009b44c93369faf0a2c926a454809f73523df9bfb6cf6233",
  ];

  // Badge titles and descriptions
  const badgeInfo = [
    {
      title: "Class Badge",
      description: "Mastered the art of creating and using classes",
    },
    {
      title: "Object Badge",
      description: "Created and manipulated objects with precision",
    },
    {
      title: "Encapsulation Badge",
      description: "Protected data through proper encapsulation",
    },
    {
      title: "Inheritance Badge",
      description: "Carried forward the traits through inheritance",
    },
    {
      title: "Polymorphism Badge",
      description: "Mastered the art of many forms",
    },
    {
      title: "Abstraction Badge",
      description: "Simplified complex systems with abstractions",
    },
  ];

  // Fetch player progress
  useEffect(() => {
    const fetchPlayerProgress = async () => {
      if (!isLoggedin || !userData?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/player-progress`);

        // Filter progress for current player
        const userProgressData = response.data.filter(
          (progress: PlayerProgress) => progress.player_id === userData.id
        );

        setPlayerProgress(userProgressData);

        // Determine current quest based on progress
        if (userProgressData.length > 0) {
          let highestQuestId = 1;

          userProgressData.forEach((progress: PlayerProgress) => {
            const subquestId = progress.subquest_id;

            const matchingSubquest = apiSubquests.find(
              (sq) => String(sq.subquest_id) === String(subquestId)
            );

            if (matchingSubquest) {
              const questId = Number(matchingSubquest.quest_id);
              highestQuestId = Math.max(highestQuestId, questId);
            }
          });

          setCurrentQuestId(highestQuestId);
        }
      } catch (error) {
        console.error("Error fetching player progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProgress();
  }, [isLoggedin, userData, backendUrl, apiSubquests]);

  useEffect(() => {
    const fetchSubquests = async () => {
      if (!backendUrl) return;

      setLoadingSubquests(true);
      try {
        const response = await axios.get(`${backendUrl}/subquest`);
        setApiSubquests(response.data);
      } catch (error) {
        console.error("Error fetching subquests:", error);
      } finally {
        setLoadingSubquests(false);
      }
    };

    fetchSubquests();
  }, [backendUrl]);

  // Enhanced realms data with API subquests
  const enhancedRealmsData = useMemo(() => {
    return questData.map((quest) => {
      // Find subquests for this quest from API
      const questSubquests = apiSubquests.filter(
        (sq) => String(sq.quest_id) === String(quest.quest_id)
      );

      // Get subquest titles
      const subquestTitles = questSubquests.map((sq) => sq.title);

      const totalPoints = questSubquests.length * 10;
      const completedSubquests = playerProgress.filter((progress) => {
        const subquestId = progress.subquest_id;
        return (
          questSubquests.some(
            (sq) => String(sq.subquest_id) === String(subquestId)
          ) && progress.status === "completed"
        );
      }).length;

      const points = completedSubquests * 10;

      // Calculate progress percentage
      const progressPercent = questSubquests.length
        ? Math.round((completedSubquests / questSubquests.length) * 100)
        : 0;

      // Determine completion status
      const isCompleted = quest.quest_id < currentQuestId;
      const isCurrent = quest.quest_id === currentQuestId;

      return {
        id: quest.quest_id,
        title: `Realm ${quest.quest_id}: ${quest.title}`,
        image: realmImages[quest.quest_id - 1] || realmImages[0],
        subquests:
          subquestTitles.length > 0 ? subquestTitles : ["No subquests found"],
        points,
        totalPoints,
        progress: progressPercent,
        badge: `/assets/badges/badge${quest.quest_id}.png`,
        badgeTitle:
          badgeInfo[quest.quest_id - 1]?.title ||
          `Realm ${quest.quest_id} Master`,
        badgeDescription:
          badgeInfo[quest.quest_id - 1]?.description || "Completed this realm",
        isCompleted,
        isCurrent,
      };
    });
  }, [apiSubquests, questData, playerProgress, currentQuestId]);

  // Create simplified version for the cards display
  const chaptersData = enhancedRealmsData.map((realm) => ({
    id: realm.id,
    title: realm.title,
    image: realm.image,
    isCompleted: realm.isCompleted,
    isCurrent: realm.isCurrent,
  }));

  const handleChapterClick = (chapterId: number) => {
    // Find if chapter is unlocked (either completed or current)
    const chapter = enhancedRealmsData.find((realm) => realm.id === chapterId);

    if (chapter && (chapter.isCurrent || isLoggedin)) {
      setSelectedChapter(chapterId);
      setShowModal(true);
    } else if (!isLoggedin) {
      toast.warn("Please log in to view realm details", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handlePlayNow = () => {
    if (isLoggedin) {
      navigate("/game");
    } else {
      toast.warn("Please log in to play this game", {
        position: "top-center",
        autoClose: 3000,
      });
      setShowModal(false);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="text-[20pt] md:text-[30pt] text-white font-bold text-center mb-10">
        Game Realms
      </div>

      {loading || loadingSubquests ? (
        <div className="text-white text-center">Loading realms...</div>
      ) : (
        <div className="w-[90%] md:w-[70%] h-auto grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white items-center">
          {chaptersData.map((chapter, index) => {
            const realm = enhancedRealmsData[index];
            const isUnlocked =
              realm && (realm.isCurrent || realm.isCompleted || !isLoggedin);

            return (
              <div
                key={chapter.id}
                className={`w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl ${
                  isUnlocked
                    ? "hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500"
                    : ""
                }`}
                onClick={() => isUnlocked && handleChapterClick(chapter.id)}
              >
                <img
                  src={chapter.image}
                  alt={`${chapter.title} image`}
                  className="w-full h-[65%] rounded-t-4xl object-cover"
                />
                <div className="p-3">
                  <p className="text-lg md:text-xl text-white font-bold text-center">
                    {chapter.title}
                  </p>
                  <div className="flex justify-center items-center mt-2">
                    <span className="text-sm text-amber-300 text-center">
                      {realm.subquests.length} Subquests
                    </span>
                  </div>
                </div>

                {/* Show semi-transparent lock overlay if chapter is locked */}
                {!isUnlocked && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-40 backdrop-blur-[2px] cursor-not-allowed"
                    aria-hidden="true"
                  >
                    <Lock size={40} className="text-white opacity-90 mb-2" />
                    <p className="text-white font-bold">
                      Complete Previous Realm
                    </p>
                  </div>
                )}

                {/* Show completion indicator for completed realms */}
                {realm.isCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <img
        src={red}
        alt="image"
        className="absolute top-420 right-30 w-[30%] md:w-[20%] md:top-450"
      />

      {/* Chapter Details Modal */}
      {showModal &&
        selectedChapter &&
        enhancedRealmsData[selectedChapter - 1] && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f38] rounded-xl w-full max-w-5xl overflow-hidden shadow-2xl">
              <div className="flex flex-col md:flex-row">
                {/* Left Column - Image */}
                <div className="w-full md:w-2/5">
                  <img
                    src={enhancedRealmsData[selectedChapter - 1].image}
                    alt={enhancedRealmsData[selectedChapter - 1].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Column - Chapter Info */}
                <div className="w-full md:w-3/5 p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {enhancedRealmsData[selectedChapter - 1].title}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-white text-3xl cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-amber-400 mb-2">
                      Subquests
                    </h3>
                    <ul className="list-disc pl-5 text-gray-200 space-y-1">
                      {enhancedRealmsData[selectedChapter - 1].subquests.map(
                        (quest, index) => (
                          <li key={index}>{quest}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Completion Rewards - Always show, not grayed out */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-amber-400 mb-3">
                      Completion Rewards
                    </h3>

                    {/* Points Reward */}
                    <div className="flex items-center bg-slate-700 p-4 rounded-lg mb-3">
                      <div className="bg-amber-900/60 p-3 rounded-lg mr-4">
                        <img
                          src={points}
                          alt="Points"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">
                          {enhancedRealmsData[selectedChapter - 1].totalPoints}{" "}
                          Points
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          Complete all subquests to earn points
                        </div>
                      </div>
                    </div>

                    {/* Badge Reward */}
                    <div className="flex items-center bg-slate-700 p-4 rounded-lg">
                      <img
                        src={enhancedRealmsData[selectedChapter - 1].badge}
                        alt="Badge"
                        className="w-16 h-16 object-contain mr-4"
                      />
                      <div>
                        <div className="font-bold text-white text-lg">
                          {enhancedRealmsData[selectedChapter - 1].badgeTitle}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {
                            enhancedRealmsData[selectedChapter - 1]
                              .badgeDescription
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlayNow}
                    disabled={
                      enhancedRealmsData[selectedChapter - 1].isCompleted
                    }
                    className={`w-full py-3 font-bold rounded-lg transition-colors cursor-pointer ${
                      enhancedRealmsData[selectedChapter - 1].isCompleted
                        ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {enhancedRealmsData[selectedChapter - 1].isCompleted
                      ? "Completed"
                      : "Play Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
