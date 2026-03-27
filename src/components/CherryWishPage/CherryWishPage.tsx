import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SCENE_CONFIG,
  type SceneState,
} from '../../constants/sceneConfig';
import {
  DEFAULT_SHARE_COPY,
  getRandomWishEntry,
} from '../../constants/wishMessages';
import { useResponsiveConfig } from '../../hooks/useResponsiveConfig';
import { useSound } from '../../hooks/useSound';
import { InstructionOverlay } from '../InstructionOverlay/InstructionOverlay';
import { SoundControl } from '../SoundControl/SoundControl';
import { SpringBackground } from '../SpringBackground/SpringBackground';
import { WishResultModal } from '../WishResultModal/WishResultModal';
import { WishTreeScene } from '../WishTreeScene/WishTreeScene';
import './CherryWishPage.css';

export function CherryWishPage() {
  const responsiveConfig = useResponsiveConfig();
  const { muted, play, toggleMuted } = useSound();
  const [sceneState, setSceneState] = useState<SceneState>('idle');
  const [shakeSequence, setShakeSequence] = useState(0);
  const [dropSequence, setDropSequence] = useState(0);
  const [resetSequence, setResetSequence] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [wishEntry, setWishEntry] = useState(() => getRandomWishEntry());
  const [isSharing, setIsSharing] = useState(false);
  const [shareLabel, setShareLabel] = useState('공유하기');
  const timeoutIdsRef = useRef<number[]>([]);
  const sceneStateRef = useRef<SceneState>('idle');

  useEffect(() => {
    sceneStateRef.current = sceneState;
  }, [sceneState]);

  const clearTimers = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }

    timeoutIdsRef.current = [];
  }, []);

  const scheduleStateTransition = useCallback((callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((currentId) => currentId !== timeoutId);
      callback();
    }, delayMs);

    timeoutIdsRef.current.push(timeoutId);
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const isShareAvailable = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }

    return typeof navigator.share === 'function' || !!navigator.clipboard;
  }, []);

  const beginResetFlow = useCallback(
    (incrementPlayCount: boolean) => {
      clearTimers();
      setSceneState('resetting');

      scheduleStateTransition(() => {
        setResetSequence((currentValue) => currentValue + 1);

        if (incrementPlayCount) {
          setPlayCount((currentValue) => currentValue + 1);
        }

        setSceneState('idle');
      }, SCENE_CONFIG.reset.durationMs);
    },
    [clearTimers, scheduleStateTransition],
  );

  const handleTreeInteract = useCallback(() => {
    if (sceneState !== 'idle') {
      return;
    }

    clearTimers();
    setShareLabel('공유하기');
    void play('shake');
    setSceneState('shaking');
    setShakeSequence((currentValue) => currentValue + 1);

    scheduleStateTransition(() => {
      setDropSequence((currentValue) => currentValue + 1);
    }, SCENE_CONFIG.tree.petalReleaseDelayMs);

    scheduleStateTransition(() => {
      setSceneState('petalsFalling');
    }, SCENE_CONFIG.tree.petalReleaseDelayMs + 90);

    scheduleStateTransition(() => {
      if (sceneStateRef.current !== 'petalsFalling') {
        return;
      }

      beginResetFlow(true);
    }, SCENE_CONFIG.petals.fallSafetyTimeoutMs);
  }, [beginResetFlow, clearTimers, play, sceneState, scheduleStateTransition]);

  const handleFallSequenceComplete = useCallback(() => {
    if (sceneStateRef.current !== 'petalsFalling') {
      return;
    }

    clearTimers();
    scheduleStateTransition(() => {
      if (sceneStateRef.current !== 'petalsFalling') {
        return;
      }

      beginResetFlow(true);
    }, SCENE_CONFIG.petals.settledDisplayMs);
  }, [beginResetFlow, clearTimers, scheduleStateTransition]);

  const handlePetalCaught = useCallback(() => {
    if (sceneState !== 'petalsFalling') {
      return;
    }

    clearTimers();
    void play('catch');
    setWishEntry((currentEntry) => getRandomWishEntry(currentEntry.id));
    setSceneState('petalCaught');

    scheduleStateTransition(() => {
      setSceneState('resultOpen');
    }, SCENE_CONFIG.result.postCatchNaturalFallDelayMs);
  }, [clearTimers, play, sceneState, scheduleStateTransition]);

  const handleReplay = useCallback(() => {
    clearTimers();
    setIsSharing(false);
    setShareLabel('공유하기');
    beginResetFlow(true);
  }, [beginResetFlow, clearTimers]);

  const handleShare = useCallback(async () => {
    const sharePayload = {
      title: '벚꽃 소원나무',
      text: DEFAULT_SHARE_COPY,
      url: window.location.href,
    };

    try {
      setIsSharing(true);
      setShareLabel('공유 중...');

      if (typeof navigator.share === 'function') {
        await navigator.share(sharePayload);
        setShareLabel('공유 완료');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${sharePayload.text}\n${sharePayload.url}`,
        );
        setShareLabel('링크 복사됨');
      }
      scheduleStateTransition(() => {
        setShareLabel('공유하기');
      }, 1400);
    } catch (error) {
      if (
        !(error instanceof DOMException && error.name === 'AbortError')
      ) {
        setShareLabel('다시 시도');
      }
    } finally {
      setIsSharing(false);
    }
  }, [scheduleStateTransition]);

  return (
    <div className="cherry-page">
      <SpringBackground petalCount={responsiveConfig.backgroundPetalCount} />

      <div className="cherry-page__shell">
        <header className="cherry-page__hero">
          <p className="cherry-page__eyebrow">Cherry Blossom Wishing Tree</p>
          <h1 className="cherry-page__title">벚꽃 소원나무</h1>
          <p className="cherry-page__description">
            오늘의 봄 한 조각을 손끝으로 붙잡아 보세요.
          </p>
        </header>

        <main className="cherry-page__main">
          <section
            className="cherry-page__stage"
            style={{ minHeight: responsiveConfig.stageMinHeight }}
            aria-label="벚꽃 소원나무 인터랙션 무대"
          >
            <WishTreeScene
              sceneState={sceneState}
              responsiveConfig={responsiveConfig}
              shakeSequence={shakeSequence}
              dropSequence={dropSequence}
              resetSequence={resetSequence}
              playCount={playCount}
              onTreeInteract={handleTreeInteract}
              onPetalCaught={handlePetalCaught}
              onFallSequenceComplete={handleFallSequenceComplete}
            />
            <InstructionOverlay sceneState={sceneState} />
          </section>
        </main>

        <footer className="cherry-page__footer">
          <p className="cherry-page__footer-copy">
            {/* 나무를 눌러 꽃잎을 떨어뜨리고, 오늘의 소원을 만나보세요. */}
          </p>
          <SoundControl muted={muted} onToggle={toggleMuted} />
        </footer>
      </div>

      <WishResultModal
        isOpen={sceneState === 'resultOpen'}
        entry={wishEntry}
        onReplay={handleReplay}
        onShare={() => {
          void handleShare();
        }}
        isShareAvailable={isShareAvailable}
        isSharing={isSharing}
        shareLabel={shareLabel}
      />
    </div>
  );
}
