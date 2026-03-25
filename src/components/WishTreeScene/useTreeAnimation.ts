import { gsap } from 'gsap';
import type { Container } from 'pixi.js';
import { useEffect, useRef } from 'react';
import { SCENE_CONFIG } from '../../constants/sceneConfig';

const DEGREE_TO_RADIAN = Math.PI / 180;

type UseTreeAnimationOptions = {
  readonly treeRef: React.MutableRefObject<Container | null>;
  readonly sceneReadyKey: number;
  readonly shakeSequence: number;
};

export function useTreeAnimation({
  treeRef,
  sceneReadyKey,
  shakeSequence,
}: UseTreeAnimationOptions) {
  const idleTweenRef = useRef<gsap.core.Timeline | null>(null);
  const shakeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const baseYRef = useRef(0);

  useEffect(() => {
    const tree = treeRef.current;

    if (!tree || sceneReadyKey === 0) {
      return;
    }

    idleTweenRef.current?.kill();
    shakeTimelineRef.current?.kill();
    tree.rotation = 0;
    baseYRef.current = tree.y;

    const idleTimeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: {
        duration: SCENE_CONFIG.tree.idleSwayDurationSec,
        ease: 'sine.inOut',
      },
    });

    idleTimeline.to(tree, {
      rotation: SCENE_CONFIG.tree.idleSwayDegrees * DEGREE_TO_RADIAN,
      y: baseYRef.current - 3,
    });
    idleTweenRef.current = idleTimeline;

    return () => {
      idleTweenRef.current?.kill();
      idleTweenRef.current = null;
      shakeTimelineRef.current?.kill();
      shakeTimelineRef.current = null;
    };
  }, [sceneReadyKey, treeRef]);

  useEffect(() => {
    const tree = treeRef.current;

    if (!tree || shakeSequence === 0) {
      return;
    }

    idleTweenRef.current?.pause();
    shakeTimelineRef.current?.kill();

    const baseY = baseYRef.current;

    shakeTimelineRef.current = gsap
      .timeline({
        onComplete: () => {
          tree.rotation = 0;
          tree.y = baseY;
          idleTweenRef.current?.resume();
        },
      })
      .to(tree, {
        rotation: -2.3 * DEGREE_TO_RADIAN,
        y: baseY - 2,
        duration: 0.2,
        ease: 'sine.out',
      })
      .to(tree, {
        rotation: 2.9 * DEGREE_TO_RADIAN,
        y: baseY - 0.5,
        duration: 0.26,
        ease: 'sine.inOut',
      })
      .to(tree, {
        rotation: -1.55 * DEGREE_TO_RADIAN,
        y: baseY - 1.2,
        duration: 0.24,
        ease: 'sine.inOut',
      })
      .to(tree, {
        rotation: 0.82 * DEGREE_TO_RADIAN,
        y: baseY - 0.2,
        duration: 0.22,
        ease: 'sine.inOut',
      })
      .to(tree, {
        rotation: 0,
        y: baseY,
        duration: 0.3,
        ease: 'sine.out',
      });
  }, [shakeSequence, treeRef]);
}
