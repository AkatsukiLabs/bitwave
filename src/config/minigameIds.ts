/**
 * Minigame IDs for Bitwave Platform
 * These IDs correspond to the minigame_id field in the smart contracts
 *
 * IMPORTANT: These IDs must match the IDs defined in your Cairo contracts
 */

export const MINIGAME_IDS = {
  DUCK_HUNT: 1,
  SNAKE: 2,
  ASTEROIDS: 3,
  STRKJUMP: 4,
} as const;

// Type for minigame IDs
export type MinigameId = typeof MINIGAME_IDS[keyof typeof MINIGAME_IDS];

// Map game paths to minigame IDs
export const GAME_PATH_TO_ID: Record<string, number> = {
  'duckhunt': MINIGAME_IDS.DUCK_HUNT,
  'duck-hunt': MINIGAME_IDS.DUCK_HUNT,
  'snake': MINIGAME_IDS.SNAKE,
  'asteroids': MINIGAME_IDS.ASTEROIDS,
  'strkjump': MINIGAME_IDS.STRKJUMP,
};

// Map minigame IDs to game names
export const MINIGAME_NAMES: Record<number, string> = {
  [MINIGAME_IDS.DUCK_HUNT]: 'Duck Hunt',
  [MINIGAME_IDS.SNAKE]: 'Snake',
  [MINIGAME_IDS.ASTEROIDS]: 'Asteroids',
  [MINIGAME_IDS.STRKJUMP]: 'StrkJump',
};

/**
 * Get minigame ID from game path
 */
export function getMinigameId(gamePath: string): number {
  return GAME_PATH_TO_ID[gamePath.toLowerCase()] || 0;
}

/**
 * Get minigame name from ID
 */
export function getMinigameName(minigameId: number): string {
  return MINIGAME_NAMES[minigameId] || 'Unknown Game';
}
