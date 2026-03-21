import { Timer } from './Timer';
import styles from '../styles/ExamHeader.module.css';

export function ExamHeader({
  examName,
  testTitle,
  gradeId,
  mode,
  timeRemaining,
  timeExpired,
  timerPaused,
  onPause,
  onMarkForReview,
  onSubmit,
  isMarked,
  progress,
  totalQuestions,
  currentQuestionNumber,
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
        {(currentQuestionNumber != null || progress != null) && totalQuestions > 0 && (
          <div className={styles.progressBlock}>
            {currentQuestionNumber != null && (
              <span
                className={styles.questionPosition}
                aria-label={`Question ${currentQuestionNumber} of ${totalQuestions}`}
              >
                Q {currentQuestionNumber} / {totalQuestions}
              </span>
            )}
            {progress != null && (
              <div
                className={styles.progressWrap}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={totalQuestions}
                aria-label={`${progress} of ${totalQuestions} questions answered`}
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${(progress / totalQuestions) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
        <div className={styles.actions}>
          {!isPractice && (
            <>
              <div className={styles.timerWrap}>
                <Timer remainingSeconds={timeRemaining} isExpired={timeExpired} isPaused={timerPaused} />
              </div>
              {onPause && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={onPause}
                  title={timerPaused ? 'Resume timer' : 'Pause timer'}
                  aria-label={timerPaused ? 'Resume timer' : 'Pause timer'}
                >
                  <span className={styles.btnLabel}>{timerPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}
            </>
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
            aria-label="Submit test and view results"
          >
            Submit Test
          </button>
        </div>
      </div>
    </header>
  );
}
