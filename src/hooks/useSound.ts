import { useCallback, useEffect, useRef, useState } from 'react';

type SoundName = 'shake' | 'catch';

type ToneConfig = {
  readonly frequency: number;
  readonly durationSec: number;
  readonly gain: number;
};

const SOUND_TONES: Record<SoundName, ToneConfig> = {
  shake: {
    frequency: 392,
    durationSec: 0.12,
    gain: 0.015,
  },
  catch: {
    frequency: 523.25,
    durationSec: 0.22,
    gain: 0.02,
  },
};

export function useSound() {
  const [muted, setMuted] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  const ensureContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!audioContextRef.current) {
      const ContextConstructor = window.AudioContext;
      audioContextRef.current = ContextConstructor ? new ContextConstructor() : null;
    }

    return audioContextRef.current;
  }, []);

  const play = useCallback(
    async (name: SoundName) => {
      if (muted) {
        return;
      }

      const context = ensureContext();

      if (!context) {
        return;
      }

      if (context.state === 'suspended') {
        await context.resume();
      }

      const tone = SOUND_TONES[name];
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const now = context.currentTime;

      oscillator.type = name === 'shake' ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(tone.frequency, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(tone.gain, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.durationSec);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + tone.durationSec);
    },
    [ensureContext, muted],
  );

  const toggleMuted = useCallback(() => {
    setMuted((currentMuted) => !currentMuted);
  }, []);

  return {
    muted,
    play,
    toggleMuted,
  };
}
