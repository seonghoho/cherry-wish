import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import './WishResultModal.css';

type WishResultModalProps = {
  readonly isOpen: boolean;
  readonly message: string;
  readonly onReplay: () => void;
  readonly onShare: () => void;
  readonly isShareAvailable: boolean;
  readonly isSharing: boolean;
  readonly shareLabel: string;
};

export function WishResultModal({
  isOpen,
  message,
  onReplay,
  onShare,
  isShareAvailable,
  isSharing,
  shareLabel,
}: WishResultModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !overlayRef.current || !cardRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const textNodes = cardRef.current?.querySelectorAll(
        '.wish-result-modal__eyebrow, .wish-result-modal__title, .wish-result-modal__message, .wish-result-modal__actions',
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
        <p className="wish-result-modal__eyebrow">Cherry Wish</p>
        <h2 id="wish-title" className="wish-result-modal__title">
          벚꽃을 잡았어요
        </h2>
        <p className="wish-result-modal__message">{message}</p>
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
      </div>
    </div>
  );
}
