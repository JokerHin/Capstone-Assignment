import { useEffect } from "react";

const Game = () => {
  useEffect(() => {
    // Inject Google Fonts link
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Jersey+10&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&family=VT323&display=swap";
    document.head.appendChild(fontLink);

    // Hide the React root
    const root = document.getElementById("root");
    if (root) root.style.display = "none";

    // Dynamically load Phaser first
    const phaserScript = document.createElement("script");
    phaserScript.src =
      "https://cdn.jsdelivr.net/npm/phaser@v3.88.2/dist/phaser.js";
    phaserScript.async = true;

    phaserScript.onload = () => {
      // Then load your game script after Phaser is loaded
      const gameScript = document.createElement("script");
      gameScript.type = "module";
      gameScript.src = "/PlayerComponent/game.js";
      document.body.appendChild(gameScript);

      // Clean up gameScript on unmount
      return () => {
        document.body.removeChild(gameScript);
      };
    };

    document.body.appendChild(phaserScript);

    // Clean up on unmount
    return () => {
      document.body.removeChild(phaserScript);
      if (root) root.style.display = "";
      document.head.removeChild(fontLink);
    };
  }, []);

  return <div id="game-container" className="game-container"></div>;
};

export default Game;
