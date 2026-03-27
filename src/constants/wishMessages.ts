export type WishCategory = 'selfCare' | 'productivity';

export type WishEntry = {
  readonly id: string;
  readonly headline: string;
  readonly suggestion: string;
  readonly category: WishCategory;
  readonly ctaLabel: string;
  readonly productLabel: string;
  readonly productUrl: string;
  readonly shareText?: string;
  readonly affiliateDisclosure?: string;
};

export const DEFAULT_SHARE_COPY = '떨어지는 벚꽃을 잡고 소원을 빌어봐요.';

export const DEFAULT_AFFILIATE_DISCLOSURE =
  '제휴 링크가 포함될 수 있어요. 상품 정보와 혜택은 이동 후 다시 확인해 주세요.';

function createPlaceholderProductUrl(slug: string) {
  return `https://example.com/cherry-wish/${slug}`;
}

export const WISH_ENTRIES: readonly WishEntry[] = [
  {
    id: 'clear-the-room',
    headline: '묵은 공기를 털어내면 마음도 조금 가벼워져요.',
    suggestion: '책상이나 방 한쪽을 정리하며 오늘의 흐름을 새로 열어보세요.',
    category: 'productivity',
    ctaLabel: '정리 아이템 보러 가기',
    productLabel: '정리함 · 청소 도구',
    productUrl: createPlaceholderProductUrl('clear-the-room'),
  },
  {
    id: 'write-it-down',
    headline: '고민은 종이 위에 놓일 때 더 선명해질 수 있어요.',
    suggestion: '다이어리나 노트에 지금 떠오르는 생각을 천천히 적어보세요.',
    category: 'selfCare',
    ctaLabel: '기록 아이템 보러 가기',
    productLabel: '다이어리 · 노트',
    productUrl: createPlaceholderProductUrl('write-it-down'),
  },
  {
    id: 'small-plan',
    headline: '오늘의 집중은 작은 계획 하나에서 시작돼요.',
    suggestion: '해야 할 일을 세 가지만 적고 가장 가벼운 것부터 끝내보세요.',
    category: 'productivity',
    ctaLabel: '플래너 보러 가기',
    productLabel: '플래너 · 체크리스트 메모',
    productUrl: createPlaceholderProductUrl('small-plan'),
  },
  {
    id: 'tea-break',
    headline: '속도를 늦추는 한 잔이 오늘을 다정하게 바꿔줄 수 있어요.',
    suggestion: '따뜻한 차를 준비하고 숨을 천천히 고르며 마음을 쉬게 해보세요.',
    category: 'selfCare',
    ctaLabel: '티타임 아이템 보러 가기',
    productLabel: '티컵 · 허브티',
    productUrl: createPlaceholderProductUrl('tea-break'),
  },
  {
    id: 'bag-reset',
    headline: '가방 속을 정리하면 내일의 시작도 한결 가벼워져요.',
    suggestion: '파우치와 자주 쓰는 물건부터 제자리를 만들어보세요.',
    category: 'productivity',
    ctaLabel: '수납 아이템 보러 가기',
    productLabel: '파우치 · 수납 정리',
    productUrl: createPlaceholderProductUrl('bag-reset'),
  },
  {
    id: 'stretch-tonight',
    headline: '쌓인 피로는 잠들기 전에 조금 풀어줘도 괜찮아요.',
    suggestion: '가벼운 스트레칭으로 몸의 긴장을 천천히 내려놓아 보세요.',
    category: 'selfCare',
    ctaLabel: '스트레칭 아이템 보러 가기',
    productLabel: '요가 매트 · 마사지 도구',
    productUrl: createPlaceholderProductUrl('stretch-tonight'),
  },
  {
    id: 'focus-desk',
    headline: '작은 정돈 하나가 흐트러진 집중을 다시 모아줘요.',
    suggestion: '오늘 가장 오래 머무는 자리를 먼저 단정하게 정리해보세요.',
    category: 'productivity',
    ctaLabel: '데스크 정리 아이템 보러 가기',
    productLabel: '데스크 오거나이저 · 문구',
    productUrl: createPlaceholderProductUrl('focus-desk'),
  },
  {
    id: 'soft-night',
    headline: '부드러운 밤의 온기가 내일의 기분을 바꿀 수 있어요.',
    suggestion: '포근한 조명이나 블랭킷으로 저녁의 리듬을 편안하게 정리해보세요.',
    category: 'selfCare',
    ctaLabel: '편안한 밤 아이템 보러 가기',
    productLabel: '무드등 · 블랭킷',
    productUrl: createPlaceholderProductUrl('soft-night'),
  },
  {
    id: 'start-one-task',
    headline: '미뤄둔 일은 가장 작은 한 칸에서 움직이기 시작해요.',
    suggestion: '지금 바로 끝낼 수 있는 일 하나만 정하고 가볍게 시작해보세요.',
    category: 'productivity',
    ctaLabel: '체크리스트 아이템 보러 가기',
    productLabel: '투두 메모 · 스터디 문구',
    productUrl: createPlaceholderProductUrl('start-one-task'),
  },
  {
    id: 'quiet-reading',
    headline: '짧은 문장 하나가 마음의 결을 다정하게 바꿔주기도 해요.',
    suggestion: '읽고 싶은 페이지를 펼치고 잠깐의 조용한 시간을 가져보세요.',
    category: 'selfCare',
    ctaLabel: '독서 아이템 보러 가기',
    productLabel: '독서 노트 · 북마크',
    productUrl: createPlaceholderProductUrl('quiet-reading'),
  },
] as const;

export function getRandomWishEntry(previousId?: string) {
  if (WISH_ENTRIES.length <= 1) {
    return WISH_ENTRIES[0];
  }

  const availableEntries = previousId
    ? WISH_ENTRIES.filter((entry) => entry.id !== previousId)
    : WISH_ENTRIES;

  return availableEntries[Math.floor(Math.random() * availableEntries.length)];
}
