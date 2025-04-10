import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { ContainerScroll } from "../components/ScrollAnimation";
import { InfiniteMovingCards } from "../components/Contributors";
import Footer from "../components/Footer";
import Games from "../components/Games";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <ContainerScroll
        titleComponent={
          <h1 className="text-white text-[40px] font-bold">Let's Play</h1>
        }
      >
        <div>
          <img
            src="https://p1.itc.cn/q_70/images03/20230503/eccb47d0f93442019cb580aeca86c34d.png"
            alt="image"
          />
        </div>
      </ContainerScroll>
      <div id="games-section">
        <Games />
      </div>
      <img
        src="https://cdn2.unrealengine.com/s1-right-character-420x420-d4b8f86b4c4f.png"
        alt="image"
        className="absolute top-750 left-0 w-[40%] z-10  md:w-[20%] md:top-600"
      />
      <div
        id="contributors-section"
        className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #000000, #0a0301, #120601, #180902, #1c0c02, #210f03, #251103, #291204)",
        }}
      >
        <InfiniteMovingCards
          items={Contributors}
          direction="left"
          speed="normal"
          className=".animate-scroll"
        />
      </div>
      <Footer />
    </div>
  );
}

const Contributors = [
  { quote: "Cho Kar Hin", name: "Frontend Developer" },
  { quote: "Beh Hon Sheng", name: "Designer" },
  { quote: "Chong Yong Wai", name: "FullStack Developer" },
  { quote: "Benjamin Soon", name: "Project Manager" },
  { quote: "Aimy Chong", name: "Leader" },
  { quote: "Chan Ying Yi", name: "Designer" },
];
