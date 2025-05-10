import { useEffect } from "react";

const Game = () => {
  useEffect(() => {
    // Dynamically load Phaser first
    const phaserScript = document.createElement("script");
    phaserScript.src = "https://cdn.jsdelivr.net/npm/phaser@v3.88.2/dist/phaser.js";
    phaserScript.async = true;

    phaserScript.onload = () => {
      // Then load your game script after Phaser is loaded
      const gameScript = document.createElement("script");
      gameScript.type = "module";
      gameScript.src = "src/components/PlayerComponent/game.js";
      document.body.appendChild(gameScript);

      // Clean up gameScript on unmount
      return () => {
        document.body.removeChild(gameScript);
      };
    };

    document.body.appendChild(phaserScript);

    // Clean up phaserScript on unmount
    return () => {
      document.body.removeChild(phaserScript);
    };
  }, []);

  return <div id="game-container" className="game-container"></div>;
};

export default Game;