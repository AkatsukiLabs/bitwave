# 🚀 ASTEROIDS - Game Specification

## 📋 Overview

Asteroids is a classic arcade space shooter where the player controls a spaceship that must destroy asteroids while avoiding collisions. The game features 360° rotation physics, momentum-based movement, and progressive difficulty.

**Key Features:**
- 360° rotation and physics-based movement
- Random asteroid generation (no patterns)
- Progressive difficulty (more asteroids over time)
- Mobile-friendly touch controls + keyboard support
- High score system with blockchain integration ready

---

## 🎮 Game Mechanics

### Player Ship
- **Rotation:** Ship rotates 360° (left/right controls)
- **Thrust:** Moves forward in the direction it's facing
- **Inertia:** Ship maintains momentum (drifts in space)
- **Shooting:** Fires bullets in the direction the ship is facing
- **Screen Wrap:** Ship wraps around screen edges (exits left → appears right)

### Asteroids
- **Types:** Large → Medium → Small
- **Behavior:**
  - Spawn at random positions on screen edges
  - Float in random directions with constant velocity
  - Screen wrap (like the ship)
  - When destroyed:
    - **Large:** Splits into 2-3 medium asteroids
    - **Medium:** Splits into 2-3 small asteroids
    - **Small:** Destroyed completely
- **Collision:** Player dies on contact

### Bullets
- **Speed:** Fast, straight line
- **Lifetime:** Destroyed after 1 second or on collision
- **Limit:** Max 4 bullets on screen at once

### Scoring System
- Large Asteroid: **100 points**
- Medium Asteroid: **50 points**
- Small Asteroid: **20 points**
- Bonus every 10,000 points: Extra life

### Lives & Game Over
- Player starts with **3 lives**
- Lose a life on asteroid collision
- Brief invincibility (2 seconds) after respawn
- Game over when all lives are lost

### Difficulty Progression
- **Level 1:** 4 large asteroids
- **Each level:** +2 asteroids (max 12)
- Asteroid speed increases slightly each level
- Level advances when all asteroids are destroyed

---

## 🎨 Visual Design

### Screen Resolution
```typescript
width: 320px
height: 240px
scale: 3-4 (responsive)
letterbox: true
background: #000000 (space black)
```

### Color Palette
```typescript
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
```

### Sprites/Graphics
All graphics use **simple geometric shapes** (no complex sprites needed):

1. **Ship:** Triangle pointing up (3 vertices)
2. **Asteroids:** Irregular polygons (6-8 vertices random)
3. **Bullets:** Small circles
4. **Thrust flame:** Small triangle at ship's back (when thrusting)

**Font:** `nintendo-nes-font.ttf` (already available in project)

---

## 🕹️ Controls

### Desktop (Keyboard)
- **Arrow Left / A:** Rotate ship left
- **Arrow Right / D:** Rotate ship right
- **Arrow Up / W:** Thrust forward
- **Spacebar:** Shoot
- **P:** Pause game
- **Enter:** Start game / Restart

### Mobile (Touch)
**4-Button Layout (bottom of screen):**

```
┌─────────────────────────────────┐
│                                 │
│         [Game Area]             │
│                                 │
│                                 │
├────────────────┬────────────────┤
│  ◀️ ROTATE L   │   ROTATE R ▶️  │
├────────────────┼────────────────┤
│  🚀 THRUST     │   🔫 FIRE      │
└────────────────┴────────────────┘
```

