export const COLORS = {
  BACKGROUND: "#000000",      // Space black
  SHIP: "#00FF00",           // Neon green
  ASTEROID_LARGE: "#888888",  // Gray
  ASTEROID_MEDIUM: "#999999", // Light gray
  ASTEROID_SMALL: "#AAAAAA",  // Lighter gray
  BULLET: "#FFFF00",         // Yellow
  TEXT: "#FFFFFF",           // White
  UI_BG: "#1a1a1a",         // Dark gray
  GAME_OVER: "#FF0000",      // Red
};

export const GAME_CONFIG = {
  // Screen
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,

  // Ship
  SHIP_SIZE: 15,
  SHIP_ROTATION_SPEED: 250,  // degrees per second
  SHIP_THRUST_POWER: 200,
  SHIP_MAX_SPEED: 300,
  SHIP_FRICTION: 0.98,       // Momentum decay (lower = more drift)
  INVINCIBILITY_TIME: 2,     // seconds after respawn

  // Bullets
  BULLET_SPEED: 300,
  BULLET_LIFETIME: 1,        // seconds
  MAX_BULLETS: 4,
  BULLET_SIZE: 3,

  // Asteroids
  ASTEROID_LARGE_SIZE: 60,
  ASTEROID_MEDIUM_SIZE: 35,
  ASTEROID_SMALL_SIZE: 18,
  ASTEROID_BASE_SPEED: 50,
  ASTEROID_SPEED_INCREMENT: 10, // per level
  STARTING_ASTEROIDS: 4,
  MAX_ASTEROIDS: 12,

  // Scoring
  POINTS_LARGE: 100,
  POINTS_MEDIUM: 50,
  POINTS_SMALL: 20,
  BONUS_LIFE_SCORE: 10000,

  // Game
  STARTING_LIVES: 3,
};
