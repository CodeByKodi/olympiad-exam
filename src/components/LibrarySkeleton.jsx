import { Skeleton } from './Skeleton';
import styles from '../styles/LibrarySkeleton.module.css';

/** Skeleton for Question Library table/cards while loading. */
export function LibrarySkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.table}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.row}>
            <Skeleton width="25%" height="1rem" />
            <Skeleton width="12%" height="1rem" />
            <Skeleton width="8%" height="1rem" />
            <Skeleton width="12%" height="1rem" />
            <Skeleton width="10%" height="1rem" />
            <Skeleton width="12%" height="1rem" />
          </div>
        ))}
      </div>
      <div className={styles.cards}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.card}>
            <Skeleton width="70%" height="1.25rem" />
            <div className={styles.cardMeta}>
              <Skeleton width="60px" height="0.875rem" />
              <Skeleton width="50px" height="0.875rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
