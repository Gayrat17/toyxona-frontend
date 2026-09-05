'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Native top-layer dialog: focus trap, Escape and focus restoration work on mobile too. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`modal-pop m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-gold/40 bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm ${className}`}
    >
      {open && (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <h2 id={titleId} className="font-display text-lg font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Yopish"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line hover:bg-gold-tint"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </>
      )}
    </dialog>
  );
}
