export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

export function pickRandom<T>(items: readonly T[]) {
  return items[randomInt(0, items.length - 1)];
}
