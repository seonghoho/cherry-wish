import { useCallback, useRef } from 'react';
import {
  SCENE_CONFIG,
  type SceneState,
  type ResponsiveSceneMetrics,
} from '../../constants/sceneConfig';
import { clamp } from '../../utils/math';
import { randomBetween } from '../../utils/random';
import type {
  PetalParticle,
  PetalSpawnLayout,
  StageSize,
} from './petalTypes';

const PETAL_COLORS = [0xf2dadd, 0xeecfd4, 0xe5bec5, 0xf0d7d8] as const;

type UsePetalEngineOptions = {
  readonly responsiveConfig: ResponsiveSceneMetrics;
  readonly playCount: number;
  readonly stageSize: StageSize;
};

function createPetalId() {
  return `${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export function usePetalEngine({
  responsiveConfig,
  playCount,
  stageSize,
}: UsePetalEngineOptions) {
  const petalsRef = useRef<PetalParticle[]>([]);
  const floorYRef = useRef<number>(stageSize.height * 0.9);

  const reset = useCallback(() => {
    petalsRef.current = [];
  }, []);

  const spawnBurst = useCallback(
    (layout: PetalSpawnLayout) => {
      const petals: PetalParticle[] = [];
      floorYRef.current = layout.floorY;

      for (let index = 0; index < responsiveConfig.petalBurstCount; index += 1) {
        const baseScale = randomBetween(0.78, 1.02);
        const driftAmplitude = randomBetween(18, 38);
        const xSpread = layout.canopyWidth * 0.46;
        const startX = layout.originX + randomBetween(-xSpread, xSpread);
        const startY = layout.originY + randomBetween(-18, 10);
        const width = randomBetween(16, 22);
        const height = randomBetween(22, 28);

        petals.push({
          id: createPetalId(),
          x: startX,
          y: startY,
          vx: randomBetween(-0.28, 0.28),
          vy: randomBetween(0.86, 1.34),
          rotation: randomBetween(-0.9, 0.9),
          rotationSpeed: randomBetween(-0.025, 0.025),
          driftPhase: randomBetween(0, Math.PI * 2),
          driftAmplitude,
          driftSpeed: randomBetween(0.0021, 0.0042),
          scale: baseScale,
          baseScale,
          opacity: randomBetween(0.68, 0.9),
          width,
          height,
          catchRadius: responsiveConfig.petalCatchRadius * baseScale,
          ageMs: 0,
          caughtElapsedMs: 0,
          isCaught: false,
          isSettled: false,
          isActive: true,
          settledX: null,
          settledY: null,
          settledRotation: null,
          color: PETAL_COLORS[Math.floor(randomBetween(0, PETAL_COLORS.length))],
        });
      }

      petalsRef.current = petals;
    },
    [responsiveConfig],
  );

  const settlePetal = useCallback(
    (petal: PetalParticle) => {
      const settledX = clamp(
        petal.x + randomBetween(-SCENE_CONFIG.petals.floorScatterPx, SCENE_CONFIG.petals.floorScatterPx),
        20,
        stageSize.width - 20,
      );
      const settledY = floorYRef.current - randomBetween(0, SCENE_CONFIG.petals.floorLiftPx);
      const settledRotation = randomBetween(-0.95, 0.95);

      petal.x = settledX;
      petal.y = settledY;
      petal.vx = 0;
      petal.vy = 0;
      petal.rotation = settledRotation;
      petal.rotationSpeed = 0;
      petal.scale = petal.baseScale * randomBetween(0.78, 0.9);
      petal.opacity = clamp(petal.opacity * 0.82, 0.28, 0.62);
      petal.isSettled = true;
      petal.settledX = settledX;
      petal.settledY = settledY;
      petal.settledRotation = settledRotation;
    },
    [stageSize.width],
  );

  const update = useCallback(
    (deltaMs: number, sceneState: SceneState) => {
      if (sceneState === 'resultOpen' || sceneState === 'resetting') {
        return;
      }

      const deltaFrames = deltaMs / 16.6667;

      petalsRef.current = petalsRef.current.filter((petal) => {
        if (!petal.isActive) {
          return false;
        }

        if (petal.isCaught) {
          petal.caughtElapsedMs += deltaMs;
          const progress = clamp(petal.caughtElapsedMs / 280, 0, 1);
          petal.scale = petal.baseScale * (1 + progress * 0.24);
          petal.opacity = 1 - progress;
          petal.y -= 0.65 * deltaFrames;
          petal.rotation += 0.08 * deltaFrames;
          petal.isActive = progress < 1;

          return petal.isActive;
        }

        if (petal.isSettled) {
          return true;
        }

        petal.ageMs += deltaMs;
        petal.vy += SCENE_CONFIG.petals.gravity * deltaFrames;
        petal.vx *= SCENE_CONFIG.petals.drag;

        const driftOffset =
          Math.sin(petal.driftPhase + petal.ageMs * petal.driftSpeed) *
          petal.driftAmplitude *
          SCENE_CONFIG.petals.driftStrength *
          0.15 *
          deltaFrames;

        petal.x += petal.vx * deltaFrames + driftOffset;
        petal.y += petal.vy * deltaFrames;
        petal.rotation += petal.rotationSpeed * deltaFrames;
        petal.opacity = clamp(
          1 - Math.max(0, petal.y - stageSize.height * 0.82) / (stageSize.height * 0.28),
          0.18,
          0.94,
        );

        const petalBottom = petal.y + petal.height * petal.scale * 0.45;

        if (petalBottom >= floorYRef.current) {
          settlePetal(petal);
          return true;
        }

        const isOutOfBounds =
          petal.y > stageSize.height + 140 ||
          petal.x < -90 ||
          petal.x > stageSize.width + 90 ||
          petal.ageMs > SCENE_CONFIG.petals.maxLifetimeMs;

        petal.isActive = !isOutOfBounds;

        return petal.isActive;
      });
    },
    [settlePetal, stageSize.height, stageSize.width],
  );

  const tryCatchPetal = useCallback(
    (pointX: number, pointY: number) => {
      const activePetals = petalsRef.current.filter(
        (petal) => petal.isActive && !petal.isCaught && !petal.isSettled,
      );

      if (activePetals.length === 0) {
        return null;
      }

      let nearestPetal: PetalParticle | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const petal of activePetals) {
        const assistedRadius =
          petal.catchRadius +
          (playCount === 0 ? SCENE_CONFIG.petals.assistRadiusBonus : 6);
        const dx = pointX - petal.x;
        const dy = pointY - petal.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > assistedRadius * assistedRadius) {
          continue;
        }

        if (distanceSquared < nearestDistance) {
          nearestDistance = distanceSquared;
          nearestPetal = petal;
        }
      }

      if (!nearestPetal) {
        return null;
      }

      nearestPetal.isCaught = true;
      nearestPetal.caughtElapsedMs = 0;

      return nearestPetal;
    },
    [playCount],
  );

  const hasActiveFallSequence = useCallback(() => {
    return petalsRef.current.some(
      (petal) => petal.isActive && !petal.isSettled && !petal.isCaught,
    );
  }, []);

  return {
    petalsRef,
    reset,
    spawnBurst,
    update,
    tryCatchPetal,
    hasActiveFallSequence,
  };
}
