import { Link } from 'react-router-dom';
import { TEST_MODES } from '../constants/exams';
import styles from '../styles/TestCard.module.css';

export function TestCard({ examId, gradeId, testId, mode, questionCount, durationMinutes, title }) {
  const isPractice = mode === TEST_MODES.PRACTICE;
  const to = `/exam/${examId}/grade/${gradeId}/test/${testId}?mode=${mode}`;

  return (
    <Link to={to} className={styles.card}>
      <div className={`${styles.badge} ${isPractice ? styles.practice : styles.mock}`}>
        {isPractice ? 'Practice' : 'Mock Test'}
      </div>
      <h3 className={styles.title}>{title || `Test ${testId}`}</h3>
      <div className={styles.meta}>
        <span>{questionCount} questions</span>
        <span>•</span>
        <span>~{durationMinutes} min</span>
      </div>
    </Link>
  );
}
