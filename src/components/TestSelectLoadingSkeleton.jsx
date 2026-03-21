import styles from '../styles/TestSelectLoadingSkeleton.module.css';

/**
 * Mirrors test-select layout: toolbar row + card grid (avoids a bare header-only skeleton).
 */
export function TestSelectLoadingSkeleton() {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.toolbar}>
        <div className={styles.searchShim} />
        <div className={styles.selectShim} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.line} />
            <div className={styles.lineShort} />
            <div className={styles.lineShort} />
          </div>
        ))}
      </div>
    </div>
  );
}
