import { COLORS, GAME_CONFIG } from "./constant";

export function createObstacle(k: any, x: number, y: number) {
  return k.add([
    k.rect(GAME_CONFIG.OBSTACLE_SIZE, GAME_CONFIG.OBSTACLE_SIZE),
    k.pos(x, y),
    k.color(k.Color.fromHex(COLORS.OBSTACLE)),
    k.area(),
    k.anchor("center"),
    "obstacle",
    {
      speed: GAME_CONFIG.OBSTACLE_SPEED,
      direction: k.rand() < 0.5 ? 1 : -1,
      
      update() {
        // Move horizontally
        this.pos.x += this.speed * this.direction * k.dt();
        
        // Bounce off screen edges
        if (this.pos.x <= GAME_CONFIG.OBSTACLE_SIZE / 2) {
          this.direction = 1;
        } else if (this.pos.x >= k.width() - GAME_CONFIG.OBSTACLE_SIZE / 2) {
          this.direction = -1;
        }
      },
    },
  ]);
}

export function createFallingObstacle(k: any, x: number, y: number) {
  return k.add([
    k.rect(GAME_CONFIG.OBSTACLE_SIZE, GAME_CONFIG.OBSTACLE_SIZE),
    k.pos(x, y),
    k.color(k.Color.fromHex(COLORS.OBSTACLE)),
    k.area(),
    k.anchor("center"),
    "falling-obstacle",
    {
      fallSpeed: GAME_CONFIG.OBSTACLE_SPEED * 0.5,
      
      update() {
        // Fall down
        this.pos.y += this.fallSpeed * k.dt();
        
        // Remove when off screen
        if (this.pos.y > k.height() + 50) {
          k.destroy(this);
        }
      },
    },
  ]);
}

export function spawnObstacle(k: any, platforms: any[]) {
  if (platforms.length === 0) return null;
  
  // Choose a random platform
  const platform = platforms[k.randi(0, platforms.length)];
  
  // Spawn obstacle above the platform
  const x = platform.pos.x + k.rand(-platform.platformWidth / 2, platform.platformWidth / 2);
  const y = platform.pos.y - 50;
  
  // Random obstacle type
  if (k.rand() < 0.7) {
    return createObstacle(k, x, y);
  } else {
    return createFallingObstacle(k, x, y);
  }
}