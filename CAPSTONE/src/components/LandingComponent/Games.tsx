import { Lock } from "lucide-react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import red from "../../assets/red.gif";

const realmsData = [
  {
    id: 1,
    title: "Realm 1: The House of Blueprints (Classes)",
    image:
      "https://cdn2.unrealengine.com/s05-keyart-1920x1080-logo-1920x1080-8eefea7d608b.png?resize=1&w=1920",
    mainObjective:
      "Learn how classes define the structure and rules of entities.",
    subquests: [
      "Complete the Blueprint Basics tutorial",
      "Create your first class structure",
      "Implement a character class with attributes",
      "Solve the inheritance puzzle",
    ],
    points: 1200,
    totalPoints: 2000,
    progress: 60,
    badge: "/assets/badges/badge1.png",
    badgeTitle: "Blueprint Master",
    badgeDescription:
      "Mastered the art of creating and using class blueprints.",
  },
  {
    id: 2,
    title: "Realm 2: The Object Outpost (Objects)",
    image:
      "https://www.ji-cloud.cn/ueditor/php/upload/image/20230414/1681454294321103.jpg",
    mainObjective: "Understand that objects are real-world uses of classes.",
    subquests: [
      "Create multiple objects from a single class",
      "Modify object properties during runtime",
      "Learn about object initialization and destruction",
      "Implement object communication patterns",
    ],
    points: 800,
    totalPoints: 2000,
    progress: 40,
    badge: "/assets/badges/badge2.png",
    badgeTitle: "Object Architect",
    badgeDescription:
      "Created and manipulated objects with precision and skill.",
  },
  {
    id: 3,
    title: "Realm 3: The Encapsulation Enclave (Encapsulation)",
    image: "https://p.qpic.cn/mwegame/0/c6057c02143ad52ad201fd1c9a0a1540/",
    mainObjective:
      "Discover how information is protected and accessed only through proper channels.",
    subquests: [
      "Implement access modifiers (public, private, protected)",
      "Create getters and setters for controlled access",
      "Build a secure data handling system",
      "Debug encapsulation-related issues",
    ],
    points: 400,
    totalPoints: 2000,
    progress: 20,
    badge: "/assets/badges/badge3.png",
    badgeTitle: "Guardian of Secrets",
    badgeDescription: "Protected data through proper encapsulation techniques.",
  },
  {
    id: 4,
    title: "Realm 4: House of Abstraction (Abstraction)",
    image: "https://images6.alphacoders.com/125/1250786.jpg",
    mainObjective:
      "Understand how complexity is hidden through simplified interfaces",
    subquests: [
      "Design abstract classes and methods",
      "Implement interfaces to define behavior contracts",
      "Create simplified APIs for complex systems",
      "Refactor code to increase abstraction levels",
    ],
    points: 0,
    totalPoints: 2000,
    progress: 0,
    badge: "/assets/badges/badge4.png",
    badgeTitle: "Abstraction Adept",
    badgeDescription:
      "Simplified complex systems through powerful abstractions.",
  },
  {
    id: 5,
    title: "Realm 5: The Polymorphism Plateau (Polymorphism)",
    image:
      "https://wallpapers.com/images/hd/fall-guys-fun-skins-l7pnkwqhyrmtivot.jpg",
    mainObjective:
      "Discover how objects, despite being created from the same class or interface, can behave differently when they perform the same action.",
    subquests: [
      "Implement method overriding for different behaviors",
      "Use dynamic method binding at runtime",
      "Create polymorphic collections of objects",
      "Design extensible systems using polymorphism",
    ],
    points: 0,
    totalPoints: 2000,
    progress: 0,
    badge: "/assets/badges/badge5.png",
    badgeTitle: "Shape Shifter",
    badgeDescription: "Mastered the art of many forms through polymorphism.",
  },
  {
    id: 6,
    title: "Realm 6: Inheritance Isle (Inheritance)",
    image:
      "https://assets.nintendo.com/image/upload/q_auto/f_auto/ncom/software/switch/70010000042975/937afd0c84319831009b44c93369faf0a2c926a454809f73523df9bfb6cf6233",
    mainObjective:
      "Explore how child classes inherit traits from parent classes",
    subquests: [
      "Create parent-child class hierarchies",
      "Override and extend inherited methods",
      "Implement multi-level inheritance chains",
      "Understand abstract inheritance and interfaces",
    ],
    points: 0,
    totalPoints: 2000,
    progress: 0,
    badge: "/assets/badges/badge6.png",
    badgeTitle: "Legacy Bearer",
    badgeDescription:
      "Carried forward the traits of ancestors through inheritance.",
  },
];

