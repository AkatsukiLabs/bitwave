export function formatScore(score: number, length: number): string {
  return String(score).padStart(length, "0");
}

export function getRandomPosition(k: any, padding: number = 20) {
  return k.vec2(
    k.rand(padding, k.width() - padding),
    k.rand(padding, k.height() - padding)
  );
}

export function isPlayerOnPlatform(player: any, platform: any): boolean {
  const playerBounds = player.getBounds();
  const platformBounds = {
    left: platform.pos.x - platform.platformWidth / 2,
    right: platform.pos.x + platform.platformWidth / 2,
    top: platform.pos.y - platform.platformHeight / 2,
    bottom: platform.pos.y + platform.platformHeight / 2,
  };

  return (
    playerBounds.left < platformBounds.right &&
    playerBounds.right > platformBounds.left &&
    playerBounds.bottom > platformBounds.top &&
    playerBounds.top < platformBounds.bottom
  );
}

export function getRandomPlatformWidth(k: any, minWidth: number, maxWidth: number): number {
  return k.rand(minWidth, maxWidth);
}

export function getRandomPlatformX(k: any, screenWidth: number, platformWidth: number): number {
  const margin = platformWidth / 2 + 10;
  return k.rand(margin, screenWidth - margin);
}