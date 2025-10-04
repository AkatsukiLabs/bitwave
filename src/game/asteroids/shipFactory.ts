import { GAME_CONFIG, COLORS } from "./constant";
import { createBullet } from "./bulletFactory";

export function createShip(k: any, startPos: any) {
  const ship = k.add([
    k.pos(startPos),
    k.rotate(0),
    k.polygon([
      k.vec2(0, -GAME_CONFIG.SHIP_SIZE),      // Top point
      k.vec2(-8, GAME_CONFIG.SHIP_SIZE),      // Bottom left
      k.vec2(8, GAME_CONFIG.SHIP_SIZE),       // Bottom right
    ]),
    k.area(),
    k.anchor("center"),
    k.z(10),
    "ship",
    {
      isInvincible: false,
      direction: k.vec2(0, -1), // Default facing up

      moveShip(direction: any, dt: number) {
        // Direct movement in 4 directions
        const moveVector = direction.scale(GAME_CONFIG.SHIP_MAX_SPEED * dt);
        this.pos = this.pos.add(moveVector);

        // Update rotation based on direction
        // atan2 gives angle in radians, convert to degrees
        // Subtract 90 because ship sprite points up (negative Y) at 0 degrees
        if (direction.x !== 0 || direction.y !== 0) {
          this.angle = (Math.atan2(direction.x, -direction.y) * 180 / Math.PI);
          this.direction = direction;
        }
      },

      wrapScreen() {
        // Wrap around screen edges
        if (this.pos.x < 0) this.pos.x = k.width();
        if (this.pos.x > k.width()) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = k.height() - 120;
        if (this.pos.y > k.height() - 120) this.pos.y = 0;
      },

      shoot(gameManager: any) {
        if (gameManager.bullets.length >= GAME_CONFIG.MAX_BULLETS) return;

        // k.play("shoot", { volume: 0.3 });
        // Calculate bullet spawn position and direction based on ship's current direction
        const bulletOffset = this.direction.scale(GAME_CONFIG.SHIP_SIZE + 5);
        const bulletPos = this.pos.add(bulletOffset);

        // Calculate angle from direction vector for bullet
        const bulletAngle = Math.atan2(this.direction.y, this.direction.x) * (180 / Math.PI);
        const bullet = createBullet(k, bulletPos, bulletAngle);
        gameManager.bullets.push(bullet);
      }
    }
  ]);

  // Visual rendering
  ship.onDraw(() => {
    // Draw ship triangle with invincibility blinking
    const shipColor = ship.isInvincible && Math.floor(k.time() * 10) % 2 === 0
      ? k.Color.fromHex("#FFFFFF")
      : k.Color.fromHex(COLORS.SHIP);

    k.drawPolygon({
      pts: [
        k.vec2(0, -GAME_CONFIG.SHIP_SIZE),      // Top point
        k.vec2(-8, GAME_CONFIG.SHIP_SIZE),      // Bottom left
        k.vec2(8, GAME_CONFIG.SHIP_SIZE),       // Bottom right
      ],
      color: shipColor,
    });
  });

  return ship;
}
