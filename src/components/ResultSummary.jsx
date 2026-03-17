import { getPerformanceLabel } from '../utils/scoreUtils';
import styles from '../styles/ResultSummary.module.css';

export function ResultSummary({ summary }) {
  if (!summary) return null;

  const { correct, wrong, unanswered, percentage } = summary;
  const { label, variant } = getPerformanceLabel(percentage);

  return (
    <div
      className={styles.container}
      role="status"
      aria-live="polite"
      aria-label={`Score: ${percentage}%. ${correct} correct, ${wrong} wrong, ${unanswered} unanswered.`}
    >
      <div className={`${styles.badge} ${styles[variant]}`}>{label}</div>
      <div className={styles.score}>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{correct}</span>
          <span className={styles.statLabel}>Correct</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{wrong}</span>
          <span className={styles.statLabel}>Wrong</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{unanswered}</span>
          <span className={styles.statLabel}>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
