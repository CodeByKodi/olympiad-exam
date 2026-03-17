import { Timer } from './Timer';
import styles from '../styles/ExamHeader.module.css';

export function ExamHeader({
  examName,
  testTitle,
  gradeId,
  mode,
  timeRemaining,
  timeExpired,
  onPause,
  onMarkForReview,
  onSubmit,
  isMarked,
  progress,
  totalQuestions,
}) {
  const isPractice = mode === 'practice';

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <h1 className={styles.title}>
          {examName}
        </h1>
        <div className={styles.meta}>
          <span className={styles.grade}>Grade {gradeId}</span>
          <span className={styles.sep}>•</span>
          <span className={styles.test}>{testTitle}</span>
          <span className={`${styles.badge} ${isPractice ? styles.practice : styles.mock}`}>
            {isPractice ? 'Practice' : 'Mock Test'}
          </span>
        </div>
      </div>

      <div className={styles.bar}>
        {progress != null && totalQuestions > 0 && (
          <div className={styles.progressWrap}>
            <div
              className={styles.progressFill}
              style={{ width: `${(progress / totalQuestions) * 100}%` }}
            />
          </div>
        )}
        <div className={styles.actions}>
          {!isPractice && (
            <div className={styles.timerWrap}>
              <Timer remainingSeconds={timeRemaining} isExpired={timeExpired} />
            </div>
          )}
          <button
            type="button"
            className={`${styles.iconBtn} ${isMarked ? styles.active : ''}`}
            onClick={onMarkForReview}
            title="Mark for Review"
            aria-label={isMarked ? 'Unmark for review' : 'Mark for review'}
          >
            <span className={styles.flagIcon}>🚩</span>
            <span className={styles.btnLabel}>{isMarked ? 'Marked' : 'Review'}</span>
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={onSubmit}
          >
            Submit Test
          </button>
        </div>
      </div>
    </header>
  );
}
