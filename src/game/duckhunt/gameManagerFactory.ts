export function createGameManager(k: any) {
  return k.add([
    k.state("menu", [
      "menu",
      "cutscene",
      "round-start",
      "round-end",
      "hunt-start",
      "hunt-end",
      "duck-hunted",
      "duck-escaped",
    ]),
    {
      isGamePaused: false,
      currentScore: 0,
      currentRoundNb: 0,
      currentHuntNb: 0,
      preySpeed: 100,
      nbBulletsLeft: 3,
      nbDucksShotInRound: 0,

      resetGameState() {
        this.currentScore = 0;
        this.currentRoundNb = 0;
        this.currentHuntNb = 0;
        this.preySpeed = 100;
        this.nbBulletsLeft = 3;
        this.nbDucksShotInRound = 0;
        this.enterState("menu");
      },

      saveScore() {
        // TODO: Integrate with Starknet contracts
        // Save score to blockchain
        console.log('Final score:', this.currentScore);
      }
    },
  ]);
}
