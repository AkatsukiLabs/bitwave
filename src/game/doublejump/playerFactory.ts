import { COLORS, GAME_CONFIG } from "./constant";
import { isPlayerOnPlatform } from "./utils";

export function createPlayer(k: any, startPos: any) {
  const player = k.add([
    k.rect(GAME_CONFIG.PLAYER_SIZE, GAME_CONFIG.PLAYER_SIZE),
    k.pos(startPos),
    k.color(k.Color.fromHex(COLORS.PLAYER)),
    k.area(),
    k.anchor("center"),
    "player",
    {
      // Player state
      isJumping: false,
      canDoubleJump: true,
      doubleJumpUsed: false,
      score: 0,
      highestY: startPos.y,
      vel: k.vec2(0, 0),
      autoJump: true, // Doodle Jump style - always jumping
      horizontalSpeed: 0,
      maxHorizontalSpeed: GAME_CONFIG.PLAYER_SPEED,
      
      // Movement (Doodle Jump style - tilt controls)
      moveLeft() {
        this.horizontalSpeed = -this.maxHorizontalSpeed;
        console.log("moveLeft called - horizontalSpeed set to:", this.horizontalSpeed);
      },
      
      moveRight() {
        this.horizontalSpeed = this.maxHorizontalSpeed;
        console.log("moveRight called - horizontalSpeed set to:", this.horizontalSpeed);
      },
      
      stopMoving() {
        this.horizontalSpeed = 0;
      },
      
      // Jump mechanics (automatic like Doodle Jump)
      jump() {
        if (!this.isJumping) {
          this.vel.y = -GAME_CONFIG.PLAYER_JUMP_FORCE;
          this.isJumping = true;
          this.doubleJumpUsed = false;
        }
      },
      
      doubleJump() {
        if (this.isJumping && !this.doubleJumpUsed && this.canDoubleJump) {
          this.vel.y = -GAME_CONFIG.PLAYER_JUMP_FORCE * 0.8; // Slightly weaker
          this.doubleJumpUsed = true;
        }
      },
      
      // Check if player is on ground/platform
      checkGroundCollision(platforms: any[]) {
        for (const platform of platforms) {
          if (isPlayerOnPlatform(this, platform)) {
            if (this.vel.y >= 0) { // When falling or stationary
              this.isJumping = false;
              this.doubleJumpUsed = false;
              // Position player on top of platform
              this.pos.y = platform.pos.y - platform.platformHeight / 2 - this.height / 2;
              
              // Handle platform-specific behavior
              if (platform.onPlayerLand) {
                platform.onPlayerLand();
              }
              
              // Auto-jump when landing on platform (like Doodle Jump)
              this.vel.y = -GAME_CONFIG.PLAYER_JUMP_FORCE;
              this.isJumping = true;
              return true;
            }
          }
        }
        return false;
      },
      
      // Update player state
      update() {
        // Apply gravity
        this.vel.y += GAME_CONFIG.GRAVITY * k.dt();
        
        // Apply horizontal movement (Doodle Jump style - smooth acceleration)
        this.vel.x = this.horizontalSpeed;
        
        // Debug horizontal movement
        if (this.horizontalSpeed !== 0) {
          console.log("=== PLAYER UPDATE DEBUG ===");
          console.log("horizontalSpeed:", this.horizontalSpeed);
          console.log("vel.x:", this.vel.x);
          console.log("pos.x before update:", this.pos.x);
          console.log("pos.x change:", this.vel.x * k.dt());
        }
        
        // Update position
        this.pos.x += this.vel.x * k.dt();
        this.pos.y += this.vel.y * k.dt();
        
        // Debug after position update
        if (this.horizontalSpeed !== 0) {
          console.log("pos.x after update:", this.pos.x);
          console.log("Direction check - negative vel.x should move LEFT");
        }
        
        // Keep player within screen bounds (wrap around like Doodle Jump)
        if (this.pos.x < -this.width / 2) {
          this.pos.x = k.width() + this.width / 2;
        } else if (this.pos.x > k.width() + this.width / 2) {
          this.pos.x = -this.width / 2;
        }
        
        // Update highest position for scoring
        if (this.pos.y < this.highestY) {
          this.highestY = this.pos.y;
          this.score = Math.floor((startPos.y - this.highestY) / 10);
        }
        
        // Reset double jump when on ground
        if (!this.isJumping) {
          this.doubleJumpUsed = false;
        }
      },
      
      // Get player bounds for collision detection
      getBounds() {
        return {
          left: this.pos.x - this.width / 2,
          right: this.pos.x + this.width / 2,
          top: this.pos.y - this.height / 2,
          bottom: this.pos.y + this.height / 2,
        };
      },
    },
  ]);

  return player;
}