import { COLORS, GAME_CONFIG } from "./constant";

export function createFood(k: any, position: any, gameManager: any) {
  const food = k.add([
    k.rect(GAME_CONFIG.CELL_SIZE - 4, GAME_CONFIG.CELL_SIZE - 4),
    k.pos(position.x, position.y),
    k.color(k.Color.fromHex(COLORS.FOOD)),
    k.anchor("center"),
    k.area(),
    "food",
    {
      gridPos: k.vec2(
        position.x / GAME_CONFIG.CELL_SIZE,
        position.y / GAME_CONFIG.CELL_SIZE
      ),
      pulse: 0,
    },
  ]);

  // Add pulsing animation
  food.onUpdate(() => {
    food.pulse += k.dt() * 5;
    const scale = 1 + Math.sin(food.pulse) * 0.1;
    food.scale = k.vec2(scale, scale);
  });

  return food;
}

export function getRandomFoodPosition(k: any, snakeSegments: any[]) {
  let position;
  let isOccupied = true;

  while (isOccupied) {
    const gridX = k.randi(0, GAME_CONFIG.BOARD_WIDTH);
    const gridY = k.randi(0, GAME_CONFIG.BOARD_HEIGHT);

    position = k.vec2(
      gridX * GAME_CONFIG.CELL_SIZE,
      gridY * GAME_CONFIG.CELL_SIZE
    );

    // Check if position is occupied by snake
    isOccupied = snakeSegments.some((segment: any) =>
      segment.gridPos.x === gridX && segment.gridPos.y === gridY
    );
  }

  return position;
}
