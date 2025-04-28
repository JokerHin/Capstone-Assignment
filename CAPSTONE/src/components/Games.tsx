import { Lock } from "lucide-react";
import { useState } from "react";

// Sample chapter data
const chapterData = {
  id: 1,
  title: "Realm 1: The House of Blueprints  (Classes)",
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
  badge: "./src/assets/badge.png",
};

export default function Games() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleChapterClick = (chapterId: number) => {
    if (chapterId === 1) {
      setSelectedChapter(chapterId);
      setShowModal(true);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="text-[20pt] md:text-[30pt] text-white font-bold text-center mb-10">
        Games
      </div>
      <div className="w-[90%] md:w-[70%] h-auto grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white items-center">
        <div
          className="w-[100%] bg-[#262b47] h-[300px] md:h-[300px] hover:shadow-amber-500 hover:shadow-2xl hover:-translate-y-4 hover:duration-75 cursor-pointer rounded-4xl hover:delay-100 hover:inset-shadow-sm hover:inset-shadow-amber-500 relative group"
          onClick={() => handleChapterClick(1)}
        >
          <img
            src="https://cdn2.unrealengine.com/s05-keyart-1920x1080-logo-1920x1080-8eefea7d608b.png?resize=1&w=1920"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 1
          </p>
        </div>

        <div className="w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl cursor-not-allowed">
          <img
            src="https://www.ji-cloud.cn/ueditor/php/upload/image/20230414/1681454294321103.jpg"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 2
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-60">
            <Lock size={40} className="text-white  mb-2" />
            <p className="text-white font-bold ">Play to Unlock</p>
          </div>
        </div>

        <div className="w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl cursor-not-allowed">
          <img
            src="https://p.qpic.cn/mwegame/0/c6057c02143ad52ad201fd1c9a0a1540/"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 3
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-60">
            <Lock size={40} className="text-white opacity-80 mb-2" />
            <p className="text-white font-bold opacity-80">Play to Unlock</p>
          </div>
        </div>

        <div className="w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl cursor-not-allowed">
          <img
            src="https://images6.alphacoders.com/125/1250786.jpg"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 4
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-60">
            <Lock size={40} className="text-white opacity-80 mb-2" />
            <p className="text-white font-bold opacity-80">Play to Unlock</p>
          </div>
        </div>

        <div className="w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl cursor-not-allowed">
          <img
            src="https://wallpapers.com/images/hd/fall-guys-fun-skins-l7pnkwqhyrmtivot.jpg"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 5
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-60">
            <Lock size={40} className="text-white opacity-80 mb-2" />
            <p className="text-white font-bold opacity-80">Play to Unlock</p>
          </div>
        </div>

        <div className="w-[100%] bg-[#262b47] h-[300px] md:h-[300px] relative rounded-4xl cursor-not-allowed">
          <img
            src="https://assets.nintendo.com/image/upload/q_auto/f_auto/ncom/software/switch/70010000042975/937afd0c84319831009b44c93369faf0a2c926a454809f73523df9bfb6cf6233"
            alt="image"
            className="w-full rounded-t-4xl"
          />
          <p className="text-xl md:text-2xl text-white font-bold text-center mt-4 md:mt-7">
            Chapter 6
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-black opacity-60">
            <Lock size={40} className="text-white opacity-80 mb-2" />
            <p className="text-white font-bold opacity-80">Play to Unlock</p>
          </div>
        </div>
      </div>
      <img
        src="https://i.pinimg.com/originals/e5/b4/0d/e5b40df80fba2da8cace9fb997a3e960.png"
        alt="image"
        className="absolute top-420 right-0 w-[50%] md:w-[30%] md:top-450"
      />

      {/* Chapter Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black  flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f38] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl ">
            <div className="flex flex-col md:flex-row">
              {/* Left Column - Image */}
              <div className="w-full md:w-2/5">
                <img
                  src={chapterData.image}
                  alt="title"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Column - Chapter Info */}
              <div className="w-full md:w-3/5 p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {chapterData.title}
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
                  <p className="text-gray-200">{chapterData.mainObjective}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">
                    Subquests
                  </h3>
                  <ul className="list-disc pl-5 text-gray-200 space-y-1">
                    {chapterData.subquests.map((quest, index) => (
                      <li key={index}>{quest}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {/* Points */}
                  <div className="bg-[#262b47] p-3 rounded-lg w-[100px] text-center">
                    <h4 className="text-sm text-gray-400">Points</h4>
                    <p className="text-xl font-bold text-white">
                      {chapterData.points}
                    </p>
                  </div>

                  <div className="bg-[#262b47] p-3 rounded-lg flex-col justify-center items-center">
                    <div>
                      <h4 className="text-sm text-gray-400 text-center">
                        Badge
                      </h4>
                    </div>
                    <img
                      src={chapterData.badge}
                      alt="Badge"
                      className="w-12 "
                    />
                  </div>

                  {/* Progress */}
                  <div className="bg-[#262b47] p-3 rounded-lg flex-grow">
                    <h4 className="text-sm text-gray-400 text-center">
                      Progress
                    </h4>
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full"
                          style={{ width: `${chapterData.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-sm text-gray-400 mt-1">
                        {chapterData.progress}%
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer">
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
