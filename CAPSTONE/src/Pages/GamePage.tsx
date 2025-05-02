import { useEffect, useState, useRef } from "react";
import mcWalking from "../../src/assets/mcWalking.gif";

// Define fallback game data for when assets can't be loaded
const FALLBACK_GAME_DATA = {
  npc: {
    npc1: {
      name: "Guide",
      dialog: "Welcome to the game! Sorry, but some assets couldn't be loaded.",
    },
    npc2: {
      name: "Helper",
      dialog: "This is a fallback version of the game with limited features.",
    },
  },
  maps: {
    map1: { width: 20, height: 15, tileSize: 32 },
    // More simplified map data
  },
  quests: {
    quest1: {
      title: "Start Your Journey",
      description: "Begin your coding adventure",
    },
    // More simplified quest data
  },
};

// Define the game config type for TypeScript - properly including all properties
interface GameConfig {
  baseUrl: string;
  fallbackMode: boolean;
  fallbackData?: typeof FALLBACK_GAME_DATA; // Make it optional
  fallbackDataUrl?: string; // Add the URL property
}

// Declare the window interface extension in the module scope to avoid conflicts
// This is different from the global declaration approach
interface CustomWindow extends Window {
  gameConfig?: GameConfig;
}
declare let window: CustomWindow;

const GamePage = () => {
  const [gameLoaded, setGameLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assetErrorCount, setAssetErrorCount] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  // Add a state to track minimum loading time
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  useEffect(() => {
    // Set a timer for minimum loading time (2 seconds)
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 2000);

    // Function to inject fallback assets
    const injectFallbackAssets = () => {
      // Create a style element for base64 encoded fallback textures
      const styleElement = document.createElement("style");
      styleElement.id = "fallback-assets-css";
      styleElement.textContent = `
        /* Base64 encoded fallback assets */
        .fallback-player {
          background-color: #ff8800;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .fallback-tile {
          background-color: #333;
          width: 32px;
          height: 32px;
          border: 1px solid #555;
        }
        .fallback-npc {
          background-color: #3498db;
          width: 32px;
          height: 32px;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(styleElement);

      // Create JSON files for fallback data
      const fallbackDataBlob = new Blob([JSON.stringify(FALLBACK_GAME_DATA)], {
        type: "application/json",
      });

      const dataUrl = URL.createObjectURL(fallbackDataBlob);

      return {
        styleElement,
        fallbackDataUrl: dataUrl,
        cleanup: () => {
          URL.revokeObjectURL(dataUrl);
          if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
          }
        },
      };
    };

    // First, check if the game assets directory exists
    fetch("/assets/game")
      .then((response) => {
        if (!response.ok) {
          console.warn(
            "Game assets directory not found. Using fallback configuration."
          );
        }

        // Continue loading the game
        loadGameScripts();
      })
      .catch((error) => {
        console.error("Error checking game assets:", error);
        loadGameScripts(); // Still try to load the game
      });

    function loadGameScripts() {
      // Add the fallback assets
      const { fallbackDataUrl, cleanup } = injectFallbackAssets();

      // Create a script element for Phaser
      const phaserScript = document.createElement("script");
      phaserScript.src = "//cdn.jsdelivr.net/npm/phaser@v3.88.2/dist/phaser.js";
      phaserScript.async = true;
      document.body.appendChild(phaserScript);

      // Set up an error tracking listener
      let errorListener = (event: ErrorEvent) => {
        // Only count errors related to asset loading
        if (
          event.message.includes("process file") ||
          event.message.includes("Failed to fetch") ||
          event.message.includes("SyntaxError: Unexpected token")
        ) {
          setAssetErrorCount((prev) => prev + 1);
        }
      };

      window.addEventListener("error", errorListener);

      // Only proceed after Phaser is loaded
      phaserScript.onload = () => {
        // Add the baseUrl parameter to window object to help game.js find assets
        window.gameConfig = {
          baseUrl: "/assets/game/",
          fallbackMode: true,
          fallbackData: FALLBACK_GAME_DATA,
          fallbackDataUrl: fallbackDataUrl,
        };

        // Create a script element for the game
        const gameScript = document.createElement("script");
        gameScript.src = "/src/components/PlayerComponent/game.js";
        gameScript.type = "module";
        gameScript.async = true;

        // Handle game script load success/failure
        gameScript.onload = () => {
          // Only set gameLoaded to true if the minimum loading time has elapsed
          // This ensures loading screen shows for at least 2 seconds
          setTimeout(() => {
            setGameLoaded(true);
          }, 500); // Added small additional delay for smoother transition

          // Add error handling for the game itself
          if (gameContainerRef.current) {
            gameContainerRef.current.addEventListener("gameerror", (e: any) => {
              console.error("Game error:", e.detail);
              setLoadError(e.detail.message || "An error occurred in the game");
            });
          }
        };

        gameScript.onerror = (e) => {
          console.error("Failed to load game script:", e);
          setLoadError("Game script failed to load. Please try again later.");
        };

        document.body.appendChild(gameScript);
      };

      phaserScript.onerror = () => {
        setLoadError(
          "Failed to load Phaser engine. Please check your internet connection."
        );
      };

      // Set body styles
      document.body.style.margin = "0";
      document.body.style.overflow = "hidden";

      // Cleanup function
      return () => {
        clearTimeout(minLoadingTimer); // Clear the minimum loading timer
        // Remove all the scripts we added
        const scripts = document.querySelectorAll("script");
        scripts.forEach((script) => {
          if (
            script.src.includes("phaser.js") ||
            script.src.includes("game.js")
          ) {
            document.body.removeChild(script);
          }
        });

        // Clean up the error listener
        window.removeEventListener("error", errorListener);

        // Clean up fallback assets
        cleanup();

        // Reset body styles
        document.body.style.margin = "";
        document.body.style.overflow = "";

        // Clear any global variables the game might have set
        if (window.gameConfig) {
          delete window.gameConfig;
        }
      };
    }
  }, []);

  // Function to check if loading screen should be shown
  const showLoadingScreen = () => {
    return (
      !gameLoaded || !minLoadingComplete || assetErrorCount > 5 || loadError
    );
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <div
        id="game-container"
        ref={gameContainerRef}
        className="w-full h-full"
      ></div>

      {/* Loading, Error, or Warning Overlay */}
      {showLoadingScreen() && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
          {loadError ? (
            <>
              <p className="text-red-400 text-xl mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white"
              >
                Try Again
              </button>
            </>
          ) : assetErrorCount > 5 ? (
            <>
              <p className="text-amber-400 text-xl mb-4">
                Some game assets couldn't be loaded. You can play with limited
                features.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setAssetErrorCount(0);
                    setMinLoadingComplete(true);
                  }} // Reset the error count to hide this message
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white"
                >
                  Continue Anyway
                </button>
              </div>
            </>
          ) : (
            <>
              <img
                src={mcWalking}
                alt="walking"
                className="mb-10 w-[30%] mr-10"
              />
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xl">Loading game...</p>
              <p className="text-gray-400 text-sm mt-2">
                Preparing your adventure...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GamePage;
