import { GAME_CONFIG, COLORS } from "./constant";
import { clamp } from "./utils";

export function createPlayer(k: any, startPos: any) {
  const player = k.add([
    k.pos(startPos),
    k.area({ width: GAME_CONFIG.PLAYER_SIZE, height: GAME_CONFIG.PLAYER_SIZE }),
    k.anchor("center"),
    "player",
    {
      velocity: k.vec2(0, 0),
      isGrounded: false,
      isJumping: false,
      facingRight: true,
      invincible: false,
      invincibleTime: 0,
      
      // Movement methods
      moveLeft(dt: number) {
        this.velocity.x = -GAME_CONFIG.PLAYER_SPEED;
        this.facingRight = false;
      },
      
      moveRight(dt: number) {
        this.velocity.x = GAME_CONFIG.PLAYER_SPEED;
        this.facingRight = true;
      },
      
      jump() {
        if (this.isGrounded && !this.isJumping) {
          this.velocity.y = GAME_CONFIG.JUMP_VELOCITY;
          this.isGrounded = false;
          this.isJumping = true;
          k.play("jump", { volume: 0.3 });
        }
      },
      
      applyPhysics(dt: number) {
        // Apply gravity
        this.velocity.y += GAME_CONFIG.GRAVITY * dt;
        
        // Apply friction to horizontal movement
        this.velocity.x *= GAME_CONFIG.FRICTION;
        
        // Cap fall speed
        if (this.velocity.y > GAME_CONFIG.MAX_FALL_SPEED) {
          this.velocity.y = GAME_CONFIG.MAX_FALL_SPEED;
        }
        
        // Update position
        this.pos = this.pos.add(this.velocity.scale(dt));
        
        // Keep player within screen bounds horizontally
        this.pos.x = clamp(
          this.pos.x, 
          GAME_CONFIG.PLAYER_SIZE / 2, 
          k.width() - GAME_CONFIG.PLAYER_SIZE / 2
        );
      },
      
      landOnPlatform(platform: any) {
        this.isGrounded = true;
        this.isJumping = false;
        this.velocity.y = 0;
        this.pos.y = platform.pos.y - GAME_CONFIG.PLATFORM_HEIGHT / 2 - GAME_CONFIG.PLAYER_SIZE / 2;
        
        // Auto-jump when landing
        this.jump();
      },
      
      bounceOnPlatform(platform: any) {
        this.velocity.y = GAME_CONFIG.JUMP_VELOCITY * GAME_CONFIG.BOUNCE_MULTIPLIER;
        this.isGrounded = false;
        this.isJumping = true;
        k.play("bounce", { volume: 0.4 });
      },
      
      checkScreenBounds() {
        // Check if player fell below screen
        if (this.pos.y > k.height() + 50) {
          return "game-over";
        }
        return "playing";
      },
      
      setInvincible(duration: number) {
        this.invincible = true;
        this.invincibleTime = duration;
      },
      
      updateInvincibility(dt: number) {
        if (this.invincible) {
          this.invincibleTime -= dt;
          if (this.invincibleTime <= 0) {
            this.invincible = false;
          }
        }
      }
    }
  ]);

  // Visual rendering
  player.onDraw(() => {
    // Draw player as a rounded square with gradient
    const gradient = k.gradient([
      [0, COLORS.PLAYER],
      [1, k.Color.fromHex(COLORS.PLAYER).darken(0.3)]
    ]);
    
    // Main body
    k.drawRect({
      width: GAME_CONFIG.PLAYER_SIZE,
      height: GAME_CONFIG.PLAYER_SIZE,
      radius: 4,
      color: player.invincible && Math.floor(k.time() * 10) % 2 === 0
        ? k.Color.fromHex("#ffffff")
        : gradient,
      pos: k.vec2(-GAME_CONFIG.PLAYER_SIZE / 2, -GAME_CONFIG.PLAYER_SIZE / 2)
    });
    
    // Eyes
    const eyeOffset = 3;
    const eyeY = -2;
    k.drawCircle({
      radius: 2,
      color: k.Color.fromHex("#000000"),
      pos: k.vec2(
        player.facingRight ? eyeOffset : -eyeOffset,
        eyeY
      )
    });
    
    // Outline
    k.drawRect({
      width: GAME_CONFIG.PLAYER_SIZE,
      height: GAME_CONFIG.PLAYER_SIZE,
      radius: 4,
      stroke: 1,
      color: k.Color.fromHex(COLORS.PLAYER_OUTLINE),
      pos: k.vec2(-GAME_CONFIG.PLAYER_SIZE / 2, -GAME_CONFIG.PLAYER_SIZE / 2)
    });
  });

  return player;
}