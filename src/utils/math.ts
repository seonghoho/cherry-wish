export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}
