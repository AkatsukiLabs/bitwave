import { GAME_CONFIG } from "./constant";

export function formatScore(score: number, length: number = 6): string {
  return String(Math.floor(score)).padStart(length, "0");
}

export function getRandomPlatformType(): string {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [type, probability] of Object.entries(GAME_CONFIG.PLATFORM_TYPES)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return type.toLowerCase();
    }
  }
  
  return "normal";
}

export function getRandomPlatformPosition(k: any, minY: number, maxY: number): any {
  return k.vec2(
    k.rand(20, k.width() - 20), // X position with padding
    k.rand(minY, maxY)          // Y position within range
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function distance(pos1: any, pos2: any): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isColliding(rect1: any, rect2: any): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function getPlatformColor(type: string): string {
  switch (type) {
    case "normal":
      return "#10b981";
    case "moving":
      return "#f59e0b";
    case "breaking":
      return "#ef4444";
    case "bouncy":
      return "#8b5cf6";
    default:
      return "#10b981";
  }
}

export function getHighScore(): number {
  return Number(localStorage.getItem("starkjump-high-score") || 0);
}

export function saveHighScore(score: number): void {
  const currentHigh = getHighScore();
  if (score > currentHigh) {
    localStorage.setItem("starkjump-high-score", score.toString());
  }
}

export function getDifficultyMultiplier(currentHeight: number): number {
  const difficultyLevel = Math.floor(currentHeight / GAME_CONFIG.DIFFICULTY_INCREASE_HEIGHT);
  return 1 + (difficultyLevel * 0.1); // 10% increase per difficulty level
}