import { Link } from 'react-router-dom';
import { EXAMS, TESTS_PER_EXAM } from '../constants/exams';
import { getBestScores, getCompletedTests } from '../utils/storageUtils';
import styles from '../styles/ExamCard.module.css';

export function ExamCard({ examId }) {
  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const bestScores = getBestScores();
  const completed = getCompletedTests();
  const examCompleted = completed.filter((t) => t.examId === exam.id);
  const best = bestScores[exam.id];
  const totalTests = TESTS_PER_EXAM.length;
  const progress = examCompleted.length > 0
    ? Math.round((examCompleted.length / totalTests) * 100)
    : 0;

  return (
    <Link
      to={`/exam/${exam.id}`}
      className={styles.card}
      style={{ '--exam-color': exam.color }}
    >
      <div className={styles.icon}>{exam.icon}</div>
      <h3 className={styles.name}>{exam.name}</h3>
      <p className={styles.fullName}>{exam.fullName}</p>
      <div className={styles.progress}>
        <span className={styles.progressLabel}>Course Covered</span>
        <span className={styles.progressValue}>{Math.min(progress, 100)}%</span>
      </div>
      {best && (
        <div className={styles.bestScore}>
          Best: {best.percentage}%
        </div>
      )}
    </Link>
  );
}
