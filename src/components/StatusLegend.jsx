import styles from '../styles/StatusLegend.module.css';

export function StatusLegend() {
  return (
    <div className={styles.legend}>
      <span className={styles.title}>Legend</span>
      <div className={styles.items}>
        <div className={styles.item}>
          <span className={`${styles.dot} ${styles.current}`} />
          <span>Current</span>
        </div>
        <div className={styles.item}>
          <span className={`${styles.dot} ${styles.answered}`} />
          <span>Answered</span>
        </div>
        <div className={styles.item}>
          <span className={`${styles.dot} ${styles.marked}`} />
          <span>Review</span>
        </div>
        <div className={styles.item}>
          <span className={`${styles.dot} ${styles.unanswered}`} />
          <span>Not answered</span>
        </div>
      </div>
    </div>
  );
}
