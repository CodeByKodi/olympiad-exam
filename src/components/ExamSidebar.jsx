import { QuestionPalette } from './QuestionPalette';
import { StatusLegend } from './StatusLegend';
import { formatRemainingTime } from '../utils/timeUtils';
import styles from '../styles/ExamSidebar.module.css';

export function ExamSidebar({
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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{answeredCount}</span>
            <span className={styles.statLabel}>Answered</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{unansweredCount}</span>
            <span className={styles.statLabel}>Left</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{markedCount}</span>
            <span className={styles.statLabel}>Review</span>
          </div>
        </div>
        {!isPractice && timeRemaining != null && (
          <div className={styles.timer}>
            <span className={styles.timerLabel}>Time left</span>
            <span className={styles.timerValue}>{formatRemainingTime(timeRemaining)}</span>
          </div>
        )}
        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onSelect={onSelectQuestion}
        />
        <StatusLegend />
      </div>
    </aside>
  );
}
