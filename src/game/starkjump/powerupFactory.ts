import { COLORS, GAME_CONFIG } from "./constant";

export function spawnPowerup(k: any, platforms: any[]) {
  // Simple powerup implementation - can be expanded later
  if (platforms.length === 0) return null;
  
  const randomPlatform = platforms[k.randi(0, platforms.length - 1)];
  const powerup = k.add([
    k.circle(GAME_CONFIG.OBSTACLE_SIZE / 2),
    k.pos(randomPlatform.pos.x, randomPlatform.pos.y - 30),
    k.color(k.Color.fromHex(COLORS.POWERUP)),
    k.area(),
    k.anchor("center"),
    "powerup",
    {
      collect() {
        k.destroy(this);
        return GAME_CONFIG.POINTS_PER_POWERUP;
      },
      update() {
        // Powerup can have movement or other behaviors
      }
    }
  ]);
  
  return powerup;
}