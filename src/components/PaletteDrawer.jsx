import { QuestionPalette } from './QuestionPalette';
import { StatusLegend } from './StatusLegend';
import { formatRemainingTime } from '../utils/timeUtils';
import styles from '../styles/PaletteDrawer.module.css';

/**
 * Mobile drawer for question palette.
 * Opens from bottom on small screens.
 */
export function PaletteDrawer({
  open,
  onClose,
  questions,
  currentIndex,
  answers,
  markedForReview,
  onSelectQuestion,
  totalQuestions,
  answeredCount,
  markedCount,
  timeRemaining,
  isPractice,
}) {
  const unansweredCount = totalQuestions - answeredCount;

  if (!open) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-label="Question navigation">
        <div className={styles.handle} />
        <div className={styles.header}>
          <h3>Questions</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className={styles.stats}>
          <span>{answeredCount} answered</span>
          <span>{unansweredCount} left</span>
          <span>{markedCount} review</span>
        </div>
        {!isPractice && timeRemaining != null && (
          <div className={styles.timer}>
            Time left: {formatRemainingTime(timeRemaining)}
          </div>
        )}
        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onSelect={(idx) => {
            onSelectQuestion(idx);
            onClose();
          }}
        />
        <StatusLegend />
      </div>
    </>
  );
}
