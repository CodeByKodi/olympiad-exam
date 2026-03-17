import { formatRemainingTime } from '../utils/timeUtils';
import styles from '../styles/Timer.module.css';

export function Timer({ remainingSeconds, onExpire, isExpired }) {
  const formatted = formatRemainingTime(remainingSeconds);
  const isLow = remainingSeconds > 0 && remainingSeconds <= 300;

  return (
    <div className={`${styles.timer} ${isLow ? styles.low : ''} ${isExpired ? styles.expired : ''}`}>
      <span className={styles.icon}>⏱️</span>
      <span className={styles.value}>{formatted}</span>
      {isExpired && onExpire && (
        <span className={styles.expiredText}>Time's up!</span>
      )}
    </div>
  );
}
