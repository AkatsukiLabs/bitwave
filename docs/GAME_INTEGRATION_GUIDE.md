# 🎮 KAPLAY Game Integration Guide

## 📋 Table of Contents

1. [General Structure](#general-structure)
2. [Step-by-Step Integration](#step-by-step-integration)
3. [Anatomy of a KAPLAY Game](#anatomy-of-a-kaplay-game)
4. [Patterns and Best Practices](#patterns-and-best-practices)
5. [Integration Examples](#integration-examples)

---

## General Structure

Each game should follow this folder structure:

```
bitwave/
├── public/
│   ├── fonts/
│   │   └── [game-name]/          # Game-specific fonts
│   ├── graphics/
│   │   └── [game-name]/          # Sprites and graphics
│   └── sounds/
│       └── [game-name]/          # Game audio
├── src/
│   ├── game/
│   │   └── [game-name]/          # Game logic
│   │       ├── main.ts           # Main engine
│   │       ├── constant.ts       # Constants (colors, configs)
│   │       ├── utils.ts          # Utilities
│   │       ├── entities/         # Game entities (optional)
│   │       └── ...Factory.ts     # Factories for complex objects
│   ├── components/
│   │   └── GameScreen.tsx        # Reusable component
│   └── pages/
│       └── [GameName].tsx        # Game page
```

---

## Step-by-Step Integration

### 1️⃣ Prepare the Assets

Organize all game assets in subdirectories inside `public/`:

```bash
# Example for Pacman
public/
├── fonts/pacman/
│   └── arcade-font.ttf
├── graphics/pacman/
│   ├── pacman.png
│   ├── ghosts.png
│   ├── maze.png
│   └── dots.png
└── sounds/pacman/
    ├── chomp.wav
    ├── siren.wav
    └── death.wav
```

**💡 Tip:** Use subdirectories to avoid conflicts between games.

---

### 2️⃣ Create the Game Structure

Create the game directory in `src/game/[game-name]/`:

```bash
mkdir -p src/game/pacman
```

---

### 3️⃣ Implement `main.ts`

This is the main file that initializes KAPLAY and handles the game lifecycle.

**Basic structure:**

```typescript
import kaplay from "kaplay";
import { COLORS } from "./constant";
// Import other necessary modules

interface GameOptions {
  playerName?: string;
}

let gameInstance: any = null;
let isDestroyed = false;

export function startGame(container: HTMLElement, options: GameOptions = {}) {
  // Prevent multiple initializations
  if (isDestroyed) {
    isDestroyed = false;
    gameInstance = null;
  }

  if (gameInstance && gameInstance !== 'INITIALIZING') {
    console.log('🎮 Game instance already exists');
    if (gameInstance.canvas && gameInstance.canvas.parentNode !== container) {
      container.innerHTML = '';
      container.appendChild(gameInstance.canvas);
    }
    return gameInstance;
  }

  if (gameInstance === 'INITIALIZING') {
    console.log('🎮 Game is already initializing');
    return null;
  }

  gameInstance = 'INITIALIZING';

  try {
    container.innerHTML = '';

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    console.log('🎮 Creating new KAPLAY instance...');

    // Initialize KAPLAY
    const k = kaplay({
      width: 256,          // Adjust for your game
      height: 224,         // Adjust for your game
      letterbox: true,
      touchToMouse: true,
      scale: 4,            // Adjust scaling
      pixelDensity: devicePixelRatio,
      debug: false,
      background: [0, 0, 0],
      canvas: canvas
    });

    // ========================================
    // LOAD ASSETS
    // ========================================
    k.loadSprite("sprite-name", "./graphics/game/sprite.png");
    k.loadFont("font-name", "./fonts/game/font.ttf");
    k.loadSound("sound-name", "./sounds/game/sound.wav");

    // ========================================
    // DEFINE SCENES
    // ========================================

    // Main Menu
    k.scene("main-menu", () => {
      // Menu logic
      k.add([k.text("PRESS START", { font: "font-name" })]);

      k.onKeyPress("enter", () => {
        k.go("game");
      });
    });

    // Main Game
    k.scene("game", () => {
      // Game logic
      // Create entities, handle input, etc.
    });

    // Game Over
    k.scene("game-over", () => {
      // Game over logic
      k.wait(3, () => {
        k.go("main-menu");
      });
    });

    // Start at menu
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
```

---

### 4️⃣ Create Support Files

#### `constant.ts` - Game Constants

```typescript
export const COLORS = {
  PRIMARY: "#ffff00",
  SECONDARY: "#0000ff",
  BACKGROUND: "#000000",
};

export const GAME_CONFIG = {
  PLAYER_SPEED: 100,
  ENEMY_SPEED: 80,
  SCORE_PER_ITEM: 10,
};
```

#### `utils.ts` - Utility Functions

```typescript
export function formatScore(score: number, length: number): string {
  return String(score).padStart(length, "0");
}

export function getRandomPosition(k: any, padding: number = 20) {
  return k.vec2(
    k.rand(padding, k.width() - padding),
    k.rand(padding, k.height() - padding)
  );
}
```

#### Factories (Optional) - For Complex Entities

```typescript
// playerFactory.ts
export function createPlayer(k: any, startPos: any) {
  return k.add([
    k.sprite("player"),
    k.pos(startPos),
    k.area(),
    k.body(),
    k.anchor("center"),
    {
      speed: 100,
      score: 0,
      // Custom methods
      move(direction: string) {
        // Movement logic
      }
    }
  ]);
}
```

---

### 5️⃣ Create the Game Page

Create `src/pages/[GameName].tsx`:

```typescript
import { GameScreen } from "@/components/GameScreen";

export default function Pacman() {
  return <GameScreen playerName="Player" gamePath="pacman" />;
}
```

---

### 6️⃣ Update `GameScreen.tsx`

Modify the component to accept the game path:

```typescript
import { useEffect, useRef } from 'react';

interface GameScreenProps {
  playerName?: string;
  gamePath: string; // 'duckhunt', 'pacman', 'snake', etc.
}

export function GameScreen({ playerName = "Player", gamePath }: GameScreenProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<unknown>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    const initializeGame = async () => {
      if (initializingRef.current || gameInstanceRef.current) {
        console.log('🎮 Game initialization already in progress or completed');
        return;
      }

      if (gameContainerRef.current) {
        try {
          initializingRef.current = true;
          // Dynamic import based on path
          const { startGame } = await import(`../game/${gamePath}/main`);
          const gameInstance = startGame(gameContainerRef.current, {
            playerName: playerName
          });

          if (gameInstance) {
            gameInstanceRef.current = gameInstance;
          }
        } catch (error) {
          console.error('❌ Failed to initialize game:', error);
        } finally {
          initializingRef.current = false;
        }
      }
    };

    initializeGame();

    return () => {
      if (gameInstanceRef.current) {
        try {
          console.log('🧹 Cleaning up game instance');
          import(`../game/${gamePath}/main`).then(({ destroyGame }) => {
            destroyGame();
          });
          gameInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up game:', error);
        }
      }
      initializingRef.current = false;
    };
  }, [playerName, gamePath]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div
        ref={gameContainerRef}
        style={{
          width: '1024px',
          height: '896px',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />
    </div>
  );
}
```

---

### 7️⃣ Add Route in `App.tsx`

```typescript
import Pacman from "./pages/Pacman";

// Inside the component
<Route path="/pacman" element={<Pacman />} />
```

---

### 8️⃣ Add Card in `Home.tsx`

```typescript
const games: Game[] = [
  // ... existing games
  {
    id: "pacman",
    title: "Pac-Man",
    year: "(1980)",
    image: pacmanImage,
  },
];

const handleGameClick = (gameId: string) => {
  if (gameId === "duck-hunt") {
    window.location.href = "/duck-hunt";
  } else if (gameId === "pacman") {
    window.location.href = "/pacman";
  }
  // ... more games
};
```

---

## Anatomy of a KAPLAY Game

### Main Components

1. **Scenes (`k.scene`)**: Different game states
   - `main-menu`: Main menu
   - `game`: Game in action
   - `game-over`: End game screen
   - `pause`: Pause (optional)

2. **Sprites (`k.sprite`)**: Game graphics
   ```typescript
   k.loadSprite("player", "./graphics/game/player.png", {
     sliceX: 4,  // Horizontal frames
     sliceY: 2,  // Vertical frames
     anims: {
       idle: { from: 0, to: 1, loop: true },
       run: { from: 2, to: 5, speed: 10, loop: true }
     }
   });
   ```

3. **Game Objects**: Entities with components
   ```typescript
   const player = k.add([
     k.sprite("player"),      // Visual component
     k.pos(100, 100),         // Position component
     k.area(),                // Collision component
     k.body(),                // Physics component
     k.anchor("center"),      // Anchor point
     "player",                // Tag for identification
     {
       // Custom properties
       speed: 100,
       health: 3
     }
   ]);
   ```

4. **Input Handling**
   ```typescript
   // Keyboard
   k.onKeyPress("space", () => { /* ... */ });
   k.onKeyDown("left", () => { /* ... */ });

   // Mouse/Touch
   k.onClick(() => { /* ... */ });
   k.onMouseMove((pos) => { /* ... */ });
   ```

5. **Collisions**
   ```typescript
   player.onCollide("enemy", (enemy) => {
     // Collision logic
   });
   ```

6. **Game Loop**
   ```typescript
   k.onUpdate(() => {
     // Runs every frame
     player.move(player.speed, 0);
   });
   ```

---

## Patterns and Best Practices

### ✅ DO's

1. **Use Factories for Complex Entities**
   ```typescript
   // enemyFactory.ts
   export function createEnemy(k: any, pos: any) {
     return k.add([
       k.sprite("enemy"),
       k.pos(pos),
       k.area(),
       "enemy",
       {
         ai() {
           // AI logic
         }
       }
     ]);
   }
   ```

2. **Organize Assets by Game**
   ```
   public/graphics/pacman/
   public/graphics/snake/
   ```

3. **Use Constants for Magic Numbers**
   ```typescript
   // ❌ Bad
   player.speed = 100;

   // ✅ Good
   player.speed = GAME_CONFIG.PLAYER_SPEED;
   ```

4. **Handle Cleanup Properly**
   ```typescript
   k.onSceneLeave(() => {
     // Stop sounds
     bgMusic.stop();
     // Cancel timers
     controller.cancel();
     // Reset state
     gameManager.reset();
   });
   ```

5. **Use State Machines for Complex Logic**
   ```typescript
   const player = k.add([
     k.state("idle", ["idle", "running", "jumping"]),
     // ...
   ]);

   player.onStateEnter("jumping", () => {
     player.jump();
   });
   ```

### ❌ DON'Ts

1. **Don't hardcode absolute paths**
   ```typescript
   // ❌ Bad
   k.loadSprite("player", "/Users/luis/game/player.png");

   // ✅ Good
   k.loadSprite("player", "./graphics/game/player.png");
   ```

2. **Don't initialize multiple instances**
   - Use the singleton pattern as shown in the example

3. **Don't forget cleanup**
   - Always implement `destroyGame()`

4. **Don't mix assets between games**
   - Use separate subdirectories

---

## Integration Examples

### Example 1: Snake

```
src/game/snake/
├── main.ts
├── constant.ts
├── utils.ts
└── snakeFactory.ts

public/
├── graphics/snake/
│   ├── head.png
│   ├── body.png
│   └── food.png
└── sounds/snake/
    ├── eat.wav
    └── game-over.wav
```

**KAPLAY Configuration:**
```typescript
const k = kaplay({
  width: 400,
  height: 400,
  letterbox: true,
  background: [20, 20, 20],
  // ...
});
```

### Example 2: Platformer

```
src/game/platformer/
├── main.ts
├── constant.ts
├── utils.ts
├── playerFactory.ts
├── enemyFactory.ts
└── levelLoader.ts

public/
├── graphics/platformer/
│   ├── player.png
│   ├── enemies.png
│   ├── tiles.png
│   └── background.png
└── sounds/platformer/
    ├── jump.wav
    ├── coin.wav
    └── music.mp3
```

**KAPLAY Configuration:**
```typescript
const k = kaplay({
  width: 320,
  height: 240,
  letterbox: true,
  gravity: 1200, // Gravity for platformers
  // ...
});
```

---

## Blockchain Integration (Future)

For when you want to integrate with Starknet, add these comments in strategic places:

```typescript
// In gameManagerFactory.ts
saveScore() {
  // TODO: Integrate with Starknet contracts
  // Save score to blockchain
  console.log('Final score:', this.currentScore);
}

// In duckFactory.ts (when player scores points)
this.onClick(() => {
  gameManager.currentScore += 100;

  // TODO: Integrate with Starknet contracts
  // Trigger blockchain transaction for achievement
  // triggerAchievementTransaction(100, 1);

  this.enterState("shot");
});
```

---

## Integration Checklist

- [ ] Assets organized in `public/[graphics|sounds|fonts]/[game-name]/`
- [ ] Folder structure created in `src/game/[game-name]/`
- [ ] `main.ts` implemented with singleton pattern
- [ ] Scenes defined (main-menu, game, game-over)
- [ ] Assets loaded correctly
- [ ] Game page created in `src/pages/`
- [ ] Route added in `App.tsx`
- [ ] Card added in `Home.tsx` with image
- [ ] Successful build (`npm run build`)
- [ ] Game tested in development (`npm run dev`)
- [ ] Cleanup properly implemented

---

## Useful Resources

- [KAPLAY Documentation](https://kaplayjs.com/)
- [KAPLAY Examples](https://kaplayjs.com/examples)
- Duck Hunt Implementation: `src/game/duckhunt/`

---

## Support

If you have questions about integration, check the Duck Hunt implementation in `src/game/duckhunt/` as a complete and functional reference.

Happy Coding! 🎮✨