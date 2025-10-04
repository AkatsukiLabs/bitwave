import kaplay from "kaplay";
import { COLORS, GAME_CONFIG } from "./constant";
import { formatScore } from "./utils";
import { createGameManager } from "./gameManagerFactory";
import { createSnake } from "./snakeFactory";
import { createFood, getRandomFoodPosition } from "./foodFactory";

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
      width: GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE,
      height: GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE + 60,
      letterbox: true,
      touchToMouse: true,
      scale: 2,
      pixelDensity: devicePixelRatio,
      debug: false,
      background: [10, 10, 10],
      canvas: canvas
    });

    // Load assets (using simple shapes for now, can be replaced with sprites)
    k.loadFont("arcade", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
    // k.loadSound("eat", "./sounds/snake/eat.wav");
    // k.loadSound("game-over", "./sounds/snake/game-over.wav");

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

      k.add([
        k.text("SNAKE", { font: "arcade", size: 24 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 40),
        k.color(k.Color.fromHex(COLORS.SNAKE_HEAD)),
      ]);

      const startButton = k.add([
        k.rect(160, 30),
        k.area(),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 40),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.outline(2, k.Color.fromHex(COLORS.SNAKE_HEAD)),
        "start-button",
      ]);

      startButton.add([
        k.text("START GAME", { font: "arcade", size: 10 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("Use Arrow Keys to Move", { font: "arcade", size: 8 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 90),
        k.color(k.Color.fromHex(COLORS.TEXT)),
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

      // Game board border - just the outline lines
      const boardWidth = GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE;
      const boardHeight = GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE;
      const borderColor = k.Color.fromHex(COLORS.SNAKE_HEAD);

      // Top border
      k.add([
        k.rect(boardWidth, 3),
        k.pos(0, 0),
        k.color(borderColor),
        k.z(1),
      ]);

      // Bottom border
      k.add([
        k.rect(boardWidth, 3),
        k.pos(0, boardHeight - 3),
        k.color(borderColor),
        k.z(1),
      ]);

      // Left border
      k.add([
        k.rect(3, boardHeight),
        k.pos(0, 0),
        k.color(borderColor),
        k.z(1),
      ]);

      // Right border
      k.add([
        k.rect(3, boardHeight),
        k.pos(boardWidth - 3, 0),
        k.color(borderColor),
        k.z(1),
      ]);

      // UI Panel
      const uiY = GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE;
      k.add([
        k.rect(k.width(), 60),
        k.pos(0, uiY),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.z(10),
      ]);

      const scoreText = k.add([
        k.text(`SCORE: ${formatScore(0, 6)}`, { font: "arcade", size: 8 }),
        k.pos(10, uiY + 15),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.z(11),
      ]);

      const highScoreText = k.add([
        k.text(`HIGH: ${formatScore(gameManager.highScore, 6)}`, { font: "arcade", size: 8 }),
        k.pos(10, uiY + 35),
        k.color(k.Color.fromHex(COLORS.SNAKE_HEAD)),
        k.z(11),
      ]);

      const lengthText = k.add([
        k.text(`LENGTH: 3`, { font: "arcade", size: 8 }),
        k.pos(200, uiY + 25),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.z(11),
      ]);

      // Create snake
      const startPos = k.vec2(
        Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) * GAME_CONFIG.CELL_SIZE,
        Math.floor(GAME_CONFIG.BOARD_HEIGHT / 2) * GAME_CONFIG.CELL_SIZE
      );
      const snake = createSnake(k, startPos);

      // Create food
      let food = createFood(
        k,
        getRandomFoodPosition(k, snake.segments),
        gameManager
      );

      let moveTimer = 0;
      gameManager.enterState("playing");

      // Touch controls for mobile
      let touchStartPos: any = null;

      k.onTouchStart((pos: any) => {
        touchStartPos = pos;
      });

      k.onTouchEnd((pos: any) => {
        if (!touchStartPos || gameManager.state !== "playing") return;

        const dx = pos.x - touchStartPos.x;
        const dy = pos.y - touchStartPos.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Determine swipe direction
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 30) {
            snake.setDirection(k.vec2(1, 0)); // Right
          } else if (dx < -30) {
            snake.setDirection(k.vec2(-1, 0)); // Left
          }
        } else {
          // Vertical swipe
          if (dy > 30) {
            snake.setDirection(k.vec2(0, 1)); // Down
          } else if (dy < -30) {
            snake.setDirection(k.vec2(0, -1)); // Up
          }
        }

        touchStartPos = null;
      });

      // Input handling (keyboard)
      k.onKeyPress("up", () => {
        if (gameManager.state === "playing") {
          snake.setDirection(k.vec2(0, -1));
        }
      });

      k.onKeyPress("down", () => {
        if (gameManager.state === "playing") {
          snake.setDirection(k.vec2(0, 1));
        }
      });

      k.onKeyPress("left", () => {
        if (gameManager.state === "playing") {
          snake.setDirection(k.vec2(-1, 0));
        }
      });

      k.onKeyPress("right", () => {
        if (gameManager.state === "playing") {
          snake.setDirection(k.vec2(1, 0));
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
            k.z(20),
            "paused-text",
          ]);
          k.add([
            k.text("Press P to Resume", { font: "arcade", size: 8 }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y + 10),
            k.color(k.Color.fromHex(COLORS.TEXT)),
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

        moveTimer += k.dt();

        if (moveTimer >= gameManager.currentSpeed) {
          moveTimer = 0;

          // Move snake
          snake.move();

          // Check collisions
          if (snake.checkWallCollision() || snake.checkSelfCollision()) {
            gameManager.enterState("game-over");
            k.go("game-over", {
              finalScore: gameManager.currentScore,
              highScore: gameManager.highScore
            });
            return;
          }

          // Check food collision
          if (snake.checkFoodCollision(food.gridPos)) {
            // k.play("eat");
            snake.grow();
            gameManager.addScore(GAME_CONFIG.POINTS_PER_FOOD);
            gameManager.foodEaten++;

            // TODO: Integrate with Starknet contracts
            // Trigger blockchain transaction for food eaten
            // triggerFoodEatenTransaction(GAME_CONFIG.POINTS_PER_FOOD, gameManager.foodEaten);

            // Increase speed every 5 foods
            if (gameManager.foodEaten % 5 === 0) {
              gameManager.increaseSpeed();
            }

            // Remove old food and create new
            k.destroy(food);
            food = createFood(
              k,
              getRandomFoodPosition(k, snake.segments),
              gameManager
            );
          }

          // Update UI
          scoreText.text = `SCORE: ${formatScore(gameManager.currentScore, 6)}`;
          highScoreText.text = `HIGH: ${formatScore(gameManager.highScore, 6)}`;
          lengthText.text = `LENGTH: ${snake.segments.length}`;
        }
      });

      k.onSceneLeave(() => {
        snake.destroy();
        gameManager.resetGameState();
      });
    });

    k.scene("game-over", (data: any) => {
      const finalScore = data?.finalScore || 0;
      const currentHighScore = data?.highScore || 0;

      // Save high score
      const savedHighScore = Number(k.getData("high-score") || 0);
      const newHighScore = Math.max(finalScore, savedHighScore, currentHighScore);
      if (finalScore > savedHighScore) {
        k.setData("high-score", finalScore);
      }

      // Save score to blockchain (placeholder)
      console.log('Final score:', finalScore);
      console.log('High score:', newHighScore);

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
        // Show loading overlay with black background
        k.add([
          k.rect(k.width(), k.height()),
          k.pos(0, 0),
          k.color(0, 0, 0),
          k.z(1000),
          k.fixed(),
        ]);

        // Add loading text
        k.add([
          k.text("Returning to home...", { font: "arcade", size: 10 }),
          k.anchor("center"),
          k.pos(k.center().x, k.center().y),
          k.color(k.Color.fromHex(COLORS.TEXT)),
          k.z(1001),
          k.fixed(),
        ]);

        // Use setTimeout instead of k.wait to ensure it runs even after quit
        setTimeout(() => {
          if (gameInstance && gameInstance !== 'INITIALIZING') {
            try {
              gameInstance.quit?.();
              gameInstance = null;
              isDestroyed = true;
            } catch (error) {
              console.warn('Error during cleanup:', error);
            }
          }
          window.location.href = "/home";
        }, 200);
      });

      k.add([
        k.text("GAME OVER!", { font: "arcade", size: 20 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 60),
        k.color(k.Color.fromHex(COLORS.GAME_OVER)),
      ]);

      k.add([
        k.text(`Final Score: ${formatScore(finalScore, 6)}`, { font: "arcade", size: 10 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 10),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text(`High Score: ${formatScore(newHighScore, 6)}`, { font: "arcade", size: 10 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 20),
        k.color(k.Color.fromHex(COLORS.SNAKE_HEAD)),
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
    });

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
