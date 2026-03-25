import './SoundControl.css';

type SoundControlProps = {
  readonly muted: boolean;
  readonly onToggle: () => void;
};

export function SoundControl({ muted, onToggle }: SoundControlProps) {
  return (
    <button
      type="button"
      className="sound-control"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? '사운드 켜기' : '사운드 끄기'}
    >
      {muted ? '소리 끔' : '소리 켬'}
    </button>
  );
}
