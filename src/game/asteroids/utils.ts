export function formatScore(score: number, length: number): string {
  return String(score).padStart(length, "0");
}

export function wrapPosition(pos: any, width: number, height: number, padding: number = 0) {
  let x = pos.x;
  let y = pos.y;

  if (x < -padding) x = width + padding;
  if (x > width + padding) x = -padding;
  if (y < -padding) y = height - 60 + padding;
  if (y > height - 60 + padding) y = -padding;

  return { x, y };
}