// Create simplified version for the cards display
const chaptersData = realmsData.map((realm) => ({
  id: realm.id,
  title: `Realm ${realm.id}`,
  image: realm.image,
}));

export default function Games() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Get login state from context
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }
  const { isLoggedin } = appContext;

  const [unlockedChapters] = useState([
    true, // Chapter 1
    false, // Chapter 2
    false, // Chapter 3
    false, // Chapter 4
    false, // Chapter 5
    false, // Chapter 6
  ]);

  const handleChapterClick = (chapterId: number) => {
    if (unlockedChapters[chapterId - 1]) {
      setSelectedChapter(chapterId);
      setShowModal(true);
    }
  };

  const handlePlayNow = () => {
    if (isLoggedin) {
      // window.location.href = "game.html";
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
        Games
      </div>
      <div className="w-[90%] md:w-[70%] h-auto grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white items-center">
        {chaptersData.map((chapter, index) => (
          <div
            key={chapter.id}
            className={`w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl ${
              unlockedChapters[index]
                ? "hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500"
                : "cursor-not-allowed"
            }`}
            onClick={() => handleChapterClick(chapter.id)}
          >
            <img
              src={chapter.image}
              alt={`${chapter.title} image`}
              className="w-full rounded-t-4xl"
            />
            <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
              {chapter.title}
            </p>

            {/* Show lock overlay if chapter is locked */}
            {!unlockedChapters[index] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-60">
                <Lock size={40} className="text-white opacity-80 mb-2" />
                <p className="text-white font-bold opacity-80">
                  Play to Unlock
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <img
        src={red}
        alt="image"
        className="absolute top-420 right-30 w-[30%] md:w-[20%] md:top-450"
      />

      {/* Chapter Details Modal */}
      {showModal && selectedChapter && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f38] rounded-xl w-full max-w-5xl overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row">
              {/* Left Column - Image */}
              <div className="w-full md:w-2/5">
                <img
                  src={realmsData[selectedChapter - 1].image}
                  alt={realmsData[selectedChapter - 1].title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Column - Chapter Info */}
              <div className="w-full md:w-3/5 p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {realmsData[selectedChapter - 1].title}
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
                    Main Objective
                  </h3>
                  <p className="text-gray-200">
                    {realmsData[selectedChapter - 1].mainObjective}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">
                    Subquests
                  </h3>
                  <ul className="list-disc pl-5 text-gray-200 space-y-1">
                    {realmsData[selectedChapter - 1].subquests.map(
                      (quest, index) => (
                        <li key={index}>{quest}</li>
                      )
                    )}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {/* Points */}
                  <div className="bg-[#262b47] p-3 rounded-lg w-[100px] text-center">
                    <h4 className="text-sm text-gray-400">Points</h4>
                    <p className="text-xl font-bold text-white">
                      {realmsData[selectedChapter - 1].points}
                    </p>
                  </div>

                  {/* Badge with tooltip */}
                  <div className="bg-[#262b47] w-[100px] p-3 rounded-lg flex flex-col justify-center items-center relative group">
                    <div>
                      <h4 className="text-sm text-gray-400 text-center">
                        Badge
                      </h4>
                    </div>
                    <div className="flex justify-center items-center w-full relative">
                      <img
                        src={realmsData[selectedChapter - 1].badge}
                        alt="Badge"
                        className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                      />

                      {/* Badge tooltip */}
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-80 text-white p-2 rounded text-xs w-48 pointer-events-none z-10 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                        <div className="font-bold mb-1">
                          {realmsData[selectedChapter - 1].badgeTitle}
                        </div>
                        <div>
                          {realmsData[selectedChapter - 1].badgeDescription}
                        </div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-black/80"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlayNow}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
