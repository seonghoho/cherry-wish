export const WISH_MESSAGES = [
  '당신의 봄이 천천히 피어나고 있어요',
  '작은 행운이 오늘 당신 곁에 머물 거예요',
  '바라던 일이 생각보다 가까이에 있어요',
  '오늘의 선택이 좋은 흐름으로 이어질 거예요',
  '벚꽃이 닿았어요, 좋은 흐름이 시작될지도 몰라요',
  '고요한 마음 끝에서 반가운 소식이 다가오고 있어요',
  '오늘의 바람은 당신 편으로 천천히 기울고 있어요',
] as const;

export function getRandomWishMessage(previousMessage?: string) {
  if (WISH_MESSAGES.length <= 1) {
    return WISH_MESSAGES[0];
  }

  const availableMessages = previousMessage
    ? WISH_MESSAGES.filter((message) => message !== previousMessage)
    : WISH_MESSAGES;

  return availableMessages[Math.floor(Math.random() * availableMessages.length)];
}
