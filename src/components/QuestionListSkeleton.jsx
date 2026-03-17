import { Skeleton } from './Skeleton';
import styles from '../styles/QuestionListSkeleton.module.css';

/** Skeleton for Question Manager list while loading. */
export function QuestionListSkeleton() {
  return (
    <div className={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.card}>
          <div className={styles.header}>
            <Skeleton width="3rem" height="1rem" />
            <Skeleton width="5rem" height="1rem" />
          </div>
          <Skeleton width="100%" height="2.5rem" />
          <div className={styles.options}>
            <Skeleton width="90%" height="0.875rem" />
            <Skeleton width="85%" height="0.875rem" />
            <Skeleton width="80%" height="0.875rem" />
            <Skeleton width="75%" height="0.875rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
