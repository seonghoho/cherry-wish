export type SceneState =
  | 'idle'
  | 'shaking'
  | 'petalsFalling'
  | 'petalCaught'
  | 'resultOpen'
  | 'resetting';

export type ResponsiveSceneMetrics = {
  readonly isMobile: boolean;
  readonly petalBurstCount: number;
  readonly backgroundPetalCount: number;
  readonly petalCatchRadius: number;
  readonly treeScale: number;
  readonly stageMinHeight: number;
};

export const SCENE_CONFIG = {
  tree: {
    shakeDurationMs: 1120,
    settleDelayMs: 120,
    petalReleaseDelayMs: 140,
    idleSwayDegrees: 1.05,
    idleSwayDurationSec: 4.8,
  },
  petals: {
    desktopBurstCount: 30,
    mobileBurstCount: 22,
    desktopCatchRadius: 33,
    mobileCatchRadius: 40,
    desktopBackgroundPetalCount: 6,
    mobileBackgroundPetalCount: 4,
    gravity: 0.013,
    drag: 0.997,
    driftStrength: 0.56,
    maxLifetimeMs: 7600,
    assistRadiusBonus: 14,
    settledDisplayMs: 860,
    fallSafetyTimeoutMs: 9200,
    floorLiftPx: 16,
    floorScatterPx: 12,
  },
  result: {
    postCatchNaturalFallDelayMs: 980,
  },
  reset: {
    durationMs: 220,
  },
  layout: {
    stageMinHeightMobile: 440,
    stageMinHeightDesktop: 560,
  },
} as const;

export function getResponsiveSceneMetrics(viewportWidth: number): ResponsiveSceneMetrics {
  const isMobile = viewportWidth < 768;

  return {
    isMobile,
    petalBurstCount: isMobile
      ? SCENE_CONFIG.petals.mobileBurstCount
      : SCENE_CONFIG.petals.desktopBurstCount,
    backgroundPetalCount: isMobile
      ? SCENE_CONFIG.petals.mobileBackgroundPetalCount
      : SCENE_CONFIG.petals.desktopBackgroundPetalCount,
    petalCatchRadius: isMobile
      ? SCENE_CONFIG.petals.mobileCatchRadius
      : SCENE_CONFIG.petals.desktopCatchRadius,
    treeScale: isMobile ? 1.14 : 1,
    stageMinHeight: isMobile
      ? SCENE_CONFIG.layout.stageMinHeightMobile
      : SCENE_CONFIG.layout.stageMinHeightDesktop,
  };
}
