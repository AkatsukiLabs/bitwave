import { GAME_CONFIG, COLORS } from "./constant";

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

  const points = size === "large"
    ? GAME_CONFIG.POINTS_LARGE
    : size === "medium"
    ? GAME_CONFIG.POINTS_MEDIUM
    : GAME_CONFIG.POINTS_SMALL;

  const color = size === "large"
    ? COLORS.ASTEROID_LARGE
    : size === "medium"
    ? COLORS.ASTEROID_MEDIUM
    : COLORS.ASTEROID_SMALL;

  // Random velocity if not provided
  const vel = velocity || k.Vec2.fromAngle(k.rand(0, 360))
    .scale(k.rand(30, 80));

  // Generate random polygon vertices for irregular shape
  const vertices = [];
  const numVertices = k.rand(6, 9);
  for (let i = 0; i < numVertices; i++) {
    const angle = (360 / numVertices) * i;
    const radius = sizeValue / 2 + k.rand(-5, 5);
    vertices.push(k.Vec2.fromAngle(angle).scale(radius));
  }

  const asteroid = k.add([
    k.pos(pos),
    k.circle(sizeValue / 2),
    k.area(),
    k.rotate(k.rand(0, 360)),
    k.anchor("center"),
    k.z(3),
    "asteroid",
    {
      size,
      velocity: vel,
      points,
      rotationSpeed: k.rand(-100, 100),
      vertices: vertices,
      color: color,

      split() {
        if (size === "small") return [];

        const newSize = size === "large" ? "medium" : "small";
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
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const uiHeight = isMobile ? 180 : 120;

        if (this.pos.x < -sizeValue) this.pos.x = k.width() + sizeValue;
        if (this.pos.x > k.width() + sizeValue) this.pos.x = -sizeValue;
        if (this.pos.y < -sizeValue) this.pos.y = k.height() - uiHeight + sizeValue;
        if (this.pos.y > k.height() - uiHeight + sizeValue) this.pos.y = -sizeValue;
      }
    }
  ]);

  // Draw the irregular polygon
  asteroid.onDraw(() => {
    k.drawPolygon({
      pts: asteroid.vertices,
      color: k.Color.fromHex(asteroid.color),
    });
  });

  return asteroid;
}

// Spawn asteroids at screen edges
export function spawnAsteroidAtEdge(k: any, size: "large" | "medium" | "small") {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const uiHeight = isMobile ? 180 : 120;
  const gameHeight = k.height() - uiHeight;

  const edge = k.choose(["top", "bottom", "left", "right"]);
  let pos;

  switch (edge) {
    case "top":
      pos = k.vec2(k.rand(0, k.width()), -40);
      break;
    case "bottom":
      pos = k.vec2(k.rand(0, k.width()), gameHeight + 20);
      break;
    case "left":
      pos = k.vec2(-40, k.rand(0, gameHeight));
      break;
    case "right":
      pos = k.vec2(k.width() + 40, k.rand(0, gameHeight));
      break;
  }

  return createAsteroid(k, pos, size);
}