**Button specs:**
- Each button: 50% screen width × 60px height
- Semi-transparent background (#1a1a1a with 70% opacity)
- Icon/text centered
- Haptic feedback on press (if supported)

---

## 📂 Project Structure

Following the established pattern from Duck Hunt and Snake:

```
bitwave/
├── public/
│   ├── fonts/
│   │   └── nintendo-nes-font/     # Already exists
│   ├── graphics/
│   │   └── asteroids/             # New folder
│   │       └── (optional sprites)
│   └── sounds/
│       └── asteroids/             # New folder
│           ├── shoot.wav
│           ├── explosion-large.wav
│           ├── explosion-medium.wav
│           ├── explosion-small.wav
│           ├── thrust.wav
│           └── game-over.wav
├── src/
│   ├── game/
│   │   └── asteroids/             # New game folder
│   │       ├── main.ts            # Main game engine
│   │       ├── constant.ts        # Game constants
│   │       ├── utils.ts           # Utility functions
│   │       ├── shipFactory.ts     # Player ship entity
│   │       ├── asteroidFactory.ts # Asteroid entities
│   │       ├── bulletFactory.ts   # Bullet entities
│   │       └── gameManagerFactory.ts # Game state manager
│   ├── components/
│   │   └── GameScreen.tsx         # Reuse existing
│   └── pages/
│       └── Asteroids.tsx          # New game page
```

---

## 🏗️ Implementation Details

### 1. Game Constants (`constant.ts`)

```typescript
export const COLORS = {
  BACKGROUND: "#000000",
  SHIP: "#00FF00",
  ASTEROID_LARGE: "#888888",
  ASTEROID_MEDIUM: "#999999",
  ASTEROID_SMALL: "#AAAAAA",
  BULLET: "#FFFF00",
  TEXT: "#FFFFFF",
  UI_BG: "#1a1a1a",
  GAME_OVER: "#FF0000",
};

export const GAME_CONFIG = {
  // Screen
  SCREEN_WIDTH: 320,
  SCREEN_HEIGHT: 240,

  // Ship
  SHIP_SIZE: 12,
  SHIP_ROTATION_SPEED: 200,  // degrees per second
  SHIP_THRUST_POWER: 150,
  SHIP_MAX_SPEED: 200,
  SHIP_FRICTION: 0.99,       // Momentum decay
  INVINCIBILITY_TIME: 2,     // seconds after respawn

  // Bullets
  BULLET_SPEED: 300,
  BULLET_LIFETIME: 1,        // seconds
  MAX_BULLETS: 4,

  // Asteroids
  ASTEROID_LARGE_SIZE: 40,
  ASTEROID_MEDIUM_SIZE: 20,
  ASTEROID_SMALL_SIZE: 10,
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
```

---

### 2. Ship Factory (`shipFactory.ts`)

**Ship Entity Components:**
```typescript
export function createShip(k: any, startPos: any) {
  const ship = k.add([
    k.pos(startPos),
    k.rotate(0),
    k.area({ shape: new k.Polygon([...]) }), // Triangle shape
    k.body(),
    k.anchor("center"),
    "ship",
    {
      velocity: k.vec2(0, 0),
      isInvincible: false,

      // Methods
      rotateLeft(dt: number) {
        this.angle -= GAME_CONFIG.SHIP_ROTATION_SPEED * dt;
      },

      rotateRight(dt: number) {
        this.angle += GAME_CONFIG.SHIP_ROTATION_SPEED * dt;
      },

      thrust(dt: number) {
        // Add velocity in facing direction
        const thrustVector = k.Vec2.fromAngle(this.angle).scale(
          GAME_CONFIG.SHIP_THRUST_POWER * dt
        );
        this.velocity = this.velocity.add(thrustVector);

        // Cap max speed
        if (this.velocity.len() > GAME_CONFIG.SHIP_MAX_SPEED) {
          this.velocity = this.velocity.unit().scale(GAME_CONFIG.SHIP_MAX_SPEED);
        }
      },

      applyMovement(dt: number) {
        this.pos = this.pos.add(this.velocity.scale(dt));
        this.velocity = this.velocity.scale(GAME_CONFIG.SHIP_FRICTION);
      },

      wrapScreen() {
        // Wrap around screen edges
        if (this.pos.x < 0) this.pos.x = k.width();
        if (this.pos.x > k.width()) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = k.height() - 60; // Account for UI
        if (this.pos.y > k.height() - 60) this.pos.y = 0;
      },

      shoot(gameManager: any) {
        if (gameManager.bullets.length >= GAME_CONFIG.MAX_BULLETS) return;

        k.play("shoot", { volume: 0.3 });
        const bulletPos = this.pos.add(
          k.Vec2.fromAngle(this.angle).scale(SHIP_SIZE)
        );
        const bullet = createBullet(k, bulletPos, this.angle);
        gameManager.bullets.push(bullet);
      }
    }
  ]);

  // Visual rendering
  ship.onDraw(() => {
    k.drawPolygon({
      pts: [
        k.vec2(0, -GAME_CONFIG.SHIP_SIZE),      // Top point
        k.vec2(-8, GAME_CONFIG.SHIP_SIZE),      // Bottom left
        k.vec2(8, GAME_CONFIG.SHIP_SIZE),       // Bottom right
      ],
      color: ship.isInvincible && Math.floor(k.time() * 10) % 2 === 0
        ? k.Color.fromHex("#FFFFFF")
        : k.Color.fromHex(COLORS.SHIP),
    });
  });

  return ship;
}
```

---

### 3. Asteroid Factory (`asteroidFactory.ts`)

```typescript
export function createAsteroid(
  k: any,
  pos: any,
  size: "large" | "medium" | "small",
  velocity?: any
) {
  const sizeValue = size === "large"
    ? GAME_CONFIG.ASTEROID_LARGE_SIZE
    : size === "medium"
    ? GAME_CONFIG.ASTEROID_MEDIUM_SIZE
    : GAME_CONFIG.ASTEROID_SMALL_SIZE;

  const points = GAME_CONFIG[`POINTS_${size.toUpperCase()}`];
  const color = COLORS[`ASTEROID_${size.toUpperCase()}`];

  // Random velocity if not provided
  const vel = velocity || k.Vec2.fromAngle(k.rand(0, 360))
    .scale(k.rand(30, 80));

  const asteroid = k.add([
    k.pos(pos),
    k.area({ shape: new k.Circle(sizeValue / 2) }),
    k.rotate(k.rand(0, 360)),
    k.anchor("center"),
    "asteroid",
    {
      size,
      velocity: vel,
      points,
      rotationSpeed: k.rand(-100, 100),

      split() {
        const newSize = size === "large" ? "medium" : "small";
        if (size === "small") return [];

        const numPieces = k.choose([2, 3]);
        const pieces = [];

        for (let i = 0; i < numPieces; i++) {
          const angle = (360 / numPieces) * i + k.rand(-30, 30);
          const vel = k.Vec2.fromAngle(angle).scale(k.rand(60, 100));
          pieces.push(createAsteroid(k, this.pos, newSize, vel));
        }

        return pieces;
      },

      applyMovement(dt: number) {
        this.pos = this.pos.add(this.velocity.scale(dt));
        this.angle += this.rotationSpeed * dt;
      },

      wrapScreen() {
        if (this.pos.x < -sizeValue) this.pos.x = k.width() + sizeValue;
        if (this.pos.x > k.width() + sizeValue) this.pos.x = -sizeValue;
        if (this.pos.y < -sizeValue) this.pos.y = k.height() - 60 + sizeValue;
        if (this.pos.y > k.height() - 60 + sizeValue) this.pos.y = -sizeValue;
      }
    }
  ]);

  // Random polygon shape for visual
  const vertices = [];
  const numVertices = k.rand(6, 9);
  for (let i = 0; i < numVertices; i++) {
    const angle = (360 / numVertices) * i;
    const radius = sizeValue / 2 + k.rand(-5, 5);
    vertices.push(k.Vec2.fromAngle(angle).scale(radius));
  }

  asteroid.onDraw(() => {
    k.drawPolygon({
      pts: vertices,
      color: k.Color.fromHex(color),
    });
  });

  return asteroid;
}

// Spawn asteroids at screen edges
export function spawnAsteroidAtEdge(k: any, size: "large" | "medium" | "small") {
  const edge = k.choose(["top", "bottom", "left", "right"]);
  let pos;

  switch (edge) {
    case "top":
      pos = k.vec2(k.rand(0, k.width()), -40);
      break;
    case "bottom":
      pos = k.vec2(k.rand(0, k.width()), k.height() - 20);
      break;
    case "left":
      pos = k.vec2(-40, k.rand(0, k.height() - 60));
      break;
    case "right":
      pos = k.vec2(k.width() + 40, k.rand(0, k.height() - 60));
      break;
  }

  return createAsteroid(k, pos, size);
}
```

---

### 4. Game Manager Factory (`gameManagerFactory.ts`)

```typescript
export function createGameManager(k: any) {
  return k.add([
    k.state("main-menu", ["main-menu", "playing", "paused", "game-over"]),
    {
      currentScore: 0,
      highScore: 0,
      currentLevel: 1,
      lives: GAME_CONFIG.STARTING_LIVES,
      asteroids: [] as any[],
      bullets: [] as any[],
      nextBonusLife: GAME_CONFIG.BONUS_LIFE_SCORE,

      addScore(points: number) {
        this.currentScore += points;

        if (this.currentScore >= this.nextBonusLife) {
          this.lives++;
          k.play("bonus-life");
          this.nextBonusLife += GAME_CONFIG.BONUS_LIFE_SCORE;
        }

        if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
        }
      },

      nextLevel() {
        this.currentLevel++;
        const numAsteroids = Math.min(
          GAME_CONFIG.STARTING_ASTEROIDS + (this.currentLevel - 1) * 2,
          GAME_CONFIG.MAX_ASTEROIDS
        );

        for (let i = 0; i < numAsteroids; i++) {
          const asteroid = spawnAsteroidAtEdge(k, "large");
          this.asteroids.push(asteroid);
        }
      },

      loseLife(ship: any) {
        this.lives--;

        if (this.lives <= 0) {
          this.enterState("game-over");
        } else {
          // Respawn ship with invincibility
          ship.pos = k.center();
          ship.velocity = k.vec2(0, 0);
          ship.angle = 0;
          ship.isInvincible = true;

          k.wait(GAME_CONFIG.INVINCIBILITY_TIME, () => {
            ship.isInvincible = false;
          });
        }
      },

      saveScore() {
        // TODO: Integrate with Starknet contracts
        console.log('Final score:', this.currentScore);

        const savedHighScore = Number(k.getData("asteroids-high-score") || 0);
        if (this.currentScore > savedHighScore) {
          k.setData("asteroids-high-score", this.currentScore);
        }
      },

      resetGameState() {
        this.currentScore = 0;
        this.currentLevel = 1;
        this.lives = GAME_CONFIG.STARTING_LIVES;
        this.asteroids = [];
        this.bullets = [];
        this.nextBonusLife = GAME_CONFIG.BONUS_LIFE_SCORE;
      }
    }
  ]);
}
```

---

### 5. Main Game Loop (`main.ts`)

**Scene Structure:**
1. **main-menu:** Title, player name, start button
2. **game:** Main gameplay loop
3. **game-over:** Final score, high score, restart

**Game Scene Key Logic:**
```typescript
k.scene("game", () => {
  const gameManager = createGameManager(k);
  const ship = createShip(k, k.center());

  // Load high score
  gameManager.highScore = Number(k.getData("asteroids-high-score") || 0);

  // Spawn initial asteroids
  gameManager.nextLevel();

  // UI Elements
  const scoreText = k.add([
    k.text(`SCORE: ${formatScore(0, 6)}`, { font: "nes", size: 8 }),
    k.pos(10, k.height() - 55),
    k.color(COLORS.TEXT),
    k.z(10),
  ]);

  const livesText = k.add([
    k.text(`LIVES: ${gameManager.lives}`, { font: "nes", size: 8 }),
    k.pos(k.width() - 100, k.height() - 55),
    k.color(COLORS.TEXT),
    k.z(10),
  ]);

  const levelText = k.add([
    k.text(`LEVEL ${gameManager.currentLevel}`, { font: "nes", size: 8 }),
    k.pos(k.width() / 2, k.height() - 55),
    k.anchor("center"),
    k.color(COLORS.TEXT),
    k.z(10),
  ]);

  // Mobile touch controls
  const buttonSize = k.width() / 2;
  const buttonHeight = 60;
  const buttonY = k.height() - buttonHeight * 2;

  // Rotate Left Button
  const rotateLeftBtn = k.add([
    k.rect(buttonSize, buttonHeight),
    k.pos(0, buttonY),
    k.area(),
    k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
    k.opacity(0.7),
    k.z(11),
    "rotate-left-btn",
  ]);
  rotateLeftBtn.add([
    k.text("◀️ ROTATE", { font: "nes", size: 6 }),
    k.anchor("center"),
    k.pos(buttonSize / 2, buttonHeight / 2),
    k.color(COLORS.TEXT),
  ]);

  // Rotate Right Button
  const rotateRightBtn = k.add([
    k.rect(buttonSize, buttonHeight),
    k.pos(buttonSize, buttonY),
    k.area(),
    k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
    k.opacity(0.7),
    k.z(11),
    "rotate-right-btn",
  ]);
  rotateRightBtn.add([
    k.text("ROTATE ▶️", { font: "nes", size: 6 }),
    k.anchor("center"),
    k.pos(buttonSize / 2, buttonHeight / 2),
    k.color(COLORS.TEXT),
  ]);

  // Thrust Button
  const thrustBtn = k.add([
    k.rect(buttonSize, buttonHeight),
    k.pos(0, buttonY + buttonHeight),
    k.area(),
    k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
    k.opacity(0.7),
    k.z(11),
    "thrust-btn",
  ]);
  thrustBtn.add([
    k.text("🚀 THRUST", { font: "nes", size: 6 }),
    k.anchor("center"),
    k.pos(buttonSize / 2, buttonHeight / 2),
    k.color(COLORS.TEXT),
  ]);

  // Fire Button
  const fireBtn = k.add([
    k.rect(buttonSize, buttonHeight),
    k.pos(buttonSize, buttonY + buttonHeight),
    k.area(),
    k.color(k.Color.fromHex(COLORS.UI_BG).lighten(20)),
    k.opacity(0.7),
    k.z(11),
    "fire-btn",
  ]);
  fireBtn.add([
    k.text("🔫 FIRE", { font: "nes", size: 6 }),
    k.anchor("center"),
    k.pos(buttonSize / 2, buttonHeight / 2),
    k.color(COLORS.TEXT),
  ]);

  // Input handling
  let isRotatingLeft = false;
  let isRotatingRight = false;
  let isThrusting = false;

  // Touch events
  k.onTouchStart((id: number, pos: any) => {
    if (rotateLeftBtn.hasPoint(pos)) isRotatingLeft = true;
    if (rotateRightBtn.hasPoint(pos)) isRotatingRight = true;
    if (thrustBtn.hasPoint(pos)) isThrusting = true;
    if (fireBtn.hasPoint(pos)) ship.shoot(gameManager);
  });

  k.onTouchEnd((id: number, pos: any) => {
    isRotatingLeft = false;
    isRotatingRight = false;
    isThrusting = false;
  });

  // Keyboard events
  k.onKeyDown("left", () => isRotatingLeft = true);
  k.onKeyDown("right", () => isRotatingRight = true);
  k.onKeyDown("up", () => isThrusting = true);
  k.onKeyRelease("left", () => isRotatingLeft = false);
  k.onKeyRelease("right", () => isRotatingRight = false);
  k.onKeyRelease("up", () => isThrusting = false);
  k.onKeyPress("space", () => ship.shoot(gameManager));

  // Game loop
  k.onUpdate(() => {
    if (gameManager.state !== "playing") return;

    // Ship controls
    if (isRotatingLeft) ship.rotateLeft(k.dt());
    if (isRotatingRight) ship.rotateRight(k.dt());
    if (isThrusting) ship.thrust(k.dt());

    ship.applyMovement(k.dt());
    ship.wrapScreen();

    // Update asteroids
    gameManager.asteroids.forEach((asteroid: any) => {
      asteroid.applyMovement(k.dt());
      asteroid.wrapScreen();

      // Check collision with ship
      if (!ship.isInvincible && ship.isColliding(asteroid)) {
        k.play("explosion-large");
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
          k.play(`explosion-${asteroid.size}`);

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

      return !bullet.isExpired();
    });

    // Check level complete
    if (gameManager.asteroids.length === 0) {
      gameManager.nextLevel();
      levelText.text = `LEVEL ${gameManager.currentLevel}`;
    }

    // Update UI
    scoreText.text = `SCORE: ${formatScore(gameManager.currentScore, 6)}`;
    livesText.text = `LIVES: ${gameManager.lives}`;
  });

  // State change handlers
  gameManager.onStateEnter("game-over", () => {
    k.go("game-over", {
      finalScore: gameManager.currentScore,
      highScore: gameManager.highScore,
    });
  });

  k.onSceneLeave(() => {
    gameManager.asteroids.forEach(a => k.destroy(a));
    gameManager.bullets.forEach(b => k.destroy(b));
    gameManager.resetGameState();
  });
});
```

---

## 🔊 Sound Effects

**Required audio files** (place in `public/sounds/asteroids/`):

1. **shoot.wav** - Bullet firing sound
2. **explosion-large.wav** - Large asteroid destroyed
3. **explosion-medium.wav** - Medium asteroid destroyed
4. **explosion-small.wav** - Small asteroid destroyed
5. **thrust.wav** - Ship thrust sound (looped)
6. **game-over.wav** - Game over sound

**Free resources:**
- [freesound.org](https://freesound.org) - Search "8-bit laser", "8-bit explosion"
- [zapsplat.com](https://zapsplat.com) - Retro game sounds
- Can also use simple synthetic sounds generated via Web Audio API

---

## 🔗 Blockchain Integration Points

Following the pattern from Snake and Duck Hunt:

```typescript
// When asteroid destroyed
gameManager.addScore(asteroid.points);
// TODO: Integrate with Starknet contracts
// triggerAsteroidDestroyedTransaction(asteroid.points, asteroid.size);

// When player dies
gameManager.loseLife(ship);
// TODO: Integrate with Starknet contracts
// triggerDeathTransaction(gameManager.currentScore, gameManager.lives);

// On game over
gameManager.saveScore();
// TODO: Integrate with Starknet contracts
// saveScoreToBlockchain(gameManager.currentScore, gameManager.currentLevel);
```

---

## 🚀 Integration Checklist

Following `GAME_INTEGRATION_GUIDE.md`:

- [ ] Create `src/game/asteroids/` folder structure
- [ ] Implement `main.ts` with singleton pattern
- [ ] Create `constant.ts` with colors and config
- [ ] Implement `shipFactory.ts`
- [ ] Implement `asteroidFactory.ts`
- [ ] Implement `bulletFactory.ts`
- [ ] Implement `gameManagerFactory.ts`
- [ ] Create `utils.ts` (formatScore, etc.)
- [ ] Add sound files to `public/sounds/asteroids/`
- [ ] Create page `src/pages/Asteroids.tsx`
- [ ] Update `App.tsx` with route
- [ ] Add game card to `Home.tsx`
- [ ] Test desktop controls
- [ ] Test mobile touch controls
- [ ] Test build (`npm run build`)

---

## 📱 Mobile Considerations

- **Touch Controls:** 4 large buttons (rotate L/R, thrust, fire)
- **Screen Size:** Game area adjusted for touch controls at bottom
- **Performance:** Keep max 12 asteroids to ensure smooth 60fps
- **Haptic Feedback:** Add vibration on shoot/collision (if supported)

---

## 🎯 Success Metrics

Game should achieve:
- ✅ Smooth 60fps on desktop and mobile
- ✅ Responsive touch controls (<50ms input lag)
- ✅ Progressive difficulty that keeps players engaged
- ✅ High score persistence (localStorage → blockchain)
- ✅ Addictive "one more try" loop

---

## 🔄 Future Enhancements

**Phase 2 (Optional):**
- UFO enemy that appears randomly and shoots back
- Power-ups (shield, rapid fire, slow-mo)
- Particle effects for explosions
- Background parallax stars
- Multiplayer mode (split-screen or co-op)
- Leaderboard with blockchain verification

---

## 📚 References

- **Original Asteroids (1979):** [Wikipedia](https://en.wikipedia.org/wiki/Asteroids_(video_game))
- **KAPLAY Physics:** [Docs - Body Component](https://kaplayjs.com/docs#body)
- **KAPLAY Rotation:** [Docs - Rotate Component](https://kaplayjs.com/docs#rotate)
- **Project Pattern:** See `src/game/duckhunt/` and `src/game/snake/`

---

**Ready to implement!** 🚀 This spec contains all the information needed to build Asteroids following BITWAVE's established patterns.
