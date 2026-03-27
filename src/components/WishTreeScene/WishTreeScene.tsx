import { useEffect, useMemo, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import type {
  ResponsiveSceneMetrics,
  SceneState,
} from '../../constants/sceneConfig';
import { PetalSystem } from '../PetalSystem/PetalSystem';
import { useTreeAnimation } from './useTreeAnimation';
import './WishTreeScene.css';

type StageSize = {
  readonly width: number;
  readonly height: number;
};

type SpawnLayout = {
  readonly originX: number;
  readonly originY: number;
  readonly canopyWidth: number;
  readonly floorY: number;
};

type WishTreeSceneProps = {
  readonly sceneState: SceneState;
  readonly responsiveConfig: ResponsiveSceneMetrics;
  readonly shakeSequence: number;
  readonly dropSequence: number;
  readonly resetSequence: number;
  readonly playCount: number;
  readonly onTreeInteract: () => void;
  readonly onPetalCaught: () => void;
  readonly onFallSequenceComplete: () => void;
};

function buildTreeScene(
  treeRoot: Container,
  shadow: Graphics,
  stageSize: StageSize,
  treeScale: number,
) {
  const treeHeight = Math.min(stageSize.height * 0.7, stageSize.width * 0.72);
  const trunkHeight = treeHeight * 0.46;
  const trunkWidth = treeHeight * 0.105;
  const canopyWidth = treeHeight * 0.86;
  const canopyHeight = treeHeight * 0.54;
  const baseX = stageSize.width / 2;
  const baseY = stageSize.height * 0.84;

  treeRoot.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });

  treeRoot.position.set(baseX, baseY);
  treeRoot.scale.set(treeScale);
  treeRoot.rotation = 0;

  shadow
    .clear()
    .ellipse(baseX, baseY + 16, canopyWidth * 0.34, treeHeight * 0.045)
    .fill({
      color: 0xcab6a9,
      alpha: 0.16,
    });

  const trunk = new Graphics();
  const barkHighlight = new Graphics();
  const branches = new Graphics();
  const canopy = new Graphics();
  const blossomDust = new Graphics();

  trunk
    .roundRect(-trunkWidth / 2, -trunkHeight, trunkWidth, trunkHeight, trunkWidth * 0.5)
    .fill({
      color: 0x896350,
      alpha: 1,
    });

  barkHighlight
    .roundRect(-trunkWidth * 0.16, -trunkHeight * 0.96, trunkWidth * 0.18, trunkHeight * 0.86, trunkWidth * 0.12)
    .fill({
      color: 0xffffff,
      alpha: 0.08,
    });

  branches
    .moveTo(0, -trunkHeight * 0.8)
    .bezierCurveTo(
      -canopyWidth * 0.08,
      -trunkHeight * 1.02,
      -canopyWidth * 0.24,
      -treeHeight * 0.72,
      -canopyWidth * 0.42,
      -treeHeight * 0.66,
    )
    .moveTo(0, -trunkHeight * 0.84)
    .bezierCurveTo(
      canopyWidth * 0.08,
      -trunkHeight * 1.04,
      canopyWidth * 0.26,
      -treeHeight * 0.7,
      canopyWidth * 0.44,
      -treeHeight * 0.64,
    )
    .moveTo(-canopyWidth * 0.01, -trunkHeight * 0.9)
    .bezierCurveTo(
      -canopyWidth * 0.08,
      -treeHeight * 0.72,
      -canopyWidth * 0.18,
      -treeHeight * 0.62,
      -canopyWidth * 0.27,
      -treeHeight * 0.54,
    )
    .moveTo(canopyWidth * 0.02, -trunkHeight * 0.92)
    .bezierCurveTo(
      canopyWidth * 0.1,
      -treeHeight * 0.72,
      canopyWidth * 0.2,
      -treeHeight * 0.62,
      canopyWidth * 0.29,
      -treeHeight * 0.52,
    )
    .stroke({
      width: trunkWidth * 0.26,
      color: 0x7c5948,
      alpha: 0.96,
      cap: 'round',
      join: 'round',
    });

  const canopyPuffs = [
    { x: -canopyWidth * 0.28, y: -treeHeight * 0.68, radiusX: canopyWidth * 0.24, radiusY: canopyHeight * 0.28, color: 0xf3dfe2, alpha: 0.94 },
    { x: canopyWidth * 0.26, y: -treeHeight * 0.66, radiusX: canopyWidth * 0.22, radiusY: canopyHeight * 0.27, color: 0xefcdd2, alpha: 0.9 },
    { x: 0, y: -treeHeight * 0.8, radiusX: canopyWidth * 0.26, radiusY: canopyHeight * 0.32, color: 0xf4e2e2, alpha: 0.92 },
    { x: -canopyWidth * 0.08, y: -treeHeight * 0.58, radiusX: canopyWidth * 0.3, radiusY: canopyHeight * 0.28, color: 0xeac3cb, alpha: 0.78 },
    { x: canopyWidth * 0.18, y: -treeHeight * 0.5, radiusX: canopyWidth * 0.25, radiusY: canopyHeight * 0.22, color: 0xf1d5d8, alpha: 0.82 },
  ] as const;

  for (const puff of canopyPuffs) {
    canopy.ellipse(puff.x, puff.y, puff.radiusX, puff.radiusY).fill({
      color: puff.color,
      alpha: puff.alpha,
    });
  }

  const blossomDots = [
    [-canopyWidth * 0.32, -treeHeight * 0.71],
    [-canopyWidth * 0.22, -treeHeight * 0.84],
    [-canopyWidth * 0.04, -treeHeight * 0.74],
    [canopyWidth * 0.08, -treeHeight * 0.88],
    [canopyWidth * 0.28, -treeHeight * 0.72],
    [canopyWidth * 0.18, -treeHeight * 0.56],
    [-canopyWidth * 0.1, -treeHeight * 0.52],
    [0, -treeHeight * 0.64],
  ] as const;

  for (const [x, y] of blossomDots) {
    blossomDust.circle(x, y, treeHeight * 0.018).fill({
      color: 0xffffff,
      alpha: 0.22,
    });
  }

  treeRoot.addChild(trunk, barkHighlight, branches, canopy, blossomDust);

  return {
    canopyBounds: {
      left: baseX - canopyWidth * 0.48,
      top: baseY - treeHeight * 0.94,
      width: canopyWidth * 0.96,
      height: canopyHeight * 1.08,
    },
    spawnLayout: {
      originX: baseX,
      originY: baseY - treeHeight * 0.74,
      canopyWidth,
      floorY: Math.min(stageSize.height - 22, baseY + 14),
    },
  };
}

