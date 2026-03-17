import { useParams } from 'react-router-dom';
import { GradeSelector } from '../components/GradeSelector';
import { EXAMS } from '../constants/exams';
import styles from '../styles/GradePage.module.css';

export function GradePage() {
  const { examId } = useParams();
  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{exam.fullName}</h1>
        <p className={styles.subtitle}>Select your grade to continue</p>
      </div>
      <GradeSelector examId={exam.id} />
    </div>
  );
}
