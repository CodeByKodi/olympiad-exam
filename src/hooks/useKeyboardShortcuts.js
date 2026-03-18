import { useEffect } from 'react';

/**
 * Keyboard shortcuts for exam navigation.
 * - Arrow Left / A: Previous question
 * - Arrow Right / D: Next question
 * - Enter: Submit (when on last question) or Next
 */
export function useExamKeyboardShortcuts({
  onPrev,
  onNext,
  onSubmit,
  currentIndex,
  totalQuestions,
  disabled = false,
}) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onPrev?.();
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (currentIndex >= totalQuestions - 1) {
              onSubmit?.();
            } else {
              onNext?.();
            }
          }
          break;
        case 'Enter':
          if (currentIndex >= totalQuestions - 1) {
            e.preventDefault();
            onSubmit?.();
          } else {
            e.preventDefault();
            onNext?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onSubmit, currentIndex, totalQuestions, disabled]);
}
