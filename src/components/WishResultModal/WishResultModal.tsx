import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  DEFAULT_AFFILIATE_DISCLOSURE,
  type WishEntry,
} from '../../constants/wishMessages';
import './WishResultModal.css';

type WishResultModalProps = {
  readonly isOpen: boolean;
  readonly entry: WishEntry;
  readonly onReplay: () => void;
  readonly onShare: () => void;
  readonly isShareAvailable: boolean;
  readonly isSharing: boolean;
  readonly shareLabel: string;
};

export function WishResultModal({
  isOpen,
  entry,
  onReplay,
  onShare,
  isShareAvailable,
  isSharing,
  shareLabel,
}: WishResultModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const affiliateDisclosure = entry.affiliateDisclosure ?? DEFAULT_AFFILIATE_DISCLOSURE;

  useLayoutEffect(() => {
    if (!isOpen || !overlayRef.current || !cardRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const textNodes = cardRef.current?.querySelectorAll(
        '.wish-result-modal__title, .wish-result-modal__headline, .wish-result-modal__suggestion, .wish-result-modal__product, .wish-result-modal__cta, .wish-result-modal__actions, .wish-result-modal__disclosure',
      );

      gsap.fromTo(
        overlayRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.28,
          ease: 'sine.out',
        },
      );

      gsap.fromTo(
        cardRef.current,
        {
          y: 26,
          scale: 0.965,
          opacity: 0,
          filter: 'blur(8px)',
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.52,
          ease: 'power2.out',
        },
      );

      if (textNodes?.length) {
        gsap.fromTo(
          textNodes,
          {
            y: 10,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.38,
            stagger: 0.06,
            delay: 0.12,
            ease: 'sine.out',
          },
        );
      }
    });

    return () => {
      context.revert();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="wish-result-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wish-title"
    >
      <div ref={cardRef} className="wish-result-modal__card">
        <h2 id="wish-title" className="wish-result-modal__title">
          벚꽃을 잡았어요
        </h2>
        <p className="wish-result-modal__headline">{entry.headline}</p>
        <p className="wish-result-modal__suggestion">{entry.suggestion}</p>
        <p className="wish-result-modal__product">추천 아이템 · {entry.productLabel}</p>
        <a
          className="wish-result-modal__cta"
          href={entry.productUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${entry.productLabel} 링크를 새 탭에서 열기`}
        >
          {entry.ctaLabel}
        </a>
        <div className="wish-result-modal__actions">
          <button type="button" className="wish-result-modal__button" onClick={onReplay}>
            다시 흔들기
          </button>
          <button
            type="button"
            className="wish-result-modal__button wish-result-modal__button--ghost"
            onClick={onShare}
            disabled={!isShareAvailable || isSharing}
          >
            {shareLabel}
          </button>
        </div>
        <p className="wish-result-modal__disclosure">{affiliateDisclosure}</p>
      </div>
    </div>
  );
}
