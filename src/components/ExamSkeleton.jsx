import { Skeleton } from './Skeleton';
import styles from '../styles/ExamSkeleton.module.css';

/** Skeleton for Exam page while loading test. */
export function ExamSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Skeleton width="200px" height="1.5rem" />
        <Skeleton width="120px" height="1rem" />
      </div>
      <div className={styles.content}>
        <div className={styles.main}>
          <Skeleton width="100%" height="2.5rem" />
          <div className={styles.options}>
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="90%" height="2rem" />
            <Skeleton width="95%" height="2rem" />
          </div>
        </div>
      </div>
    </div>
  );
}
