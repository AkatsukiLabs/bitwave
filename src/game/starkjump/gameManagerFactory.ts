import { GAME_CONFIG } from "./constant";
import { getHighScore, saveHighScore, getDifficultyMultiplier } from "./utils";

export function createGameManager(k: any) {
  return k.add([
    k.state("main-menu", ["main-menu", "playing", "paused", "game-over"]),
    {
      currentScore: 0,
      highScore: getHighScore(),
      currentHeight: 0,
      highestHeight: 0,
      platforms: [] as any[],
      cameraY: 0,
      gameSpeed: 1,
      difficultyLevel: 1,
      
      // Score management
      addScore(points: number) {
        this.currentScore += points;
        this.currentHeight += points;
        
        if (this.currentHeight > this.highestHeight) {
          this.highestHeight = this.currentHeight;
        }
        
        // Update difficulty
        const newDifficultyLevel = Math.floor(this.currentHeight / GAME_CONFIG.DIFFICULTY_INCREASE_HEIGHT) + 1;
        if (newDifficultyLevel > this.difficultyLevel) {
          this.difficultyLevel = newDifficultyLevel;
          this.gameSpeed = getDifficultyMultiplier(this.currentHeight);
        }
      },
      
      // Platform management
      addPlatform(platform: any) {
        this.platforms.push(platform);
      },
      
      removePlatform(platform: any) {
        const index = this.platforms.indexOf(platform);
        if (index > -1) {
          this.platforms.splice(index, 1);
        }
      },
      
      // Camera management
      updateCamera(playerY: number) {
        const targetY = playerY - GAME_CONFIG.CAMERA_OFFSET_Y;
        this.cameraY = k.lerp(this.cameraY, targetY, GAME_CONFIG.CAMERA_FOLLOW_SPEED);
      },
      
      // Platform cleanup (remove platforms that are too far below camera)
      cleanupPlatforms() {
        const cleanupThreshold = this.cameraY + k.height() + 200;
        this.platforms = this.platforms.filter(platform => {
          if (platform.pos.y > cleanupThreshold) {
            k.destroy(platform);
            return false;
          }
          return true;
        });
      },
      
      // Generate new platforms above current height
      generateNewPlatforms() {
        const generateStartY = this.cameraY - k.height();
        const generateEndY = this.cameraY - k.height() * 2;
        
        // Import the function here to avoid circular dependency
        import("./platformFactory").then(({ generatePlatforms }) => {
          const newPlatforms = generatePlatforms(k, generateStartY, generateEndY, this.platforms);
          newPlatforms.forEach(platform => this.addPlatform(platform));
        });
      },
      
      // Game over
      gameOver() {
        this.enterState("game-over");
        this.saveScore();
      },
      
      // Save high score
      saveScore() {
        if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
          saveHighScore(this.currentScore);
        }
      },
      
      // Reset game state
      resetGameState() {
        this.currentScore = 0;
        this.currentHeight = 0;
        this.highestHeight = 0;
        this.platforms = [];
        this.cameraY = 0;
        this.gameSpeed = 1;
        this.difficultyLevel = 1;
      },
      
      // Pause/Resume
      pause() {
        this.enterState("paused");
      },
      
      resume() {
        this.enterState("playing");
      },
      
      // Get current difficulty multiplier
      getDifficultyMultiplier() {
        return getDifficultyMultiplier(this.currentHeight);
      }
    }
  ]);
}