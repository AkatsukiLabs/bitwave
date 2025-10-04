import kaplay from "kaplay";
import { COLORS, GAME_CONFIG } from "./constant";
import { formatScore } from "./utils";
import { createGameManager } from "./gameManagerFactory";
import { createShip } from "./shipFactory";

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
      height: GAME_CONFIG.SCREEN_HEIGHT + 120,
      letterbox: true,
      touchToMouse: true,
      scale: 1.2,
      pixelDensity: devicePixelRatio,
      debug: false,
      background: [0, 0, 0],
      canvas: canvas
    });

    // Load assets
    k.loadFont("nes", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
    // k.loadSound("shoot", "./sounds/asteroids/shoot.wav");
    // k.loadSound("explosion-large", "./sounds/asteroids/explosion-large.wav");
    // k.loadSound("explosion-medium", "./sounds/asteroids/explosion-medium.wav");
    // k.loadSound("explosion-small", "./sounds/asteroids/explosion-small.wav");
    // k.loadSound("thrust", "./sounds/asteroids/thrust.wav");
    // k.loadSound("game-over", "./sounds/asteroids/game-over.wav");

    // ========================================
    // MAIN MENU SCENE
    // ========================================
    k.scene("main-menu", () => {
      k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex(COLORS.BACKGROUND)),
      ]);

      const playerName = options.playerName || "Player";
      k.add([
        k.text(`Welcome, ${playerName}`, { font: "nes", size: 12 }),
        k.anchor("center"),
        k.pos(k.center().x, 60),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("ASTEROIDS", { font: "nes", size: 24 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 40),
        k.color(k.Color.fromHex(COLORS.SHIP)),
      ]);

      const startButton = k.add([
        k.rect(180, 30),
        k.area(),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 40),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.outline(2, k.Color.fromHex(COLORS.SHIP)),
        "start-button",
      ]);

      startButton.add([
        k.text("START GAME", { font: "nes", size: 10 }),
        k.anchor("center"),
        k.pos(0, 0),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("Controls:", { font: "nes", size: 10 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 90),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("Arrow Keys: Move", { font: "nes", size: 7 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 110),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text("SPACE: Shoot | P: Pause", { font: "nes", size: 7 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 125),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.onClick("start-button", () => {
        k.go("game");
      });

      k.onKeyPress("enter", () => {
        k.go("game");
      });
    });

    // ========================================
    // GAME SCENE
    // ========================================
    k.scene("game", () => {
      const gameManager = createGameManager(k);
      const savedHighScore = Number(k.getData("asteroids-high-score") || 0);
      gameManager.highScore = savedHighScore;

      // Game background
      k.add([
        k.rect(k.width(), GAME_CONFIG.SCREEN_HEIGHT),
        k.pos(0, 0),
        k.color(k.Color.fromHex(COLORS.BACKGROUND)),
        k.z(0),
      ]);

      // Game area borders
      const borderWidth = GAME_CONFIG.SCREEN_WIDTH;
      const borderHeight = GAME_CONFIG.SCREEN_HEIGHT;
      const borderColor = k.Color.fromHex(COLORS.SHIP);
      const borderThickness = 4;

      // Top border
      k.add([
        k.rect(borderWidth, borderThickness),
        k.pos(0, 0),
        k.color(borderColor),
        k.z(1),
      ]);

      // Bottom border
      k.add([
        k.rect(borderWidth, borderThickness),
        k.pos(0, borderHeight - borderThickness),
        k.color(borderColor),
        k.z(1),
      ]);

      // Left border
      k.add([
        k.rect(borderThickness, borderHeight),
        k.pos(0, 0),
        k.color(borderColor),
        k.z(1),
      ]);

      // Right border
      k.add([
        k.rect(borderThickness, borderHeight),
        k.pos(borderWidth - borderThickness, 0),
        k.color(borderColor),
        k.z(1),
      ]);

      // UI Panel
      const uiY = GAME_CONFIG.SCREEN_HEIGHT;
      k.add([
        k.rect(k.width(), 120),
        k.pos(0, uiY),
        k.color(k.Color.fromHex(COLORS.UI_BG)),
        k.z(10),
      ]);

      const scoreText = k.add([
        k.text(`SCORE: ${formatScore(0, 6)}`, { font: "nes", size: 8 }),
        k.pos(10, uiY + 10),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.z(11),
      ]);

      const highScoreText = k.add([
        k.text(`HIGH: ${formatScore(gameManager.highScore, 6)}`, { font: "nes", size: 8 }),
        k.pos(10, uiY + 25),
        k.color(k.Color.fromHex(COLORS.SHIP)),
        k.z(11),
      ]);

      const livesText = k.add([
        k.text(`LIVES: ${gameManager.lives}`, { font: "nes", size: 8 }),
        k.pos(200, uiY + 10),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.z(11),
      ]);

      const levelText = k.add([
        k.text(`LEVEL ${gameManager.currentLevel}`, { font: "nes", size: 8 }),
        k.pos(200, uiY + 25),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.z(11),
      ]);

      // Mobile touch controls
      const buttonSize = k.width() / 2;
      const buttonHeight = 60;
      const buttonY = uiY + 50;

      // Left Button
      const rotateLeftBtn = k.add([
        k.rect(buttonSize, buttonHeight),
        k.pos(0, buttonY),
        k.area(),
        k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
        k.opacity(0.7),
        k.z(11),
        "left-btn",
      ]);
      rotateLeftBtn.add([
        k.text("< LEFT", { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(buttonSize / 2, buttonHeight / 2),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      // Right Button
      const rotateRightBtn = k.add([
        k.rect(buttonSize, buttonHeight),
        k.pos(buttonSize, buttonY),
        k.area(),
        k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
        k.opacity(0.7),
        k.z(11),
        "right-btn",
      ]);
      rotateRightBtn.add([
        k.text("RIGHT >", { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(buttonSize / 2, buttonHeight / 2),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      // Up Button
      const thrustBtn = k.add([
        k.rect(buttonSize, buttonHeight - 10),
        k.pos(0, buttonY + buttonHeight),
        k.area(),
        k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
        k.opacity(0.7),
        k.z(11),
        "up-btn",
      ]);
      thrustBtn.add([
        k.text("UP", { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(buttonSize / 2, (buttonHeight - 10) / 2),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      // Fire Button
      const fireBtn = k.add([
        k.rect(buttonSize, buttonHeight - 10),
        k.pos(buttonSize, buttonY + buttonHeight),
        k.area(),
        k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
        k.opacity(0.7),
        k.z(11),
        "fire-btn",
      ]);
      fireBtn.add([
        k.text("FIRE", { font: "nes", size: 6 }),
        k.anchor("center"),
        k.pos(buttonSize / 2, (buttonHeight - 10) / 2),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      // Create ship
      const startPos = k.vec2(k.width() / 2, GAME_CONFIG.SCREEN_HEIGHT / 2);
      const ship = createShip(k, startPos);

      // Spawn initial asteroids
      gameManager.startLevel();

      // Input state
      let moveDirection = k.vec2(0, 0);
      let isMovingUp = false;
      let isMovingDown = false;
      let isMovingLeft = false;
      let isMovingRight = false;

      // Touch events
      k.onTouchStart((pos: any) => {
        if (rotateLeftBtn.hasPoint(pos)) isMovingLeft = true;
        if (rotateRightBtn.hasPoint(pos)) isMovingRight = true;
        if (thrustBtn.hasPoint(pos)) isMovingUp = true;
        if (fireBtn.hasPoint(pos)) ship.shoot(gameManager);
      });

      k.onTouchEnd(() => {
        isMovingUp = false;
        isMovingDown = false;
        isMovingLeft = false;
        isMovingRight = false;
      });

      // Keyboard events
      k.onKeyDown("left", () => isMovingLeft = true);
      k.onKeyDown("a", () => isMovingLeft = true);
      k.onKeyDown("right", () => isMovingRight = true);
      k.onKeyDown("d", () => isMovingRight = true);
      k.onKeyDown("up", () => isMovingUp = true);
      k.onKeyDown("w", () => isMovingUp = true);
      k.onKeyDown("down", () => isMovingDown = true);
      k.onKeyDown("s", () => isMovingDown = true);

      k.onKeyRelease("left", () => isMovingLeft = false);
      k.onKeyRelease("a", () => isMovingLeft = false);
      k.onKeyRelease("right", () => isMovingRight = false);
      k.onKeyRelease("d", () => isMovingRight = false);
      k.onKeyRelease("up", () => isMovingUp = false);
      k.onKeyRelease("w", () => isMovingUp = false);
      k.onKeyRelease("down", () => isMovingDown = false);
      k.onKeyRelease("s", () => isMovingDown = false);

      k.onKeyPress("space", () => ship.shoot(gameManager));

      k.onKeyPress("p", () => {
        if (gameManager.state === "playing") {
          gameManager.enterState("paused");
          k.getTreeRoot().paused = true;
          k.add([
            k.text("PAUSED", { font: "nes", size: 16 }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y - 30),
            k.color(k.Color.fromHex(COLORS.TEXT)),
            k.z(20),
            "paused-text",
          ]);
          k.add([
            k.text("Press P to Resume", { font: "nes", size: 8 }),
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

      gameManager.enterState("playing");

      // Game loop
      k.onUpdate(() => {
        if (gameManager.state !== "playing") return;

        // Calculate movement direction from input
        moveDirection = k.vec2(0, 0);
        if (isMovingLeft) moveDirection.x -= 1;
        if (isMovingRight) moveDirection.x += 1;
        if (isMovingUp) moveDirection.y -= 1;
        if (isMovingDown) moveDirection.y += 1;

        // Normalize diagonal movement
        if (moveDirection.len() > 0) {
          moveDirection = moveDirection.unit();
          ship.moveShip(moveDirection, k.dt());
        }

        ship.wrapScreen();

        // Update asteroids
        gameManager.asteroids.forEach((asteroid: any) => {
          asteroid.applyMovement(k.dt());
          asteroid.wrapScreen();

          // Check collision with ship
          if (!ship.isInvincible && ship.isColliding(asteroid)) {
            // k.play("explosion-large");
            gameManager.loseLife(ship);

            // TODO: Blockchain integration
            // triggerDeathTransaction(gameManager.currentScore);
          }
        });

        // Update bullets
        gameManager.bullets = gameManager.bullets.filter((bullet: any) => {
          bullet.applyMovement(k.dt());

          // Check collisions with asteroids
          for (let i = 0; i < gameManager.asteroids.length; i++) {
            const asteroid = gameManager.asteroids[i];

            if (bullet.isColliding(asteroid)) {
              // Score points
              gameManager.addScore(asteroid.points);

              // Play sound
              // k.play(`explosion-${asteroid.size}`);

              // Split asteroid
              const pieces = asteroid.split();
              gameManager.asteroids.splice(i, 1);
              gameManager.asteroids.push(...pieces);

              // Destroy bullet and asteroid
              k.destroy(bullet);
              k.destroy(asteroid);

              // TODO: Blockchain integration
              // triggerAsteroidDestroyedTransaction(asteroid.points);

              return false; // Remove bullet
            }
          }

          // Check if bullet expired
          if (bullet.isExpired()) {
            k.destroy(bullet);
            return false;
          }

          return true;
        });

        // Check level complete
        if (gameManager.asteroids.length === 0) {
          gameManager.nextLevel();
          levelText.text = `LEVEL ${gameManager.currentLevel}`;
        }

        // Update UI
        scoreText.text = `SCORE: ${formatScore(gameManager.currentScore, 6)}`;
        highScoreText.text = `HIGH: ${formatScore(gameManager.highScore, 6)}`;
        livesText.text = `LIVES: ${gameManager.lives}`;
      });

      // State change handlers
      gameManager.onStateEnter("game-over", () => {
        gameManager.saveScore();
        k.go("game-over", {
          finalScore: gameManager.currentScore,
          highScore: gameManager.highScore,
        });
      });

      k.onSceneLeave(() => {
        gameManager.asteroids.forEach((a: any) => k.destroy(a));
        gameManager.bullets.forEach((b: any) => k.destroy(b));
        gameManager.resetGameState();
      });
    });

    // ========================================
    // GAME OVER SCENE
    // ========================================
    k.scene("game-over", (data: any) => {
      const finalScore = data?.finalScore || 0;
      const currentHighScore = data?.highScore || 0;

      // Save high score
      const savedHighScore = Number(k.getData("asteroids-high-score") || 0);
      const newHighScore = Math.max(finalScore, savedHighScore, currentHighScore);
      if (finalScore > savedHighScore) {
        k.setData("asteroids-high-score", finalScore);
      }

      k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex(COLORS.BACKGROUND)),
      ]);

      // Back arrow to home
      const backArrow = k.add([
        k.text("< HOME", { font: "nes", size: 10 }),
        k.pos(10, 10),
        k.color(k.Color.fromHex(COLORS.TEXT)),
        k.area(),
        k.z(20),
        "back-arrow",
      ]);

      backArrow.onClick(() => {
        // Create DOM overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = '#000';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        const spinner = document.createElement('div');
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.border = '5px solid #333';
        spinner.style.borderTop = '5px solid #00FF00';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';

        const style = document.createElement('style');
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
        }, 300);
      });

      k.add([
        k.text("GAME OVER!", { font: "nes", size: 20 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 60),
        k.color(k.Color.fromHex(COLORS.GAME_OVER)),
      ]);

      k.add([
        k.text(`Final Score: ${formatScore(finalScore, 6)}`, { font: "nes", size: 10 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 10),
        k.color(k.Color.fromHex(COLORS.TEXT)),
      ]);

      k.add([
        k.text(`High Score: ${formatScore(newHighScore, 6)}`, { font: "nes", size: 10 }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 20),
        k.color(k.Color.fromHex(COLORS.SHIP)),
      ]);

      k.add([
        k.text("Press ENTER to play again", { font: "nes", size: 6 }),
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
