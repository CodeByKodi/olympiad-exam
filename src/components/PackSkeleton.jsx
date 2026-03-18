import styles from '../styles/PackSkeleton.module.css';

export function PackSkeleton({ count = 6 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.line} />
          <div className={styles.lineShort} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}
