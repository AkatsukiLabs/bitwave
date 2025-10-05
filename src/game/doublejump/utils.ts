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

export function getRandomPlatformWidth(k: any, minWidth: number, maxWidth: number): number {
  return k.rand(minWidth, maxWidth);
}

export function getRandomPlatformX(k: any, screenWidth: number, platformWidth: number): number {
  return k.rand(0, screenWidth - platformWidth);
}

export function isPlayerOnPlatform(player: any, platform: any): boolean {
  const playerLeft = player.pos.x - player.width / 2;
  const playerRight = player.pos.x + player.width / 2;
  const playerBottom = player.pos.y + player.height / 2;
  
  const platformLeft = platform.pos.x - platform.platformWidth / 2;
  const platformRight = platform.pos.x + platform.platformWidth / 2;
  const platformTop = platform.pos.y - platform.platformHeight / 2;
  const platformBottom = platform.pos.y + platform.platformHeight / 2;
  
  // Check if player is horizontally aligned with platform
  const horizontalOverlap = playerLeft < platformRight && playerRight > platformLeft;
  
  // Check if player is landing on top of platform
  const verticalLanding = playerBottom >= platformTop - 10 && playerBottom <= platformBottom + 10;
  
  return horizontalOverlap && verticalLanding;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}