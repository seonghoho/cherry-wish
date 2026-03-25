export type PetalId = string;

export type StageSize = {
  readonly width: number;
  readonly height: number;
};

export type PetalSpawnLayout = {
  readonly originX: number;
  readonly originY: number;
  readonly canopyWidth: number;
  readonly floorY: number;
};

export type PetalParticle = {
  readonly id: PetalId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  driftPhase: number;
  driftAmplitude: number;
  driftSpeed: number;
  scale: number;
  baseScale: number;
  opacity: number;
  width: number;
  height: number;
  catchRadius: number;
  ageMs: number;
  caughtElapsedMs: number;
  isCaught: boolean;
  isSettled: boolean;
  isActive: boolean;
  settledX: number | null;
  settledY: number | null;
  settledRotation: number | null;
  color: number;
};
