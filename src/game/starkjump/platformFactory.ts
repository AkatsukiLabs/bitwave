import { GAME_CONFIG, PLATFORM_TYPES } from "./constant";
import { getPlatformColor, getRandomPlatformType } from "./utils";

export function createPlatform(
  k: any,
  pos: any,
  type: string = "normal",
  id: string = ""
) {
  const platform = k.add([
    k.pos(pos),
    k.area({ 
      width: GAME_CONFIG.PLATFORM_WIDTH, 
      height: GAME_CONFIG.PLATFORM_HEIGHT 
    }),
    k.anchor("center"),
    "platform",
    {
      type,
      id,
      originalX: pos.x,
      moveDirection: 1,
      breakTimer: 0,
      isBreaking: false,
      isBroken: false,
      bounceTimer: 0,
      
      // Movement for moving platforms
      updateMovement(dt: number) {
        if (this.type === PLATFORM_TYPES.MOVING) {
          this.pos.x += this.moveDirection * GAME_CONFIG.PLATFORM_MOVE_SPEED * dt;
          
          // Reverse direction at screen edges
          if (this.pos.x <= GAME_CONFIG.PLATFORM_WIDTH / 2) {
            this.moveDirection = 1;
          } else if (this.pos.x >= k.width() - GAME_CONFIG.PLATFORM_WIDTH / 2) {
            this.moveDirection = -1;
          }
        }
        
        // Breaking platform logic
        if (this.type === PLATFORM_TYPES.BREAKING && this.isBreaking) {
          this.breakTimer += dt;
          if (this.breakTimer >= 0.5) { // Break after 0.5 seconds
            this.isBroken = true;
            k.destroy(this);
          }
        }
        
        // Bouncy platform animation
        if (this.type === PLATFORM_TYPES.BOUNCY) {
          this.bounceTimer += dt;
        }
      },
      
      // Trigger breaking
      startBreaking() {
        if (this.type === PLATFORM_TYPES.BREAKING && !this.isBreaking) {
          this.isBreaking = true;
          k.play("platform-break", { volume: 0.3 });
        }
      },
      
      // Get bounce effect
      getBounceEffect() {
        if (this.type === PLATFORM_TYPES.BOUNCY) {
          return Math.sin(this.bounceTimer * 8) * 2; // Subtle bounce animation
        }
        return 0;
      }
    }
  ]);

  // Visual rendering
  platform.onDraw(() => {
    const color = getPlatformColor(this.type);
    const bounceOffset = this.getBounceEffect();
    
    // Main platform body
    k.drawRect({
      width: GAME_CONFIG.PLATFORM_WIDTH,
      height: GAME_CONFIG.PLATFORM_HEIGHT,
      radius: 6,
      color: k.Color.fromHex(color),
      pos: k.vec2(
        -GAME_CONFIG.PLATFORM_WIDTH / 2, 
        -GAME_CONFIG.PLATFORM_HEIGHT / 2 + bounceOffset
      )
    });
    
    // Platform type indicators
    if (this.type === PLATFORM_TYPES.MOVING) {
      // Moving platform arrows
      k.drawRect({
        width: 4,
        height: 8,
        color: k.Color.fromHex("#ffffff"),
        pos: k.vec2(-8, -4 + bounceOffset)
      });
      k.drawRect({
        width: 4,
        height: 8,
        color: k.Color.fromHex("#ffffff"),
        pos: k.vec2(4, -4 + bounceOffset)
      });
    } else if (this.type === PLATFORM_TYPES.BREAKING) {
      // Breaking platform cracks
      if (this.isBreaking) {
        const crackIntensity = this.breakTimer / 0.5;
        k.drawLine({
          p1: k.vec2(-GAME_CONFIG.PLATFORM_WIDTH / 2, -2 + bounceOffset),
          p2: k.vec2(GAME_CONFIG.PLATFORM_WIDTH / 2, 2 + bounceOffset),
          width: 2,
          color: k.Color.fromHex("#000000")
        });
        k.drawLine({
          p1: k.vec2(-GAME_CONFIG.PLATFORM_WIDTH / 2, 2 + bounceOffset),
          p2: k.vec2(GAME_CONFIG.PLATFORM_WIDTH / 2, -2 + bounceOffset),
          width: 2,
          color: k.Color.fromHex("#000000")
        });
      }
    } else if (this.type === PLATFORM_TYPES.BOUNCY) {
      // Bouncy platform stars
      const starSize = 2;
      k.drawRect({
        width: starSize,
        height: starSize,
        color: k.Color.fromHex("#ffffff"),
        pos: k.vec2(-6, -2 + bounceOffset)
      });
      k.drawRect({
        width: starSize,
        height: starSize,
        color: k.Color.fromHex("#ffffff"),
        pos: k.vec2(4, -2 + bounceOffset)
      });
    }
    
    // Platform outline
    k.drawRect({
      width: GAME_CONFIG.PLATFORM_WIDTH,
      height: GAME_CONFIG.PLATFORM_HEIGHT,
      radius: 6,
      stroke: 1,
      color: k.Color.fromHex("#ffffff").opacity(0.3),
      pos: k.vec2(
        -GAME_CONFIG.PLATFORM_WIDTH / 2, 
        -GAME_CONFIG.PLATFORM_HEIGHT / 2 + bounceOffset
      )
    });
  });

  return platform;
}

export function generatePlatforms(
  k: any,
  startY: number,
  endY: number,
  existingPlatforms: any[] = []
): any[] {
  const platforms = [];
  let currentY = startY;
  
  while (currentY > endY) {
    // Check if we should spawn a platform at this height
    if (Math.random() < GAME_CONFIG.PLATFORM_SPAWN_RATE) {
      const type = getRandomPlatformType();
      const pos = k.vec2(
        k.rand(20, k.width() - 20),
        currentY
      );
      
      // Check distance from existing platforms
      let tooClose = false;
      for (const existing of existingPlatforms) {
        if (Math.abs(existing.pos.y - pos.y) < GAME_CONFIG.PLATFORM_MIN_DISTANCE) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        const platform = createPlatform(k, pos, type, `platform-${Date.now()}-${Math.random()}`);
        platforms.push(platform);
      }
    }
    
    currentY -= k.rand(
      GAME_CONFIG.PLATFORM_MIN_DISTANCE,
      GAME_CONFIG.PLATFORM_MAX_DISTANCE
    );
  }
  
  return platforms;
}