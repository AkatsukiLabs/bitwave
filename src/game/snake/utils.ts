export function formatScore(score: number, nbDigits: number): string {
  const scoreAsText = score.toString();
  let zerosToAdd = 0;
  if (scoreAsText.length < nbDigits) {
    zerosToAdd = nbDigits - scoreAsText.length;
  }
  let zeros = "";
  for (let i = 0; i < zerosToAdd; i++) {
    zeros += "0";
  }

  return zeros + score;
}

export function getRandomGridPosition(k: any, gridSize: number, boardWidth: number, boardHeight: number) {
  const x = k.randi(0, boardWidth);
  const y = k.randi(0, boardHeight);
  return k.vec2(x * gridSize, y * gridSize);
}

export function isPositionOccupied(position: any, snakeSegments: any[]): boolean {
  return snakeSegments.some(segment =>
    segment.gridPos.x === position.x && segment.gridPos.y === position.y
  );
}
