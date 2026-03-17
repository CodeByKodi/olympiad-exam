import styles from '../styles/BottomActionBar.module.css';

export function BottomActionBar({
  onPrevious,
  onNext,
  onClearAnswer,
  onMarkForReview,
  onSubmit,
  isFirst,
  isLast,
  isMarked,
  hasAnswer,
  disabled,
}) {
  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.prevBtn}
        onClick={onPrevious}
        disabled={isFirst || disabled}
        aria-label="Previous question"
      >
        ← Previous
      </button>
      <div className={styles.center}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onClearAnswer}
          disabled={!hasAnswer || disabled}
          aria-label="Clear selected answer"
        >
          Clear Answer
        </button>
        <button
          type="button"
          className={`${styles.secondaryBtn} ${isMarked ? styles.active : ''}`}
          onClick={onMarkForReview}
          disabled={disabled}
          aria-label={isMarked ? 'Unmark for review' : 'Mark for review'}
        >
          {isMarked ? 'Unmark Review' : 'Mark for Review'}
        </button>
      </div>
      {isLast ? (
        <button
          type="button"
          className={styles.submitBtn}
          onClick={onSubmit}
          disabled={disabled}
          aria-label="Submit test and view results"
        >
          Submit Test
        </button>
      ) : (
        <button
          type="button"
          className={styles.nextBtn}
          onClick={onNext}
          disabled={disabled}
          aria-label="Next question"
        >
          Next →
        </button>
      )}
    </div>
  );
}
