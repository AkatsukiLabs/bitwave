export function createGameManager(k: any) {
  return k.add([
    k.state("menu", [
      "menu",
      "playing",
      "paused",
      "game-over",
    ]),
    {
      isGamePaused: false,
      currentScore: 0,
      highScore: 0,
      currentSpeed: 0.15,
      foodEaten: 0,

      resetGameState() {
        this.currentScore = 0;
        this.currentSpeed = 0.15;
        this.foodEaten = 0;
        this.enterState("menu");
      },

      increaseSpeed() {
        if (this.currentSpeed > 0.05) {
          this.currentSpeed -= 0.01;
        }
      },

      addScore(points: number) {
        this.currentScore += points;
        if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
        }
      },

      saveScore() {
        // TODO: Integrate with Starknet contracts
        // Save score to blockchain
        console.log('Final score:', this.currentScore);
        console.log('High score:', this.highScore);
      }
    },
  ]);
}
