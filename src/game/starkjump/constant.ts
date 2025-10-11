export const COLORS = {
  // Background colors
  BACKGROUND: "#0f0f23",        // Dark space blue
  BACKGROUND_GRADIENT: "#1a1a2e", // Slightly lighter blue
  
  // Player colors
  PLAYER: "#00d4ff",            // Bright cyan
  PLAYER_OUTLINE: "#ffffff",    // White outline
  
  // Platform colors
  PLATFORM_NORMAL: "#10b981",   // Green
  PLATFORM_MOVING: "#f59e0b",   // Orange
  PLATFORM_BREAKING: "#ef4444", // Red
  PLATFORM_BOUNCY: "#8b5cf6",   // Purple
  
  // UI colors
  TEXT_PRIMARY: "#ffffff",      // White
  TEXT_SECONDARY: "#a1a1aa",    // Gray
  UI_BACKGROUND: "#1f2937",     // Dark gray
  SCORE_HIGHLIGHT: "#fbbf24",   // Yellow
  
  // Game over
  GAME_OVER: "#dc2626",         // Red
  RESTART_BUTTON: "#3b82f6",    // Blue
};

export const GAME_CONFIG = {
  // Screen dimensions
  SCREEN_WIDTH: 320,
  SCREEN_HEIGHT: 480,
  
  // Player settings
  PLAYER_SIZE: 16,
  PLAYER_SPEED: 120,           // Horizontal movement speed
  JUMP_VELOCITY: -280,         // Initial jump velocity (negative = up)
  GRAVITY: 800,                // Gravity force
  MAX_FALL_SPEED: 400,         // Terminal velocity
  
  // Platform settings
  PLATFORM_WIDTH: 60,
  PLATFORM_HEIGHT: 12,
  PLATFORM_MIN_DISTANCE: 80,   // Minimum distance between platforms
  PLATFORM_MAX_DISTANCE: 120,  // Maximum distance between platforms
  PLATFORM_MOVE_SPEED: 30,     // Speed of moving platforms
  
  // Camera settings
  CAMERA_FOLLOW_SPEED: 0.1,    // How fast camera follows player
  CAMERA_OFFSET_Y: 100,        // How far above player to keep camera
  
  // Game progression
  SCORE_PER_HEIGHT: 1,         // Points per pixel climbed
  DIFFICULTY_INCREASE_HEIGHT: 1000, // Height where difficulty increases
  PLATFORM_SPAWN_RATE: 0.7,    // Probability of spawning platform
  
  // Platform types (probabilities)
  PLATFORM_TYPES: {
    NORMAL: 0.6,      // 60% normal platforms
    MOVING: 0.2,      // 20% moving platforms
    BREAKING: 0.15,   // 15% breaking platforms
    BOUNCY: 0.05,     // 5% bouncy platforms
  },
  
  // Physics
  FRICTION: 0.85,              // Air resistance
  BOUNCE_MULTIPLIER: 1.5,      // Extra bounce for bouncy platforms
  
  // UI
  UI_HEIGHT: 60,               // Height reserved for UI at top
  GAME_AREA_HEIGHT: 420,       // Actual playable area height
};

export const PLATFORM_TYPES = {
  NORMAL: "normal",
  MOVING: "moving", 
  BREAKING: "breaking",
  BOUNCY: "bouncy",
} as const;

export type PlatformType = typeof PLATFORM_TYPES[keyof typeof PLATFORM_TYPES];