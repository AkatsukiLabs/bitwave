import { COLORS, GAME_CONFIG } from "./constant";

export function createCoin(k: any, x: number, y: number) {
  return k.add([
    k.circle(GAME_CONFIG.OBSTACLE_SIZE / 2),
    k.pos(x, y),
    k.color(k.Color.fromHex(COLORS.COIN)),
    k.area(),
    k.anchor("center"),
    "coin",
    {
      value: GAME_CONFIG.POINTS_PER_COIN,
      collected: false,
      pulse: 0,
      
      update() {
        // Floating animation
        this.pulse += k.dt() * 4;
        this.pos.y += Math.sin(this.pulse) * 0.5;
      },
      
      collect() {
        if (!this.collected) {
          this.collected = true;
          k.destroy(this);
          return this.value;
        }
        return 0;
      },
    },
  ]);
}

export function createDoubleJumpPowerup(k: any, x: number, y: number) {
  return k.add([
    k.rect(GAME_CONFIG.OBSTACLE_SIZE, GAME_CONFIG.OBSTACLE_SIZE),
    k.pos(x, y),
    k.color(k.Color.fromHex(COLORS.POWERUP)),
    k.area(),
    k.anchor("center"),
    "double-jump-powerup",
    {
      value: GAME_CONFIG.POINTS_PER_POWERUP,
      collected: false,
      pulse: 0,
      
      update() {
        // Floating animation
        this.pulse += k.dt() * 3;
        this.pos.y += Math.sin(this.pulse) * 0.8;
        
        // Rotate slightly
        this.angle += k.dt() * 2;
      },
      
      collect() {
        if (!this.collected) {
          this.collected = true;
          k.destroy(this);
          return this.value;
        }
        return 0;
      },
    },
  ]);
}

export function spawnPowerup(k: any, platforms: any[]) {
  if (platforms.length === 0) return null;
  
  // Choose a random platform
  const platform = platforms[k.randi(0, platforms.length)];
  
  // Spawn powerup above the platform
  const x = platform.pos.x + k.rand(-platform.platformWidth / 2, platform.platformWidth / 2);
  const y = platform.pos.y - 30;
  
  // Random powerup type
  if (k.rand() < 0.7) {
    return createCoin(k, x, y);
  } else {
    return createDoubleJumpPowerup(k, x, y);
  }
}