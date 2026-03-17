import { Link } from 'react-router-dom';
import { GRADES } from '../constants/exams';
import styles from '../styles/GradeSelector.module.css';

export function GradeSelector({ examId }) {
  const grades = Object.values(GRADES);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Grade</h2>
      <div className={styles.grid}>
        {grades.map((grade) =>
          grade.enabled ? (
            <Link
              key={grade.id}
              to={`/exam/${examId}/grade/${grade.id}`}
              className={styles.card}
            >
              <span className={styles.gradeName}>{grade.name}</span>
            </Link>
          ) : (
            <div
              key={grade.id}
              className={`${styles.card} ${styles.disabled}`}
              aria-disabled
            >
              <span className={styles.gradeName}>{grade.name}</span>
              <span className={styles.comingSoon}>Coming Soon</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
