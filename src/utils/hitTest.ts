export function isPointInsideCircle(
  pointX: number,
  pointY: number,
  circleX: number,
  circleY: number,
  radius: number,
) {
  const dx = pointX - circleX;
  const dy = pointY - circleY;

  return dx * dx + dy * dy <= radius * radius;
}
