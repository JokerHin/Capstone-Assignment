/**
 * This file provides fallback functionality for the Phaser game
 * when assets can't be loaded correctly.
 */

// Simplified tilemap data for fallback maps
export const fallbackMaps = {
  map1: {
    width: 20,
    height: 15,
    layers: [
      {
        data: Array(20 * 15).fill(1), // Fill the map with tile 1
        name: "ground",
      },
    ],
  },
  // Can add more maps as needed
};

// Generate a simple sprite as a fallback for images
export function createFallbackSprite(
  scene,
  x,
  y,
  width = 32,
  height = 32,
  color = 0xff8800
) {
  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillRect(0, 0, width, height);

  const texture = graphics.generateTexture(
    "fallback_texture_" + color.toString(16),
    width,
    height
  );
  graphics.destroy();

  return scene.add.sprite(x, y, "fallback_texture_" + color.toString(16));
}

// Create a simple fallback tilemap
export function createFallbackTilemap(scene, mapKey) {
  const mapData = fallbackMaps[mapKey] || fallbackMaps.map1;

  // Create a simple grid as a fallback tilemap
  const map = scene.make.tilemap({
    width: mapData.width,
    height: mapData.height,
    tileWidth: 32,
    tileHeight: 32,
  });

  // Create a simple tileset
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.lineStyle(1, 0x555555, 1);
  graphics.strokeRect(0, 0, 32, 32);

  const texture = graphics.generateTexture("fallback_tile", 32, 32);
  graphics.destroy();

  const tileset = map.addTilesetImage("fallback_tile");

  // Create a layer and fill it with tiles
  const layer = map.createBlankLayer("ground", tileset);
  layer.fill(0);

  return map;
}

// Helper for creating fallback UI elements
export function createFallbackUI(scene) {
  // Create a simple header bar
  const headerBar = scene.add.rectangle(
    scene.cameras.main.width / 2,
    20,
    scene.cameras.main.width,
    40,
    0x222222
  );

  const headerText = scene.add
    .text(
      scene.cameras.main.width / 2,
      20,
      "Fallback Mode - Limited Features",
      { fontSize: "16px", color: "#ff8800" }
    )
    .setOrigin(0.5);

  return { headerBar, headerText };
}
