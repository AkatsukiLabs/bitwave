export function createGameManager(k: any) {
  return k.add([
    k.state("menu", [
      "menu",
      "playing",
      "paused",
      "game-over",
    ]),
    {
      // Game state
      isGamePaused: false,
      currentScore: 0,
      highScore: 0,
      gameSpeed: 1.0,
      platforms: [],
      obstacles: [],
      powerups: [],
      
      // Player state
      player: null,
      cameraY: 0,
      
      // Game progression
      lastPlatformY: 0,
      lastObstacleSpawn: 0,
      lastPowerupSpawn: 0,
      lastPlatformSpawn: 0,
      platformSpawnCooldown: 1.0, // Strategic platform chain spawning frequency
      
      resetGameState() {
        this.currentScore = 0;
        this.gameSpeed = 1.0;
        this.platforms = [];
        this.obstacles = [];
        this.powerups = [];
        this.player = null;
        this.cameraY = 0;
        this.lastPlatformY = 0;
        this.lastObstacleSpawn = 0;
        this.lastPowerupSpawn = 0;
        this.lastPlatformSpawn = 0;
        this.enterState("menu");
      },
      
      // Score management
      addScore(points: number) {
        this.currentScore += points;
        if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
        }
      },
      
      // Speed management
      increaseSpeed() {
        if (this.gameSpeed < 2.0) {
          this.gameSpeed += 0.1;
        }
      },
      
      // Platform management
      addPlatform(platform: any) {
        this.platforms.push(platform);
        this.lastPlatformY = platform.pos.y;
      },
      
      removePlatform(platform: any) {
        const index = this.platforms.indexOf(platform);
        if (index > -1) {
          this.platforms.splice(index, 1);
        }
      },
      
      // Obstacle management
      addObstacle(obstacle: any) {
        this.obstacles.push(obstacle);
        this.lastObstacleSpawn = k.time();
      },
      
      removeObstacle(obstacle: any) {
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
          this.obstacles.splice(index, 1);
        }
      },
      
      // Powerup management
      addPowerup(powerup: any) {
        this.powerups.push(powerup);
        this.lastPowerupSpawn = k.time();
      },
      
      removePowerup(powerup: any) {
        const index = this.powerups.indexOf(powerup);
        if (index > -1) {
          this.powerups.splice(index, 1);
        }
      },
      
      // Camera management
      updateCamera(playerY: number) {
        const targetY = playerY - k.height() * 0.3;
        this.cameraY = targetY;
        k.setCamPos(k.center().x, this.cameraY);
      },
      
      // Cleanup off-screen objects - MINIMAL CLEANUP FOR INFINITE GENERATION
      cleanupOffScreen() {
        // Only remove platforms that are VERY far below (much larger buffer)
        const platformCleanupThreshold = this.cameraY + k.height() + 2000; // Much larger buffer
        this.platforms = this.platforms.filter(platform => {
          if (platform.pos.y > platformCleanupThreshold) {
            k.destroy(platform);
            return false;
          }
          return true;
        });
        
        // Remove obstacles that are off screen
        this.obstacles = this.obstacles.filter(obstacle => {
          if (obstacle.pos.y > this.cameraY + k.height() + 100) {
            k.destroy(obstacle);
            return false;
          }
          return true;
        });
        
        // Remove powerups that are off screen
        this.powerups = this.powerups.filter(powerup => {
          if (powerup.pos.y > this.cameraY + k.height() + 100) {
            k.destroy(powerup);
            return false;
          }
          return true;
        });
        
        // NO PLATFORM LIMIT - Allow unlimited platforms for true infinite generation
        // Only clean up if we have more than 500 platforms (very high limit)
        if (this.platforms.length > 500) {
          // Remove only the oldest platforms (furthest down)
          this.platforms.sort((a, b) => b.pos.y - a.pos.y); // Sort by Y position (highest first)
          const platformsToRemove = this.platforms.slice(400); // Keep 400 platforms
          platformsToRemove.forEach(platform => {
            k.destroy(platform);
          });
          this.platforms = this.platforms.slice(0, 400);
        }
      },
      
      // Save score
      saveScore() {
        // TODO: Integrate with Starknet contracts
        // Save score to blockchain
        console.log('Final score:', this.currentScore);
        console.log('High score:', this.highScore);
      }
    },
  ]);
}