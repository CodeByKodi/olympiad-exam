import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Hook for modal accessibility: focus trap, Escape to close, return focus on close.
 * @param {boolean} open - Whether modal is open
 * @param {() => void} onClose - Close handler (for Escape)
 * @returns {{ modalRef: React.RefObject, overlayRef: React.RefObject }}
 */
export function useModalA11y(open, onClose) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    if (!open) {
      if (previousActiveRef.current?.focus) {
        previousActiveRef.current.focus();
      }
      return;
    }

    previousActiveRef.current = document.activeElement;

    const timer = requestAnimationFrame(() => {
      const el = modalRef.current;
      if (!el) return;
      const focusable = el.querySelectorAll(FOCUSABLE);
      const first = focusable[0];
      if (first) first.focus();
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const el = modalRef.current;
        if (!el) return;
        const focusable = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.tabIndex !== -1);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(timer);
      if (previousActiveRef.current?.focus) {
        previousActiveRef.current.focus();
      }
    };
  }, [open, onClose]);

  return { modalRef, overlayRef };
}
