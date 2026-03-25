import type { SceneState } from '../../constants/sceneConfig';
import './InstructionOverlay.css';

type InstructionOverlayProps = {
  readonly sceneState: SceneState;
};

const INSTRUCTION_COPY: Record<SceneState, string> = {
  idle: '벚꽃나무를 살짝 눌러 오늘의 봄을 깨워 보세요',
  shaking: '가지 사이에서 꽃잎이 깨어나고 있어요',
  petalsFalling: '흩날리는 꽃잎 하나를 붙잡아 보세요',
  petalCaught: '벚꽃이 손끝에 닿았어요',
  resultOpen: '오늘의 소원을 천천히 읽어보세요',
  resetting: '다시 봄바람을 준비하고 있어요',
};

export function InstructionOverlay({ sceneState }: InstructionOverlayProps) {
  return (
    <div className="instruction-overlay">
      {/* <p className="instruction-overlay__label">How it flows</p> */}
      <p className="instruction-overlay__copy">{INSTRUCTION_COPY[sceneState]}</p>
    </div>
  );
}
