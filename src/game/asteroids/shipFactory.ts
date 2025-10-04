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
      velocity: k.vec2(0, 0),
      isInvincible: false,
      isThrusting: false,

      rotateLeft(dt: number) {
        this.angle -= GAME_CONFIG.SHIP_ROTATION_SPEED * dt;
      },

      rotateRight(dt: number) {
        this.angle += GAME_CONFIG.SHIP_ROTATION_SPEED * dt;
      },

      thrust(dt: number) {
        this.isThrusting = true;
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

      stopThrust() {
        this.isThrusting = false;
      },

      applyMovement(dt: number) {
        this.pos = this.pos.add(this.velocity.scale(dt));
        this.velocity = this.velocity.scale(GAME_CONFIG.SHIP_FRICTION);
      },

      wrapScreen() {
        // Wrap around screen edges
        if (this.pos.x < 0) this.pos.x = k.width();
        if (this.pos.x > k.width()) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = k.height() - 60;
        if (this.pos.y > k.height() - 60) this.pos.y = 0;
      },

      shoot(gameManager: any) {
        if (gameManager.bullets.length >= GAME_CONFIG.MAX_BULLETS) return;

        // k.play("shoot", { volume: 0.3 });
        const bulletPos = this.pos.add(
          k.Vec2.fromAngle(this.angle).scale(GAME_CONFIG.SHIP_SIZE)
        );
        const bullet = createBullet(k, bulletPos, this.angle);
        gameManager.bullets.push(bullet);
      }
    }
  ]);

  // Visual rendering
  ship.onDraw(() => {
    // Draw ship triangle
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

    // Draw thrust flame when thrusting
    if (ship.isThrusting) {
      k.drawPolygon({
        pts: [
          k.vec2(-4, GAME_CONFIG.SHIP_SIZE),     // Left side
          k.vec2(4, GAME_CONFIG.SHIP_SIZE),      // Right side
          k.vec2(0, GAME_CONFIG.SHIP_SIZE + 8),  // Flame tip
        ],
        color: k.Color.fromHex("#FF8800"),
      });
    }
  });

  return ship;
}
