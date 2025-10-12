import { COLORS, GAME_CONFIG } from "./constant";

export function spawnObstacle(k: any, platforms: any[]) {
  // Simple obstacle implementation - can be expanded later
  if (platforms.length === 0) return null;
  
  const randomPlatform = platforms[k.randi(0, platforms.length - 1)];
  const obstacle = k.add([
    k.rect(GAME_CONFIG.OBSTACLE_SIZE, GAME_CONFIG.OBSTACLE_SIZE),
    k.pos(randomPlatform.pos.x, randomPlatform.pos.y - 30),
    k.color(k.Color.fromHex(COLORS.OBSTACLE)),
    k.area(),
    k.anchor("center"),
    "obstacle",
    {
      update() {
        // Obstacle can have movement or other behaviors
      }
    }
  ]);
  
  return obstacle;
}