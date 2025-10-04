import { COLORS, GAME_CONFIG } from "./constant";

export function createSnake(k: any, startPos: any) {
  const segments: any[] = [];

  // Create initial snake (3 segments)
  for (let i = 0; i < 3; i++) {
    const segment = k.add([
      k.rect(GAME_CONFIG.CELL_SIZE - 2, GAME_CONFIG.CELL_SIZE - 2),
      k.pos(startPos.x - i * GAME_CONFIG.CELL_SIZE, startPos.y),
      k.color(i === 0 ? k.Color.fromHex(COLORS.SNAKE_HEAD) : k.Color.fromHex(COLORS.SNAKE_BODY)),
      k.anchor("center"),
      k.area(),
      "snake-segment",
      {
        gridPos: k.vec2(
          (startPos.x - i * GAME_CONFIG.CELL_SIZE) / GAME_CONFIG.CELL_SIZE,
          startPos.y / GAME_CONFIG.CELL_SIZE
        ),
      },
    ]);
    segments.push(segment);
  }

  return {
    segments,
    direction: k.vec2(1, 0),
    nextDirection: k.vec2(1, 0),

    move() {
      this.direction = this.nextDirection.clone();

      // Store old positions
      const oldPositions = this.segments.map((seg: any) => ({
        pos: seg.pos.clone(),
        gridPos: seg.gridPos.clone(),
      }));

      // Move head
      const head = this.segments[0];
      head.gridPos.x += this.direction.x;
      head.gridPos.y += this.direction.y;
      head.pos = k.vec2(
        head.gridPos.x * GAME_CONFIG.CELL_SIZE,
        head.gridPos.y * GAME_CONFIG.CELL_SIZE
      );

      // Move body segments to follow
      for (let i = 1; i < this.segments.length; i++) {
        this.segments[i].pos = oldPositions[i - 1].pos;
        this.segments[i].gridPos = oldPositions[i - 1].gridPos;
      }
    },

    grow() {
      const tail = this.segments[this.segments.length - 1];
      const newSegment = k.add([
        k.rect(GAME_CONFIG.CELL_SIZE - 2, GAME_CONFIG.CELL_SIZE - 2),
        k.pos(tail.pos),
        k.color(k.Color.fromHex(COLORS.SNAKE_BODY)),
        k.anchor("center"),
        k.area(),
        "snake-segment",
        {
          gridPos: tail.gridPos.clone(),
        },
      ]);
      this.segments.push(newSegment);
    },

    setDirection(newDirection: any) {
      // Prevent moving in opposite direction
      if (
        (newDirection.x !== 0 && newDirection.x !== -this.direction.x) ||
        (newDirection.y !== 0 && newDirection.y !== -this.direction.y)
      ) {
        this.nextDirection = newDirection;
      }
    },

    checkSelfCollision(): boolean {
      const head = this.segments[0];
      for (let i = 1; i < this.segments.length; i++) {
        if (
          head.gridPos.x === this.segments[i].gridPos.x &&
          head.gridPos.y === this.segments[i].gridPos.y
        ) {
          return true;
        }
      }
      return false;
    },

    checkWallCollision(): boolean {
      const head = this.segments[0];
      return (
        head.gridPos.x < 0 ||
        head.gridPos.x >= GAME_CONFIG.BOARD_WIDTH ||
        head.gridPos.y < 0 ||
        head.gridPos.y >= GAME_CONFIG.BOARD_HEIGHT
      );
    },

    checkFoodCollision(foodPos: any): boolean {
      const head = this.segments[0];
      return (
        head.gridPos.x === foodPos.x &&
        head.gridPos.y === foodPos.y
      );
    },

    destroy() {
      this.segments.forEach((segment: any) => k.destroy(segment));
      this.segments.length = 0;
    },
  };
}
