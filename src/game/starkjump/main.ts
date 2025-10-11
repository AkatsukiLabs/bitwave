import kaplay from "kaplay";
import { COLORS, GAME_CONFIG } from "./constant";
import { formatScore } from "./utils";
import { createGameManager } from "./gameManagerFactory";
import { createPlayer } from "./playerFactory";
import { createPlatform, generatePlatforms } from "./platformFactory";

interface GameOptions {
  playerName?: string;
}

let gameInstance: any = null;
let isDestroyed = false;

export function startGame(container: HTMLElement, options: GameOptions = {}) {
  if (isDestroyed) {
    isDestroyed = false;
    gameInstance = null;
  }

  if (gameInstance && gameInstance !== 'INITIALIZING') {
    console.log('🎮 Game instance already exists, attaching to new container');

    if (gameInstance.canvas && gameInstance.canvas.parentNode !== container) {
      container.innerHTML = '';
      container.appendChild(gameInstance.canvas);
    }

    return gameInstance;
  }

  if (gameInstance === 'INITIALIZING') {
    console.log('🎮 Game is already initializing, skipping');
    return null;
  }

  gameInstance = 'INITIALIZING';

  try {
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    console.log('🎮 Creating new KAPLAY instance...');

    const k = kaplay({
      width: GAME_CONFIG.SCREEN_WIDTH,
      height: GAME_CONFIG.SCREEN_HEIGHT,
      letterbox: true,
      touchToMouse: true,
      scale: 2.5,
      pixelDensity: devicePixelRatio,
      debug: false,
      background: [15, 15, 35], // Dark space blue
      canvas: canvas
    });

    // Load assets
    k.loadFont("nes", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
    
    // Load sounds (placeholder - you can add actual sound files later)
    k.loadSound("jump", "./sounds/starkjump/jump.wav");
    k.loadSound("bounce", "./sounds/starkjump/bounce.wav");
    k.loadSound("platform-break", "./sounds/starkjump/platform-break.wav");
    k.loadSound("game-over", "./sounds/starkjump/game-over.wav");
    k.loadSound("background-music", "./sounds/starkjump/background-music.mp3");

    // Main Menu Scene
    k.scene("main-menu", () => {
      // Background gradient
      k.add([
        k.rect(k.width(), k.height()),
        k.color(COLORS.BACKGROUND),
        k.gradient([
          [0, COLORS.BACKGROUND],
          [1, COLORS.BACKGROUND_GRADIENT]
        ])
      ]);

      // Title
      k.add([
        k.text("STRKJUMP", { font: "nes", size: 16 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 60),
        k.color(COLORS.PLAYER),
        k.outline(2, k.Color.fromHex("#ffffff"))
      ]);

      // Subtitle
      k.add([
        k.text("Doodle Jump Clone", { font: "nes", size: 8 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 30),
        k.color(COLORS.TEXT_SECONDARY)
      ]);

      // Player name
      const playerName = options.playerName || "Player";
      k.add([
        k.text(`Welcome, ${playerName}!`, { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 10),
        k.color(COLORS.TEXT_PRIMARY)
      ]);

      // Start button
      const startButton = k.add([
        k.rect(120, 30),
        k.area(),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 20),
        k.color(COLORS.RESTART_BUTTON),
        k.outline(2, k.Color.fromHex("#ffffff")),
        "start-button",
      ]);

      startButton.add([
        k.text("START GAME", { font: "nes", size: 8 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(255, 255, 255),
      ]);

      // Instructions
      k.add([
        k.text("Use A/D or Arrow Keys to move", { font: "nes", size: 5 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 60),
        k.color(COLORS.TEXT_SECONDARY)
      ]);

      k.add([
        k.text("Jump on platforms to climb higher!", { font: "nes", size: 5 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 80),
        k.color(COLORS.TEXT_SECONDARY)
      ]);

      // Click to start
      k.onClick("start-button", () => {
        k.go("game");
      });

      k.onKeyPress("enter", () => {
        k.go("game");
      });
    });

    // Main Game Scene
    k.scene("game", () => {
      const gameManager = createGameManager(k);
      const player = createPlayer(k, k.vec2(k.center().x, k.height() - 100));

      // Background with parallax effect
      const background = k.add([
        k.rect(k.width(), k.height() * 3),
        k.color(COLORS.BACKGROUND),
        k.gradient([
          [0, COLORS.BACKGROUND],
          [0.5, COLORS.BACKGROUND_GRADIENT],
          [1, COLORS.BACKGROUND]
        ]),
        k.pos(0, -k.height()),
        "background"
      ]);

      // Generate initial platforms
      const initialPlatforms = generatePlatforms(k, k.height() - 50, -k.height() * 2);
      initialPlatforms.forEach(platform => gameManager.addPlatform(platform));

      // UI Elements
      const scoreText = k.add([
        k.text(`SCORE: ${formatScore(0)}`, { font: "nes", size: 8 }),
        k.pos(10, 10),
        k.color(COLORS.TEXT_PRIMARY),
        k.z(10),
      ]);

      const highScoreText = k.add([
        k.text(`HIGH: ${formatScore(gameManager.highestHeight)}`, { font: "nes", size: 6 }),
        k.pos(10, 25),
        k.color(COLORS.SCORE_HIGHLIGHT),
        k.z(10),
      ]);

      const heightText = k.add([
        k.text(`HEIGHT: ${formatScore(0)}`, { font: "nes", size: 6 }),
        k.pos(10, 40),
        k.color(COLORS.TEXT_SECONDARY),
        k.z(10),
      ]);

      // Input handling
      let isMovingLeft = false;
      let isMovingRight = false;

      // Keyboard controls
      k.onKeyDown("left", () => isMovingLeft = true);
      k.onKeyDown("a", () => isMovingLeft = true);
      k.onKeyDown("right", () => isMovingRight = true);
      k.onKeyDown("d", () => isMovingRight = true);

      k.onKeyRelease("left", () => isMovingLeft = false);
      k.onKeyRelease("a", () => isMovingLeft = false);
      k.onKeyRelease("right", () => isMovingRight = false);
      k.onKeyRelease("d", () => isMovingRight = false);

      // Pause
      k.onKeyPress("p", () => {
        if (gameManager.state === "playing") {
          gameManager.pause();
          k.add([
            k.text("PAUSED", { font: "nes", size: 12 }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y),
            k.color(COLORS.TEXT_PRIMARY),
            k.z(20),
            "paused-text"
          ]);
        } else if (gameManager.state === "paused") {
          gameManager.resume();
          const pausedText = k.get("paused-text")[0];
          if (pausedText) k.destroy(pausedText);
        }
      });

      // Game loop
      k.onUpdate(() => {
        if (gameManager.state !== "playing") return;

        // Player movement
        if (isMovingLeft) player.moveLeft(k.dt());
        if (isMovingRight) player.moveRight(k.dt());

        // Apply physics
        player.applyPhysics(k.dt());
        player.updateInvincibility(k.dt());

        // Check screen bounds
        const gameState = player.checkScreenBounds();
        if (gameState === "game-over") {
          gameManager.gameOver();
          return;
        }

        // Update camera
        gameManager.updateCamera(player.pos.y);

        // Update background position for parallax
        background.pos.y = -k.height() + (gameManager.cameraY * 0.3);

        // Update platforms
        gameManager.platforms.forEach(platform => {
          platform.updateMovement(k.dt());
        });

        // Check platform collisions
        gameManager.platforms.forEach(platform => {
          if (player.isColliding(platform) && player.velocity.y > 0) {
            // Player is falling onto platform
            if (platform.type === "normal") {
              player.landOnPlatform(platform);
              gameManager.addScore(10);
            } else if (platform.type === "moving") {
              player.landOnPlatform(platform);
              gameManager.addScore(15);
            } else if (platform.type === "breaking") {
              player.landOnPlatform(platform);
              platform.startBreaking();
              gameManager.addScore(20);
            } else if (platform.type === "bouncy") {
              player.bounceOnPlatform(platform);
              gameManager.addScore(25);
            }
          }
        });

        // Generate new platforms
        if (Math.random() < 0.01) { // 1% chance per frame
          gameManager.generateNewPlatforms();
        }

        // Cleanup old platforms
        gameManager.cleanupPlatforms();

        // Update UI
        scoreText.text = `SCORE: ${formatScore(gameManager.currentScore)}`;
        highScoreText.text = `HIGH: ${formatScore(gameManager.highestHeight)}`;
        heightText.text = `HEIGHT: ${formatScore(gameManager.currentHeight)}`;

        // Update camera position for all objects
        k.camPos(k.center().x, gameManager.cameraY);
      });

      // State change handlers
      gameManager.onStateEnter("game-over", () => {
        k.play("game-over", { volume: 0.5 });
        k.go("game-over", {
          finalScore: gameManager.currentScore,
          highScore: gameManager.highScore,
          height: gameManager.currentHeight
        });
      });

      k.onSceneLeave(() => {
        gameManager.platforms.forEach(platform => k.destroy(platform));
        gameManager.resetGameState();
      });
    });

    // Game Over Scene
    k.scene("game-over", (data: any) => {
      const finalScore = data?.finalScore || 0;
      const highScore = data?.highScore || 0;
      const height = data?.height || 0;

      // Background
      k.add([
        k.rect(k.width(), k.height()),
        k.color(COLORS.BACKGROUND)
      ]);

      // Game Over text
      k.add([
        k.text("GAME OVER!", { font: "nes", size: 14 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 60),
        k.color(COLORS.GAME_OVER),
        k.outline(2, k.Color.fromHex("#ffffff"))
      ]);

      // Final score
      k.add([
        k.text(`Final Score: ${formatScore(finalScore)}`, { font: "nes", size: 8 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 20),
        k.color(COLORS.TEXT_PRIMARY)
      ]);

      // Height reached
      k.add([
        k.text(`Height: ${formatScore(height)}`, { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 5),
        k.color(COLORS.TEXT_SECONDARY)
      ]);

      // High score
      if (finalScore >= highScore && highScore > 0) {
        k.add([
          k.text("NEW HIGH SCORE!", { font: "nes", size: 6 }),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y + 25),
          k.color(COLORS.SCORE_HIGHLIGHT)
        ]);
      }

      // Restart button
      const restartButton = k.add([
        k.rect(100, 25),
        k.area(),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 60),
        k.color(COLORS.RESTART_BUTTON),
        k.outline(2, k.Color.fromHex("#ffffff")),
        "restart-button",
      ]);

      restartButton.add([
        k.text("RESTART", { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(255, 255, 255),
      ]);

      // Menu button
      const menuButton = k.add([
        k.rect(100, 25),
        k.area(),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 90),
        k.color(COLORS.UI_BACKGROUND),
        k.outline(2, k.Color.fromHex("#ffffff")),
        "menu-button",
      ]);

      menuButton.add([
        k.text("MENU", { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(255, 255, 255),
      ]);

      // Button handlers
      k.onClick("restart-button", () => {
        k.go("game");
      });

      k.onClick("menu-button", () => {
        k.go("main-menu");
      });

      k.onKeyPress("enter", () => {
        k.go("game");
      });

      k.onKeyPress("escape", () => {
        k.go("main-menu");
      });
    });

    // Start at main menu
    k.go("main-menu");

    gameInstance = k;
    return k;

  } catch (error) {
    console.error('❌ Error initializing KAPLAY:', error);
    gameInstance = null;
    throw error;
  }
}

export function destroyGame() {
  if (gameInstance && gameInstance !== 'INITIALIZING') {
    try {
      console.log('🧹 Destroying KAPLAY instance...');
      gameInstance.quit?.();
      gameInstance = null;
      isDestroyed = true;
    } catch (error) {
      console.warn('Warning during game cleanup:', error);
      gameInstance = null;
      isDestroyed = true;
    }
  } else {
    gameInstance = null;
    isDestroyed = true;
  }
}