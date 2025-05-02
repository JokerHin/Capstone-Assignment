interface GameConfig {
  baseUrl: string;
  fallbackMode: boolean;
}

interface Window {
  gameConfig?: GameConfig;
}
