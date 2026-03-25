import { useEffect, useMemo, useState } from 'react';
import {
  getResponsiveSceneMetrics,
  type ResponsiveSceneMetrics,
} from '../constants/sceneConfig';

function getViewportWidth() {
  if (typeof window === 'undefined') {
    return 390;
  }

  return window.innerWidth;
}

export function useResponsiveConfig(): ResponsiveSceneMetrics {
  const [viewportWidth, setViewportWidth] = useState<number>(getViewportWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return useMemo(() => getResponsiveSceneMetrics(viewportWidth), [viewportWidth]);
}
