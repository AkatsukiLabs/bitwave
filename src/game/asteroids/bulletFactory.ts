import { GAME_CONFIG, COLORS } from "./constant";

export function createBullet(k: any, pos: any, angle: number) {
  const velocity = k.Vec2.fromAngle(angle).scale(GAME_CONFIG.BULLET_SPEED);

  const bullet = k.add([
    k.pos(pos),
    k.circle(GAME_CONFIG.BULLET_SIZE),
    k.area(),
    k.anchor("center"),
    k.color(k.Color.fromHex(COLORS.BULLET)),
    k.z(5),
    "bullet",
    {
      velocity: velocity,
      lifetime: 0,

      applyMovement(dt: number) {
        this.pos = this.pos.add(this.velocity.scale(dt));
        this.lifetime += dt;
      },

      isExpired() {
        // Bullet expires if it goes out of bounds or exceeds lifetime
        const outOfBounds = this.pos.x < 0 || this.pos.x > k.width() ||
                           this.pos.y < 0 || this.pos.y > k.height() - 120;
        return this.lifetime >= GAME_CONFIG.BULLET_LIFETIME || outOfBounds;
      }
    }
  ]);

  return bullet;
}
