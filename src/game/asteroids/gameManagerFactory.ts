import { GAME_CONFIG } from "./constant";
import { spawnAsteroidAtEdge } from "./asteroidFactory";

export function createGameManager(k: any) {
  return k.add([
    k.state("main-menu", ["main-menu", "playing", "paused", "game-over"]),
    {
      currentScore: 0,
      highScore: 0,
      currentLevel: 1,
      lives: GAME_CONFIG.STARTING_LIVES,
      asteroids: [] as any[],
      bullets: [] as any[],
      nextBonusLife: GAME_CONFIG.BONUS_LIFE_SCORE,

      addScore(points: number) {
        this.currentScore += points;

        if (this.currentScore >= this.nextBonusLife) {
          this.lives++;
          // k.play("bonus-life");
          this.nextBonusLife += GAME_CONFIG.BONUS_LIFE_SCORE;
        }

        if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
        }
      },

      nextLevel() {
        this.currentLevel++;
        const numAsteroids = Math.min(
          GAME_CONFIG.STARTING_ASTEROIDS + (this.currentLevel - 1) * 2,
          GAME_CONFIG.MAX_ASTEROIDS
        );

        for (let i = 0; i < numAsteroids; i++) {
          const asteroid = spawnAsteroidAtEdge(k, "large");
          this.asteroids.push(asteroid);
        }
      },

      startLevel() {
        const numAsteroids = Math.min(
          GAME_CONFIG.STARTING_ASTEROIDS + (this.currentLevel - 1) * 2,
          GAME_CONFIG.MAX_ASTEROIDS
        );

        for (let i = 0; i < numAsteroids; i++) {
          const asteroid = spawnAsteroidAtEdge(k, "large");
          this.asteroids.push(asteroid);
        }
      },

      loseLife(ship: any) {
        this.lives--;

        if (this.lives <= 0) {
          this.enterState("game-over");
        } else {
          // Respawn ship with invincibility
          ship.pos = k.center().sub(k.vec2(0, 30));
          ship.velocity = k.vec2(0, 0);
          ship.angle = 0;
          ship.isInvincible = true;

          k.wait(GAME_CONFIG.INVINCIBILITY_TIME, () => {
            ship.isInvincible = false;
          });
        }
      },

      saveScore() {
        // TODO: Integrate with Starknet contracts
        console.log('Final score:', this.currentScore);

        const savedHighScore = Number(k.getData("asteroids-high-score") || 0);
        if (this.currentScore > savedHighScore) {
          k.setData("asteroids-high-score", this.currentScore);
        }
      },

      resetGameState() {
        this.currentScore = 0;
        this.currentLevel = 1;
        this.lives = GAME_CONFIG.STARTING_LIVES;
        this.asteroids = [];
        this.bullets = [];
        this.nextBonusLife = GAME_CONFIG.BONUS_LIFE_SCORE;
      }
    }
  ]);
}
