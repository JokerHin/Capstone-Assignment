/**
 * This file provides fallback data and assets for the game
 * when the regular assets cannot be loaded
 */

// Fallback map data
export const createFallbackMap = (scene, mapKey) => {
  // Create a simple tilemap
  const width = 20;
  const height = 15;
  const data = Array(width * height).fill(1);

  // Generate a simple tileset texture
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.lineStyle(1, 0x555555, 1);
  graphics.strokeRect(0, 0, 32, 32);

  // Generate texture from the graphics object
  graphics.generateTexture("fallback_tile", 32, 32);
  graphics.destroy();

  // Create a blank map with the fallback tile
  const map = scene.make.tilemap({
    tileWidth: 32,
    tileHeight: 32,
    width: width,
    height: height,
  });

  const tileset = map.addTilesetImage("fallback_tile");
  const layer = map.createBlankLayer("ground", tileset);
  layer.fill(0);

  // Add some obstacles for visual interest
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    layer.putTileAt(0, x, y);
  }

  return map;
};

// Fallback character sprite
export const createFallbackSprite = (scene, x, y) => {
  // Create a simple orange circle for the character
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xff8800, 1);
  graphics.fillCircle(16, 16, 16);

  // Generate texture and create sprite
  graphics.generateTexture("fallback_character", 32, 32);
  graphics.destroy();

  const sprite = scene.physics.add.sprite(x, y, "fallback_character");

  // Add simple animation frames
  scene.anims.create({
    key: "fallback_idle",
    frames: [{ key: "fallback_character", frame: 0 }],
    frameRate: 10,
    repeat: -1,
  });

  return sprite;
};

// Fallback NPC data
export const fallbackNpcData = {
  guide: {
    name: "Guide",
    dialog: "Welcome to the game! Some assets couldn't be loaded properly.",
    position: { x: 100, y: 100 },
  },
  teacher: {
    name: "Teacher",
    dialog: "I'm here to help you learn about programming concepts!",
    position: { x: 400, y: 200 },
  },
  quest_giver: {
    name: "Quest Master",
    dialog: "Complete tasks to earn points and unlock new areas!",
    position: { x: 300, y: 400 },
  },
};

// Fallback tileset for maps
export const createFallbackTileset = (scene) => {
  // Create a set of different colored tiles
  const colors = [
    0x333333, // default/floor
    0x555555, // wall
    0x225522, // grass
    0x664422, // wood
    0x222255, // water
  ];

  colors.forEach((color, index) => {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokeRect(0, 0, 32, 32);

    graphics.generateTexture(`fallback_tile_${index}`, 32, 32);
    graphics.destroy();
  });

  return {
    getTextureKey: (tileIndex) =>
      `fallback_tile_${Math.min(tileIndex, colors.length - 1)}`,
  };
};

// Fallback for UI elements
export const createFallbackUI = (scene, type) => {
  let texture;
  let size = { width: 32, height: 32 };

  switch (type) {
    case "inventory_icon":
      texture = createUITexture(scene, 0x444444, "I", size);
      break;
    case "menu_icon":
      texture = createUITexture(scene, 0x444444, "M", size);
      break;
    case "close_icon":
      texture = createUITexture(scene, 0x444444, "X", size);
      break;
    default:
      texture = createUITexture(scene, 0x444444, "?", size);
  }

  return texture;
};

// Helper to create UI textures
function createUITexture(scene, bgColor, text, size) {
  const textureKey = `fallback_${text}_${bgColor.toString(16)}`;

  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(bgColor, 1);
  graphics.fillRect(0, 0, size.width, size.height);

  graphics.generateTexture(textureKey, size.width, size.height);
  graphics.destroy();

  // Add text on top of the background
  scene.make
    .text({
      x: size.width / 2,
      y: size.height / 2,
      text: text,
      style: {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffffff",
      },
      add: true,
    })
    .setOrigin(0.5, 0.5)
    .setDepth(1);

  return textureKey;
}
