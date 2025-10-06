import kaplay from "kaplay";
import { COLORS, GAME_CONFIG } from "./constant";
import { formatScore } from "./utils";
import { createGameManager } from "./gameManagerFactory";
import { createPlayer } from "./playerFactory";
import {
  createPlatform,
  generatePlatforms,
  spawnPlatformAbove,
  spawnProgressivePlatforms,
  createStrategicPlatformChain,
  generatePlatformBatch,
} from "./platformFactory";
import { spawnObstacle } from "./obstacleFactory";
import { spawnPowerup } from "./powerupFactory";

interface GameOptions {
  playerName?: string;
}

interface GameInstance {
  canvas?: HTMLCanvasElement;
  quit?: () => void;
}

let gameInstance: GameInstance | null | "INITIALIZING" = null;
let isDestroyed = false;

export function startGame(container: HTMLElement, options: GameOptions = {}) {
  if (isDestroyed) {
    isDestroyed = false;
    gameInstance = null;
  }

  if (gameInstance && gameInstance !== "INITIALIZING") {
    console.log("🎮 Game instance already exists, attaching to new container");

    if (gameInstance.canvas && gameInstance.canvas.parentNode !== container) {
      container.innerHTML = "";
      container.appendChild(gameInstance.canvas);
    }

    return gameInstance;
  }

  if (gameInstance === "INITIALIZING") {
    console.log("🎮 Game is already initializing, skipping");
    return null;
  }

  gameInstance = "INITIALIZING";

  try {
    container.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    console.log("🎮 Creating new KAPLAY instance...");

    const k = kaplay({
      width: GAME_CONFIG.SCREEN_WIDTH,
      height: GAME_CONFIG.SCREEN_HEIGHT,
      letterbox: true,
      touchToMouse: true,
      scale: 2,
      pixelDensity: devicePixelRatio,
      debug: false,
      background: [135, 206, 235], // Sky blue
      canvas: canvas,
    });

    // Load font
    k.loadFont("arcade", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");

    // Load Starknet logo
    k.loadSprite("starknet-logo", "./src/assets/starknet-logo.png");

    k.scene("main-menu", () => {
      k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex(COLORS.BACKGROUND)),
      ]);

      const playerName = options.playerName || "Player";
      k.add([
        k.text(`Welcome, ${playerName}`, { font: "arcade", size: 12 }),
        k.anchor("center"),
        k.pos(k.center().x, 80),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      // Starknet Logo - Centered and prominent
      k.add([
        k.sprite("starknet-logo"),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 60),
        k.scale(1.2), // Slightly larger for better visibility
      ]);

      k.add([
        k.text("STARK JUMP", { font: "arcade", size: 20 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 20),
        k.color(k.Color.fromHex(COLORS.PLAYER)),
      ]);

      const startButton = k.add([
        k.rect(160, 30),
        k.area(),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 60),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.outline(2, k.Color.fromHex(COLORS.PLAYER)),
        "start-button",
      ]);

      startButton.add([
        k.text("START GAME", { font: "arcade", size: 10 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("Use ARROW KEYS to move left/right", {
          font: "arcade",
          size: 8,
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 110),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("Player jumps automatically!", { font: "arcade", size: 8 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 130),
        k.color(k.Color.fromHex(COLORS.PLAYER)),
      ]);

      k.onClick("start-button", () => {
        k.go("game");
      });

      k.onKeyPress("enter", () => {
        k.go("game");
      });
    });

    k.scene("game", () => {
      const gameManager = createGameManager(k);
      const savedHighScore = Number(k.getData("high-score") || 0);
      gameManager.highScore = savedHighScore;

      // Create player
      const startPos = k.vec2(k.center().x, k.height() - 150);
      const player = createPlayer(k, startPos);
      gameManager.player = player;

      // Create initial platform directly under player BEFORE starting to jump
      const initialPlatform = createPlatform(
        k,
        startPos.x,
        startPos.y + 50,
        100
      );
      gameManager.addPlatform(initialPlatform);

      // Start player jumping after platform is created
      player.jump();

      // Generate initial platforms above (more platforms for better gameplay)
      const additionalPlatforms = generatePlatforms(k, startPos.y - 100, 12);
      additionalPlatforms.forEach((platform) =>
        gameManager.addPlatform(platform)
      );

      // UI Elements (fixed to screen)
      const scoreText = k.add([
        k.text(`SCORE: ${formatScore(0, 6)}`, { font: "arcade", size: 8 }),
        k.pos(10, 10),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.fixed(),
        k.z(10),
      ]);

      const highScoreText = k.add([
        k.text(`HIGH: ${formatScore(gameManager.highScore, 6)}`, {
          font: "arcade",
          size: 8,
        }),
        k.pos(10, 30),
        k.color(k.Color.fromHex(COLORS.PLAYER)),
        k.fixed(),
        k.z(10),
      ]);

      const heightText = k.add([
        k.text(`HEIGHT: 0m`, { font: "arcade", size: 8 }),
        k.pos(10, 50),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.fixed(),
        k.z(10),
      ]);

      // Mobile control buttons (fixed to screen, bottom)
      const leftButton = k.add([
        k.rect(80, 50),
        k.area(),
        k.anchor("center"),
        k.pos(60, k.height() - 40),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.outline(2, k.Color.fromHex(COLORS.PLAYER)),
        k.fixed(),
        k.z(15),
        "left-button",
      ]);

      leftButton.add([
        k.text("←", { font: "arcade", size: 16 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      const rightButton = k.add([
        k.rect(80, 50),
        k.area(),
        k.anchor("center"),
        k.pos(k.width() - 60, k.height() - 40),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.outline(2, k.Color.fromHex(COLORS.PLAYER)),
        k.fixed(),
        k.z(15),
        "right-button",
      ]);

      rightButton.add([
        k.text("→", { font: "arcade", size: 16 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      // Touch controls
      let touchStartY = 0;
      let touchStartTime = 0;

      k.onTouchStart((pos: { x: number; y: number }) => {
        touchStartY = pos.y;
        touchStartTime = k.time();
      });

      k.onTouchEnd((pos: { x: number; y: number }) => {
        if (gameManager.state !== "playing") return;

        const touchDuration = k.time() - touchStartTime;
        const touchDistance = Math.abs(pos.y - touchStartY);

        // Quick tap to shoot (like Doodle Jump)
        if (touchDuration < 0.2 && touchDistance < 20) {
          // TODO: Implement shooting mechanics
          console.log("Shoot!");
        }
      });

      // Touch movement (tilt simulation)
      k.onTouchMove((pos: { x: number; y: number }) => {
        if (gameManager.state !== "playing") return;

        const centerX = k.width() / 2;
        const tiltAmount = (pos.x - centerX) / centerX; // -1 to 1

        if (tiltAmount < -0.1) {
          player.moveLeft();
        } else if (tiltAmount > 0.1) {
          player.moveRight();
        } else {
          player.stopMoving();
        }
      });

      // Keyboard controls (Doodle Jump style)
      k.onKeyPress("space", () => {
        if (gameManager.state === "playing") {
          // Space to shoot (like Doodle Jump)
          console.log("Shoot!");
        }
      });

      // Arrow key controls for movement
      k.onKeyDown("left", () => {
        if (gameManager.state === "playing") {
          player.moveLeft();
        }
      });

      k.onKeyDown("right", () => {
        if (gameManager.state === "playing") {
          player.moveRight();
        }
      });

      k.onKeyRelease("left", () => {
        if (gameManager.state === "playing") {
          player.stopMoving();
        }
      });

      k.onKeyRelease("right", () => {
        if (gameManager.state === "playing") {
          player.stopMoving();
        }
      });

      // Mobile button controls - press and hold to move
      leftButton.onClick(() => {
        console.log("Left button clicked");
        if (gameManager.state === "playing") {
          console.log("Moving left - current pos.x:", player.pos.x);
          // Move player directly to the left
          player.pos.x -= 30; // Move 30 pixels to the left
          console.log("Moving left - new pos.x:", player.pos.x);
        }
      });

      rightButton.onClick(() => {
        console.log("Right button clicked");
        if (gameManager.state === "playing") {
          console.log("Moving right - current pos.x:", player.pos.x);
          // Move player directly to the right
          player.pos.x += 30; // Move 30 pixels to the right
          console.log("Moving right - new pos.x:", player.pos.x);
        }
      });

      // Touch controls for mobile - same as click
      leftButton.onTouchStart(() => {
        console.log("Left button touch start");
        if (gameManager.state === "playing") {
          console.log("Moving left (touch) - current pos.x:", player.pos.x);
          player.pos.x -= 30; // Move 30 pixels to the left
          console.log("Moving left (touch) - new pos.x:", player.pos.x);
        }
      });

      rightButton.onTouchStart(() => {
        console.log("Right button touch start");
        if (gameManager.state === "playing") {
          console.log("Moving right (touch) - current pos.x:", player.pos.x);
          player.pos.x += 30; // Move 30 pixels to the right
          console.log("Moving right (touch) - new pos.x:", player.pos.x);
        }
      });

      k.onKeyPress("p", () => {
        if (gameManager.state === "playing") {
          gameManager.enterState("paused");
          k.getTreeRoot().paused = true;
          k.add([
            k.text("PAUSED", { font: "arcade", size: 16 }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y - 30),
            k.color(k.Color.fromHex(COLORS.TEXT)),
            k.fixed(),
            k.z(20),
            "paused-text",
          ]);
          k.add([
            k.text("Press P to Resume", { font: "arcade", size: 8 }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y + 10),
            k.color(k.Color.fromHex(COLORS.TEXT)),
            k.fixed(),
            k.z(20),
            "paused-text",
          ]);
        } else if (gameManager.state === "paused") {
          gameManager.enterState("playing");
          k.getTreeRoot().paused = false;
          k.destroyAll("paused-text");
        }
      });

      // Game loop
      k.onUpdate(() => {
        if (gameManager.state !== "playing") return;

        // Update player
        player.update();

        // Check if player landed on a platform (Doodle Jump style)
        const wasOnGround = !player.isJumping;
        const landedOnPlatform = player.checkGroundCollision(
          gameManager.platforms
        );

        // If player just landed on a platform, spawn new platforms above progressively
        if (landedOnPlatform && !wasOnGround) {
          // Spawn more platforms progressively based on height
          const heightProgress = Math.max(
            0,
            (startPos.y - player.pos.y) / 1000
          );
          const basePlatforms = 4;
          const progressiveBonus = Math.floor(heightProgress * 2); // More platforms as you go higher
          const platformsToSpawn = k.randi(
            basePlatforms,
            basePlatforms + progressiveBonus + 3
          );

          for (let i = 0; i < platformsToSpawn; i++) {
            const newPlatform = spawnPlatformAbove(
              k,
              gameManager.lastPlatformY -
                (i + 1) * GAME_CONFIG.PLATFORM_SPAWN_DISTANCE
            );
            gameManager.addPlatform(newPlatform);
          }
        }

        // TRULY INFINITE PLATFORM GENERATION - NO CONDITIONS, NO LIMITS
        const timeSinceLastSpawn = k.time() - gameManager.lastPlatformSpawn;
        const playerHeight = startPos.y - player.pos.y;

        // SIMPLIFIED INFINITE GENERATION - ALWAYS ACTIVE
        // Generate platforms EVERY FRAME if needed - no conditions, no limits
        if (timeSinceLastSpawn > 0.01) {
          // Every 0.01 seconds (100 times per second)
          // Always generate platforms regardless of any conditions
          const platformsToGenerate = 5; // Generate 5 platforms every frame

          for (let i = 0; i < platformsToGenerate; i++) {
            const platform = spawnPlatformAbove(k, gameManager.lastPlatformY);
            gameManager.addPlatform(platform);
          }

          gameManager.lastPlatformSpawn = k.time();

          // Debug logging every 10m
          if (Math.floor(playerHeight / 10) % 10 === 0 && playerHeight > 0) {
            console.log(
              `INFINITE GENERATION: Height=${Math.floor(
                playerHeight / 10
              )}m, Platforms=${gameManager.platforms.length}, LastPlatformY=${
                gameManager.lastPlatformY
              }`
            );
          }
        }

        // ADDITIONAL FORCE GENERATION - Every 0.5 seconds generate a large batch
        if (timeSinceLastSpawn > 0.5) {
          const batchPlatforms = generatePlatformBatch(
            k,
            gameManager.lastPlatformY,
            20
          );
          batchPlatforms.forEach((platform) =>
            gameManager.addPlatform(platform)
          );
          gameManager.lastPlatformSpawn = k.time();

          console.log(
            `BATCH GENERATION: Added 20 platforms at ${Math.floor(
              playerHeight / 10
            )}m. Total: ${gameManager.platforms.length}`
          );
        }

        // EMERGENCY GENERATION - If platform count is low, generate immediately
        if (gameManager.platforms.length < 50) {
          const emergencyPlatforms = generatePlatformBatch(
            k,
            gameManager.lastPlatformY,
            30
          );
          emergencyPlatforms.forEach((platform) =>
            gameManager.addPlatform(platform)
          );

          console.log(
            `EMERGENCY GENERATION: Added 30 platforms. Total: ${gameManager.platforms.length}`
          );
        }

        // ABSOLUTE INFINITE GENERATION - Every single frame, no matter what
        // This ensures platforms are ALWAYS being generated
        if (Math.floor(k.time() * 100) % 10 === 0) {
          // Every 0.1 seconds, regardless of other conditions
          const absolutePlatforms = generatePlatformBatch(
            k,
            gameManager.lastPlatformY,
            10
          );
          absolutePlatforms.forEach((platform) =>
            gameManager.addPlatform(platform)
          );

          if (Math.floor(playerHeight / 10) % 50 === 0 && playerHeight > 0) {
            console.log(
              `ABSOLUTE INFINITE: Height=${Math.floor(
                playerHeight / 10
              )}m, Platforms=${gameManager.platforms.length}`
            );
          }
        }

        // Update platforms
        gameManager.platforms.forEach((platform) => platform.update());

        // Update obstacles
        gameManager.obstacles.forEach((obstacle) => obstacle.update());

        // Update powerups
        gameManager.powerups.forEach((powerup) => powerup.update());

        // Check collisions with obstacles
        gameManager.obstacles.forEach((obstacle) => {
          if (player.isColliding(obstacle)) {
            gameManager.enterState("game-over");
            k.go("game-over", {
              finalScore: gameManager.currentScore,
              highScore: gameManager.highScore,
            });
            return;
          }
        });

        // Check collisions with powerups
        gameManager.powerups.forEach((powerup) => {
          if (player.isColliding(powerup)) {
            const points = powerup.collect();
            if (points > 0) {
              gameManager.addScore(points);
              gameManager.removePowerup(powerup);
            }
          }
        });

        // Spawn obstacles occasionally
        if (
          k.time() - gameManager.lastObstacleSpawn > 3 &&
          Number(k.rand()) < 0.2
        ) {
          const obstacle = spawnObstacle(k, gameManager.platforms);
          if (obstacle) {
            gameManager.addObstacle(obstacle);
          }
        }

        // Spawn powerups occasionally
        if (
          k.time() - gameManager.lastPowerupSpawn > 5 &&
          Number(k.rand()) < 0.15
        ) {
          const powerup = spawnPowerup(k, gameManager.platforms);
          if (powerup) {
            gameManager.addPowerup(powerup);
          }
        }

        // Update camera to follow player
        gameManager.updateCamera(player.pos.y);

        // Cleanup off-screen objects
        gameManager.cleanupOffScreen();

        // Update UI
        scoreText.text = `SCORE: ${formatScore(gameManager.currentScore, 6)}`;
        highScoreText.text = `HIGH: ${formatScore(gameManager.highScore, 6)}`;
        const height = Math.floor((startPos.y - player.pos.y) / 10);
        heightText.text = `HEIGHT: ${height}m`;

        // Debug info (can be removed in production)
        if (height % 10 === 0 && height > 0) {
          console.log(
            `Height: ${height}m, Platforms: ${gameManager.platforms.length}, LastPlatformY: ${gameManager.lastPlatformY}, PlayerY: ${player.pos.y}`
          );
        }

        // Check game over conditions
        const currentHeight = Math.floor((startPos.y - player.pos.y) / 10);

        // Check if player fell off screen (GAME OVER)
        if (player.pos.y > gameManager.cameraY + k.height() + 100) {
          gameManager.enterState("game-over");
          k.go("game-over", {
            finalScore: gameManager.currentScore,
            highScore: gameManager.highScore,
          });
        }

        // Check if player height is less than -5 (GAME OVER)
        if (currentHeight < -5) {
          gameManager.enterState("game-over");
          k.go("game-over", {
            finalScore: gameManager.currentScore,
            highScore: gameManager.highScore,
          });
        }
      });

      k.onSceneLeave(() => {
        gameManager.resetGameState();
      });

      gameManager.enterState("playing");
    });

    k.scene(
      "game-over",
      (data: { finalScore?: number; highScore?: number }) => {
        const finalScore = data?.finalScore || 0;
        const currentHighScore = data?.highScore || 0;

        // Save high score
        const savedHighScore = Number(k.getData("high-score") || 0);
        const newHighScore = Math.max(
          finalScore,
          savedHighScore,
          currentHighScore
        );
        if (finalScore > savedHighScore) {
          k.setData("high-score", finalScore);
        }

        k.add([
          k.rect(k.width(), k.height()),
          k.color(k.Color.fromHex(COLORS.BACKGROUND)),
        ]);

        // Back arrow to home
        const backArrow = k.add([
          k.text("< HOME", { font: "arcade", size: 10 }),
          k.pos(10, 10),
          k.color(k.Color.fromHex(COLORS.TEXT)),
          k.area(),
          k.z(20),
          "back-arrow",
        ]);

        backArrow.onClick(() => {
          // Create DOM overlay to cover everything
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100vw";
          overlay.style.height = "100vh";
          overlay.style.background = "#000";
          overlay.style.display = "flex";
          overlay.style.alignItems = "center";
          overlay.style.justifyContent = "center";
          overlay.style.zIndex = "9999";

          const spinner = document.createElement("div");
          spinner.style.width = "50px";
          spinner.style.height = "50px";
          spinner.style.border = "5px solid #333";
          spinner.style.borderTop = "5px solid #4ade80";
          spinner.style.borderRadius = "50%";
          spinner.style.animation = "spin 1s linear infinite";

          const style = document.createElement("style");
          style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
          document.head.appendChild(style);

          overlay.appendChild(spinner);
          document.body.appendChild(overlay);

          setTimeout(() => {
            if (gameInstance && gameInstance !== "INITIALIZING") {
              try {
                gameInstance.quit?.();
                gameInstance = null;
                isDestroyed = true;
              } catch (error) {
                console.warn("Error during cleanup:", error);
              }
            }
            window.location.href = "/home";
          }, 300);
        });

        k.add([
          k.text("GAME OVER!", { font: "arcade", size: 20 }),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y - 60),
          k.color(k.Color.fromHex(COLORS.OBSTACLE)),
        ]);

        k.add([
          k.text(`Final Score: ${formatScore(finalScore, 6)}`, {
            font: "arcade",
            size: 10,
          }),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y - 10),
          k.color(k.Color.fromHex(COLORS.TEXT)),
        ]);

        k.add([
          k.text(`High Score: ${formatScore(newHighScore, 6)}`, {
            font: "arcade",
            size: 10,
          }),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y + 20),
          k.color(k.Color.fromHex(COLORS.PLAYER)),
        ]);

        k.add([
          k.text("Press ENTER to play again", { font: "arcade", size: 6 }),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y + 60),
          k.color(k.Color.fromHex(COLORS.TEXT)),
        ]);

        k.onKeyPress("enter", () => {
          k.go("game");
        });

        k.wait(0.5, () => {
          k.onClick(() => {
            k.go("game");
          });
        });
      }
    );

    k.go("main-menu");

    gameInstance = k;

    return k;
  } catch (error) {
    console.error("❌ Error initializing KAPLAY:", error);
    gameInstance = null;
    throw error;
  }
}

export function destroyGame() {
  if (gameInstance && gameInstance !== "INITIALIZING") {
    try {
      console.log("🧹 Destroying KAPLAY instance...");
      gameInstance.quit?.();
      gameInstance = null;
      isDestroyed = true;
    } catch (error) {
      console.warn("Warning during game cleanup:", error);
      gameInstance = null;
      isDestroyed = true;
    }
  } else {
    gameInstance = null;
    isDestroyed = true;
  }
}
