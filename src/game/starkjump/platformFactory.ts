import { COLORS, GAME_CONFIG } from "./constant";
import { getRandomPlatformWidth, getRandomPlatformX } from "./utils";

export function createPlatform(k: any, x: number, y: number, width?: number, type?: string) {
  const platformWidth = width || getRandomPlatformWidth(
    k, 
    GAME_CONFIG.PLATFORM_MIN_WIDTH, 
    GAME_CONFIG.PLATFORM_MAX_WIDTH
  );
  
  // Platform types: normal, moving, broken, trampoline
  const platformType = type || (k.rand() < 0.7 ? "normal" : k.rand() < 0.9 ? "moving" : "broken");
  
  let color = COLORS.PLATFORM;
  if (platformType === "broken") color = "#8B4513"; // Darker brown
  if (platformType === "trampoline") color = "#FFD700"; // Gold
  
  return k.add([
    k.rect(platformWidth, GAME_CONFIG.PLATFORM_HEIGHT),
    k.pos(x, y),
    k.color(k.Color.fromHex(color)),
    k.area(),
    k.anchor("center"),
    "platform",
    {
      platformWidth: platformWidth,
      platformHeight: GAME_CONFIG.PLATFORM_HEIGHT,
      type: platformType,
      
      // Platform types
      isMoving: platformType === "moving",
      moveSpeed: platformType === "moving" ? k.rand(40, 100) : 0, // Faster movement
      moveDirection: 1,
      moveRange: platformType === "moving" ? k.rand(50, 120) : 0, // Larger range
      originalX: x,
      isBroken: platformType === "broken",
      breakTimer: 0,
      
      // Make platform move horizontally
      setMoving(speed: number, range: number) {
        this.isMoving = true;
        this.moveSpeed = speed;
        this.moveRange = range;
        this.originalX = x;
      },
      
      // Update moving platform
      update() {
        if (this.isMoving) {
          this.pos.x += this.moveSpeed * this.moveDirection * k.dt();
          
          // Reverse direction at range limits
          if (this.pos.x <= this.originalX - this.moveRange) {
            this.moveDirection = 1;
          } else if (this.pos.x >= this.originalX + this.moveRange) {
            this.moveDirection = -1;
          }
        }
        
        // Broken platform behavior
        if (this.isBroken) {
          this.breakTimer += k.dt();
          // Platform breaks after 2 seconds of being stepped on
          if (this.breakTimer > 2) {
            k.destroy(this);
          }
        }
      },
      
      // When player lands on platform
      onPlayerLand() {
        if (this.isBroken) {
          // Start break timer
          this.breakTimer = 0;
        }
      },
    },
  ]);
}

export function generatePlatforms(k: any, startY: number, count: number) {
  const platforms = [];
  let currentY = startY;
  
  for (let i = 0; i < count; i++) {
    const width = getRandomPlatformWidth(
      k, 
      GAME_CONFIG.PLATFORM_MIN_WIDTH, 
      GAME_CONFIG.PLATFORM_MAX_WIDTH
    );
    const x = getRandomPlatformX(k, k.width(), width);
    
    // More variety in platform types for better gameplay
    const platformType = k.rand() < 0.6 ? "normal" : 
                        k.rand() < 0.8 ? "moving" : 
                        k.rand() < 0.95 ? "broken" : "trampoline";
    
    const platform = createPlatform(k, x, currentY, width, platformType);
    platforms.push(platform);
    
    // Closer spacing for easier jumping
    const spacingVariation = k.rand(0.8, 1.0); // Even tighter variation for closer platforms
    currentY -= GAME_CONFIG.PLATFORM_SPAWN_DISTANCE * spacingVariation;
  }
  
  return platforms;
}

export function spawnPlatformAbove(k: any, highestY: number) {
  // Closer spacing for easier jumping
  const spacingVariation = k.rand(0.8, 1.0);
  const y = highestY - GAME_CONFIG.PLATFORM_SPAWN_DISTANCE * spacingVariation;
  
  const width = getRandomPlatformWidth(
    k, 
    GAME_CONFIG.PLATFORM_MIN_WIDTH, 
    GAME_CONFIG.PLATFORM_MAX_WIDTH
  );
  const x = getRandomPlatformX(k, k.width(), width);
  
  // More variety in platform types for progressive gameplay
  const platformType = k.rand() < 0.5 ? "normal" : 
                      k.rand() < 0.75 ? "moving" : 
                      k.rand() < 0.9 ? "broken" : "trampoline";
  
  return createPlatform(k, x, y, width, platformType);
}

