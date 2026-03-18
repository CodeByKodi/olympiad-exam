import { getPerformanceLabel } from '../utils/scoreUtils';
import styles from '../styles/ResultSummary.module.css';

export function ResultSummary({ summary }) {
  if (!summary) return null;

  const { correct, wrong, unanswered, percentage } = summary;
  const { label, variant, message } = getPerformanceLabel(percentage);

  return (
    <div
      className={`${styles.container} ${styles[variant]}`}
      role="status"
      aria-live="polite"
      aria-label={`Score: ${percentage}%. ${correct} correct, ${wrong} wrong, ${unanswered} unanswered.`}
    >
      <div className={styles.scoreRing} aria-hidden>
        <svg viewBox="0 0 36 36" className={styles.ringSvg}>
          <path
            className={styles.ringBg}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={styles.ringFill}
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className={styles.ringValue}>{percentage}%</span>
      </div>
      <div className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{label}</div>
      <p className={styles.message}>{message}</p>
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
