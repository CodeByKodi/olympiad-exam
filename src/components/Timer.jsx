import { formatRemainingTime } from '../utils/timeUtils';
import styles from '../styles/Timer.module.css';

export function Timer({ remainingSeconds, onExpire, isExpired, isPaused }) {
  const formatted = formatRemainingTime(remainingSeconds);
  const isLow = remainingSeconds > 0 && remainingSeconds <= 300 && !isPaused;

  return (
    <div
      className={`${styles.timer} ${isLow ? styles.low : ''} ${isExpired ? styles.expired : ''} ${isPaused ? styles.paused : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={isExpired ? "Time's up" : isPaused ? `Paused: ${formatted} remaining` : `Time remaining: ${formatted}`}
    >
      <span className={styles.icon} aria-hidden="true">⏱️</span>
      <span className={styles.value}>{formatted}</span>
      {isPaused && <span className={styles.pausedText}>(Paused)</span>}
      {isExpired && onExpire && (
        <span className={styles.expiredText}>Time's up!</span>
      )}
    </div>
  );
}
