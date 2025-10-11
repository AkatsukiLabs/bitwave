export const COLORS = {
  BACKGROUND: "#87CEEB", // Sky blue
  PLAYER: "#FF6B6B", // Red player
  PLATFORM: "#8B4513", // Brown platforms
  OBSTACLE: "#FF0000", // Red obstacles
  TEXT: "#FFFFFF", // White text
  UI_BG: "#2C3E50", // Dark blue UI
  COIN: "#FFD700", // Gold coins
  POWERUP: "#00FF00", // Green powerups
};

export const GAME_CONFIG = {
  // Screen dimensions
  SCREEN_WIDTH: 320,
  SCREEN_HEIGHT: 480,
  
  // Player settings
  PLAYER_SIZE: 20,
  PLAYER_JUMP_FORCE: 350, // Adjusted for closer platforms
  PLAYER_SPEED: 200,
  GRAVITY: 450, // Adjusted for closer platforms
  
  // Platform settings
  PLATFORM_WIDTH: 60,
  PLATFORM_HEIGHT: 12,
  PLATFORM_SPAWN_DISTANCE: 50, // Reduced spacing for closer platforms
  PLATFORM_MIN_WIDTH: 50,
  PLATFORM_MAX_WIDTH: 90,
  
  // Obstacle settings
  OBSTACLE_SIZE: 16,
  OBSTACLE_SPEED: 100,
  OBSTACLE_SPAWN_CHANCE: 0.3,
  
  // Game progression
  SPEED_INCREASE: 0.1,
  MAX_SPEED: 2.0,
  INITIAL_SPEED: 1.0,
  
  // Scoring
  POINTS_PER_PLATFORM: 10,
  POINTS_PER_COIN: 50,
  POINTS_PER_POWERUP: 100,
  
  // Camera
  CAMERA_OFFSET: 0.3, // How much of screen to show above player
};