export function WishTreeScene({
  sceneState,
  responsiveConfig,
  shakeSequence,
  dropSequence,
  resetSequence,
  playCount,
  onTreeInteract,
  onPetalCaught,
  onFallSequenceComplete,
}: WishTreeSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const treeRootRef = useRef<Container | null>(null);
  const shadowRef = useRef<Graphics | null>(null);
  const appRef = useRef<Application | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [sceneReadyKey, setSceneReadyKey] = useState(0);
  const [stageSize, setStageSize] = useState<StageSize>({
    width: 0,
    height: 0,
  });
  const [spawnLayout, setSpawnLayout] = useState<SpawnLayout | null>(null);
  const [canopyBounds, setCanopyBounds] = useState<{
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  } | null>(null);
  const preventDragStart = useMemo(
    () => (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
    },
    [],
  );

  useTreeAnimation({
    treeRef: treeRootRef,
    sceneReadyKey,
    shakeSequence,
  });

  useEffect(() => {
    let isCancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    const hostElement = hostRef.current;

    if (!hostElement) {
      return;
    }

    const sceneHost = hostElement;
    const application = new Application();

    async function initializePixi() {
      await application.init({
        resizeTo: sceneHost,
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        resolution:
          typeof window === 'undefined'
            ? 1
            : Math.min(window.devicePixelRatio || 1, 2),
      });

      if (isCancelled) {
        application.destroy(true, { children: true });
        return;
      }

      sceneHost.appendChild(application.canvas);
      application.stage.sortableChildren = true;

      const shadow = new Graphics();
      const treeRoot = new Container();

      shadow.zIndex = 1;
      treeRoot.zIndex = 3;
      application.stage.addChild(shadow, treeRoot);
      shadowRef.current = shadow;
      treeRootRef.current = treeRoot;
      appRef.current = application;
      setApp(application);

      const updateLayout = () => {
        const width = sceneHost.clientWidth;
        const height = sceneHost.clientHeight;

        if (width === 0 || height === 0 || !treeRootRef.current || !shadowRef.current) {
          return;
        }

        const nextStageSize = { width, height };
        const layout = buildTreeScene(
          treeRootRef.current,
          shadowRef.current,
          nextStageSize,
          responsiveConfig.treeScale,
        );

        setStageSize(nextStageSize);
        setSpawnLayout(layout.spawnLayout);
        setCanopyBounds(layout.canopyBounds);
        setSceneReadyKey((currentValue) => currentValue + 1);
      };

      updateLayout();
      resizeObserver = new ResizeObserver(updateLayout);
      resizeObserver.observe(sceneHost);
    }

    void initializePixi();

    return () => {
      isCancelled = true;
      resizeObserver?.disconnect();
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
      treeRootRef.current = null;
      shadowRef.current = null;
      setApp(null);
    };
  }, [responsiveConfig.treeScale]);

  const canopyButtonStyle = useMemo(() => {
    if (!canopyBounds) {
      return undefined;
    }

    const horizontalInset = responsiveConfig.isMobile ? 18 : 10;
    const verticalInset = responsiveConfig.isMobile ? 18 : 10;

    return {
      left: canopyBounds.left - horizontalInset,
      top: canopyBounds.top - verticalInset,
      width: canopyBounds.width + horizontalInset * 2,
      height: canopyBounds.height + verticalInset * 2,
    } satisfies React.CSSProperties;
  }, [canopyBounds, responsiveConfig.isMobile]);

  return (
    <div className="wish-tree-scene" onDragStartCapture={preventDragStart}>
      <div ref={hostRef} className="wish-tree-scene__host" />

      {canopyButtonStyle ? (
        <>
          <button
            type="button"
            className="wish-tree-scene__canopy-button"
            style={canopyButtonStyle}
            onClick={onTreeInteract}
            onDragStart={preventDragStart}
            disabled={sceneState !== 'idle'}
            aria-label="벚꽃나무 흔들기"
            draggable={false}
          />
          <div
            className={`wish-tree-scene__hint-shell${sceneState === 'idle' ? ' is-visible' : ''}`}
            aria-hidden={sceneState !== 'idle'}
          >
            {/* <span className="wish-tree-scene__hint">벚꽃을 살짝 흔들어 보세요</span> */}
          </div>
        </>
      ) : null}

      <PetalSystem
        app={app}
        stageSize={stageSize}
        spawnLayout={spawnLayout}
        responsiveConfig={responsiveConfig}
        sceneState={sceneState}
        dropSequence={dropSequence}
        resetSequence={resetSequence}
        playCount={playCount}
        onPetalCaught={onPetalCaught}
        onFallSequenceComplete={onFallSequenceComplete}
      />
    </div>
  );
}
