import { useCallback, useEffect, useRef } from 'react';
import { Container, Graphics, type Application } from 'pixi.js';
import type {
  ResponsiveSceneMetrics,
  SceneState,
} from '../../constants/sceneConfig';
import { usePetalEngine } from './usePetalEngine';
import type { PetalParticle, PetalSpawnLayout, StageSize } from './petalTypes';

type PetalSystemProps = {
  readonly app: Application | null;
  readonly stageSize: StageSize;
  readonly spawnLayout: PetalSpawnLayout | null;
  readonly responsiveConfig: ResponsiveSceneMetrics;
  readonly sceneState: SceneState;
  readonly dropSequence: number;
  readonly resetSequence: number;
  readonly playCount: number;
  readonly onPetalCaught: () => void;
  readonly onFallSequenceComplete: () => void;
};

function buildPetalGraphic(petal: PetalParticle) {
  const container = new Container();
  const body = new Graphics();
  const highlight = new Graphics();

  body
    .moveTo(0, -petal.height * 0.52)
    .bezierCurveTo(
      -petal.width * 0.64,
      -petal.height * 0.54,
      -petal.width * 0.9,
      petal.height * 0.08,
      0,
      petal.height * 0.54,
    )
    .bezierCurveTo(
      petal.width * 0.9,
      petal.height * 0.08,
      petal.width * 0.64,
      -petal.height * 0.54,
      0,
      -petal.height * 0.52,
    )
    .fill({
      color: petal.color,
      alpha: 0.84,
    });

  highlight
    .ellipse(-petal.width * 0.14, -petal.height * 0.22, petal.width * 0.16, petal.height * 0.14)
    .fill({
      color: 0xffffff,
      alpha: 0.28,
    });

  container.addChild(body, highlight);

  return container;
}

export function PetalSystem({
  app,
  stageSize,
  spawnLayout,
  responsiveConfig,
  sceneState,
  dropSequence,
  resetSequence,
  playCount,
  onPetalCaught,
  onFallSequenceComplete,
}: PetalSystemProps) {
  const settledLayerRef = useRef<Container | null>(null);
  const fallingLayerRef = useRef<Container | null>(null);
  const petalVisualsRef = useRef<Map<string, Container>>(new Map());
  const completionSentRef = useRef(false);
  const {
    petalsRef,
    reset,
    spawnBurst,
    update,
    tryCatchPetal,
    hasActiveFallSequence,
  } = usePetalEngine({
    responsiveConfig,
    playCount,
    stageSize,
  });

  const syncPetalVisuals = useCallback(() => {
    const settledLayer = settledLayerRef.current;
    const fallingLayer = fallingLayerRef.current;

    if (!settledLayer || !fallingLayer) {
      return;
    }

    const activeIds = new Set<string>();

    for (const petal of petalsRef.current) {
      if (!petal.isActive) {
        continue;
      }

      activeIds.add(petal.id);

      let visual = petalVisualsRef.current.get(petal.id);

      if (!visual) {
        visual = buildPetalGraphic(petal);
        petalVisualsRef.current.set(petal.id, visual);
      }

      const targetLayer = petal.isSettled ? settledLayer : fallingLayer;

      if (visual.parent !== targetLayer) {
        targetLayer.addChild(visual);
      }

      visual.position.set(petal.x, petal.y);
      visual.rotation = petal.rotation;
      visual.scale.set(petal.scale);
      visual.alpha = petal.opacity;
    }

    for (const [petalId, visual] of petalVisualsRef.current.entries()) {
      if (activeIds.has(petalId)) {
        continue;
      }

      visual.parent?.removeChild(visual);
      visual.destroy({ children: true });
      petalVisualsRef.current.delete(petalId);
    }
  }, [petalsRef]);

  useEffect(() => {
    if (!app) {
      return;
    }

    const settledLayer = new Container();
    const fallingLayer = new Container();

    settledLayer.zIndex = 2;
    fallingLayer.zIndex = 5;
    app.stage.addChild(settledLayer, fallingLayer);
    settledLayerRef.current = settledLayer;
    fallingLayerRef.current = fallingLayer;

    const handleTick = () => {
      update(app.ticker.deltaMS, sceneState);
      syncPetalVisuals();

      if (
        sceneState === 'petalsFalling' &&
        !completionSentRef.current &&
        !hasActiveFallSequence()
      ) {
        completionSentRef.current = true;
        onFallSequenceComplete();
      }
    };

    app.ticker.add(handleTick);

    return () => {
      app.ticker.remove(handleTick);
      settledLayer.destroy({ children: true });
      fallingLayer.destroy({ children: true });
      settledLayerRef.current = null;
      fallingLayerRef.current = null;
      petalVisualsRef.current.clear();
    };
  }, [app, hasActiveFallSequence, onFallSequenceComplete, sceneState, syncPetalVisuals, update]);

  useEffect(() => {
    if (!spawnLayout || dropSequence === 0) {
      return;
    }

    completionSentRef.current = false;
    spawnBurst(spawnLayout);
    syncPetalVisuals();
  }, [dropSequence, spawnBurst, spawnLayout, syncPetalVisuals]);

  useEffect(() => {
    if (resetSequence === 0) {
      return;
    }

    completionSentRef.current = false;
    reset();
    syncPetalVisuals();
  }, [reset, resetSequence, syncPetalVisuals]);

  useEffect(() => {
    if (!app) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (sceneState !== 'petalsFalling') {
        return;
      }

      const rect = app.canvas.getBoundingClientRect();
      const scaleX = app.screen.width / rect.width;
      const scaleY = app.screen.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      const caughtPetal = tryCatchPetal(x, y);

      if (!caughtPetal) {
        return;
      }

      onPetalCaught();
    };

    app.canvas.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    });

    return () => {
      app.canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [app, onPetalCaught, sceneState, tryCatchPetal]);

  return null;
}