// New function for efficient batch platform generation - NO HEIGHT LIMITS
export function generatePlatformBatch(k: any, startY: number, count: number) {
  const platforms = [];
  let currentY = startY;
  
  for (let i = 0; i < count; i++) {
    const platform = spawnPlatformAbove(k, currentY);
    platforms.push(platform);
    currentY = platform.pos.y; // Use actual platform position for next iteration
    
    // Debug logging for high altitudes
    if (Math.floor((k.height() - currentY) / 10) % 100 === 0 && currentY < k.height() - 1000) {
      console.log(`Batch generation: Created platform at height ${Math.floor((k.height() - currentY) / 10)}m`);
    }
  }
  
  return platforms;
}

export function spawnProgressivePlatforms(k: any, currentHighestY: number, playerY: number, count: number = 3) {
  const platforms = [];
  let currentY = currentHighestY;
  
  for (let i = 0; i < count; i++) {
    // Calculate spacing - even closer platforms for easier jumping
    const baseSpacing = GAME_CONFIG.PLATFORM_SPAWN_DISTANCE * 0.6; // Even more reduced spacing
    const spacingVariation = k.rand(0.7, 0.9); // Even tighter variation
    const y = currentY - baseSpacing * spacingVariation;
    
    // Ensure platforms are within reasonable distance of player
    if (y < playerY + 200) { // Only generate platforms within 200 units above player
      const width = getRandomPlatformWidth(
        k, 
        GAME_CONFIG.PLATFORM_MIN_WIDTH, 
        GAME_CONFIG.PLATFORM_MAX_WIDTH
      );
      const x = getRandomPlatformX(k, k.width(), width);
      
      // Progressive difficulty - more challenging platforms as you go higher
      const heightProgress = Math.max(0, (currentHighestY - y) / 2000);
      let platformType;
      
      if (heightProgress < 0.2) {
        // Early game - mostly normal platforms
        platformType = k.rand() < 0.6 ? "normal" : 
                      k.rand() < 0.85 ? "moving" : "broken";
      } else if (heightProgress < 0.5) {
        // Mid game - more variety
        platformType = k.rand() < 0.4 ? "normal" : 
                      k.rand() < 0.7 ? "moving" : 
                      k.rand() < 0.9 ? "broken" : "trampoline";
      } else {
        // Late game - more challenging
        platformType = k.rand() < 0.2 ? "normal" : 
                      k.rand() < 0.5 ? "moving" : 
                      k.rand() < 0.8 ? "broken" : "trampoline";
      }
      
      const platform = createPlatform(k, x, y, width, platformType);
      platforms.push(platform);
      currentY = y;
    }
  }
  
  return platforms;
}

export function createStrategicPlatformChain(k: any, startY: number, playerX: number, chainLength: number = 5) {
  const platforms = [];
  let currentY = startY;
  
  for (let i = 0; i < chainLength; i++) {
    // Use closer spacing for easier jumping
    const spacing = GAME_CONFIG.PLATFORM_SPAWN_DISTANCE * k.rand(0.8, 1.0);
    const y = currentY - spacing;
    
    // Strategic X positioning - create a path the player can follow
    let x;
    if (i === 0) {
      // First platform near player
      x = playerX + k.rand(-30, 30);
    } else {
      // Subsequent platforms create a challenging but achievable path
      const direction = k.rand() < 0.5 ? -1 : 1;
      const horizontalDistance = k.rand(40, 80) * direction; // Reasonable distance
      x = platforms[i-1].pos.x + horizontalDistance;
      
      // Keep within screen bounds with margin
      x = Math.max(40, Math.min(k.width() - 40, x));
    }
    
    const width = getRandomPlatformWidth(
      k, 
      GAME_CONFIG.PLATFORM_MIN_WIDTH, 
      GAME_CONFIG.PLATFORM_MAX_WIDTH
    );
    
    // Strategic platform types based on position in chain
    let platformType;
    if (i === 0) {
      // First platform is always normal for safety
      platformType = "normal";
    } else if (i === chainLength - 1) {
      // Last platform is usually normal for safe landing
      platformType = k.rand() < 0.7 ? "normal" : "moving";
    } else {
      // Middle platforms are challenging with more moving platforms
      platformType = k.rand() < 0.3 ? "normal" : 
                    k.rand() < 0.6 ? "moving" : 
                    k.rand() < 0.85 ? "broken" : "trampoline";
    }
    
    const platform = createPlatform(k, x, y, width, platformType);
    platforms.push(platform);
    currentY = y;
  }
  
  return platforms;
}