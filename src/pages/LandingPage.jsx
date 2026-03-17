import { Link } from 'react-router-dom';
import { EXAMS } from '../constants/exams';
import { getBestScores, getCompletedTests, getInProgressAttempt } from '../utils/storageUtils';
import { ExamCard } from '../components/ExamCard';
import styles from '../styles/LandingPage.module.css';

export function LandingPage() {
  const completed = getCompletedTests();
  const bestScores = getBestScores();
  const inProgress = getInProgressAttempt();
  const examIds = Object.keys(EXAMS);

  return (
    <div className={styles.page}>
      {inProgress && (
        <section className={styles.resumeBanner}>
          <span>You have an unfinished test. </span>
          <Link
            to={`/exam/${inProgress.examId}/grade/${inProgress.gradeId}/test/${inProgress.testId}?mode=${inProgress.mode || 'practice'}`}
            className={styles.resumeLink}
          >
            Resume Test
          </Link>
        </section>
      )}
      <section className={styles.hero}>
        <h1 className={styles.title}>Grade 3 Olympiad Practice</h1>
        <p className={styles.subtitle}>
          Practice and prepare for NSO, IMO, IEO, ICS, IGKO &amp; ISSO exams
        </p>
      </section>

      <section className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.sectionTitle}>Your Progress</h2>
          <div className={styles.dashboardLinks}>
            <Link to="/question-library" className={styles.manageLink}>
              Question Library
            </Link>
            <Link to="/manage-questions" className={styles.manageLink}>
              Manage Questions
            </Link>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{completed.length}</span>
            <span className={styles.statLabel}>Tests Completed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {examIds.filter((id) => bestScores[EXAMS[id]?.id]).length}
            </span>
            <span className={styles.statLabel}>Exams Attempted</span>
          </div>
        </div>
      </section>

      <section className={styles.exams}>
        <h2 className={styles.sectionTitle}>Choose an Exam</h2>
        <div className={styles.grid}>
          {examIds.map((id) => (
            <ExamCard key={id} examId={EXAMS[id].id} />
          ))}
        </div>
      </section>
    </div>
  );
}
