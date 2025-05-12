import Navbar from "../components/LandingComponent/Navbar";
import Hero from "../components/LandingComponent/Hero";
import { ContainerScroll } from "../components/LandingComponent/ScrollAnimation";
import { InfiniteMovingCards } from "../components/LandingComponent/Contributors";
import Footer from "../components/LandingComponent/Footer";
import Games from "../components/LandingComponent/Games";
import Map from "../../public/assets/town_map.jpg";
import kid from "../../public/assets/kid.gif";
import bird from "../../public/assets/bird.gif";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Home = () => {
  const context = useContext(AppContent);
  const userData = context?.userData;
  const isLoggedin = context?.isLoggedin;
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin users to the admin dashboard
    if (isLoggedin && userData?.userType === "admin") {
      navigate("/AdminHome");
    }
  }, [isLoggedin, userData, navigate]);

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
          <img src={Map} alt="image" />
        </div>
      </ContainerScroll>
      <div id="games-section">
        <Games />
      </div>
      <img
        src={kid}
        alt="image"
        className="absolute top-750 left-0 w-[40%] z-10  md:w-[20%] md:top-600"
      />
      <img
        src={bird}
        alt="image"
        className="absolute top-1000 right-0 w-[40%] z-10  md:w-[20%] md:top-700 md:right-10"
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
};

const Contributors = [
  { quote: "Cho Kar Hin", name: "Frontend Developer" },
  { quote: "Beh Hon Sheng", name: "Designer" },
  { quote: "Chong Yong Wai", name: "FullStack Developer" },
  { quote: "Benjamin Soon", name: "Project Manager" },
  { quote: "Aimy Chong", name: "Leader" },
  { quote: "Chan Ying Yi", name: "Designer" },
];

export default Home;
