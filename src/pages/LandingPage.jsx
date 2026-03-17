import { Link } from 'react-router-dom';
import { EXAMS } from '../constants/exams';
import { getBestScores, getCompletedTests, getInProgressAttempt } from '../utils/storageUtils';
import { ExamCard } from '../components/ExamCard';
import { useRole } from '../context/RoleContext';
import styles from '../styles/LandingPage.module.css';

export function LandingPage() {
  const { isAdmin } = useRole();
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
        <h1 className={styles.title}>Olympiad Practice</h1>
        <p className={styles.subtitle}>
          Practice and prepare for NSO, IMO, IEO, ICS, IGKO &amp; ISSO exams
        </p>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>What you get</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📝</span>
            <h3 className={styles.featureTitle}>Practice Mode</h3>
            <p className={styles.featureDesc}>Take your time with instant feedback after each question.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⏱️</span>
            <h3 className={styles.featureTitle}>Mock Tests</h3>
            <p className={styles.featureDesc}>Timed exams that simulate the real Olympiad experience.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📚</span>
            <h3 className={styles.featureTitle}>Question Library</h3>
            <p className={styles.featureDesc}>Import and manage your own question packs.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📊</span>
            <h3 className={styles.featureTitle}>Track Progress</h3>
            <p className={styles.featureDesc}>See your scores and completed tests over time.</p>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <h3 className={styles.stepTitle}>Choose an exam</h3>
            <p className={styles.stepDesc}>Pick NSO, IMO, IEO, ICS, IGKO, or ISSO.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <h3 className={styles.stepTitle}>Select your grade</h3>
            <p className={styles.stepDesc}>Choose your grade level.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <h3 className={styles.stepTitle}>Start practicing</h3>
            <p className={styles.stepDesc}>Pick practice or mock mode and begin.</p>
          </div>
        </div>
      </section>

      <section className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.sectionTitle}>Your Progress</h2>
          {isAdmin && (
            <div className={styles.dashboardLinks}>
              <Link to="/question-library" className={styles.manageLink}>
                Question Library
              </Link>
              <Link to="/manage-questions" className={styles.manageLink}>
                Manage Questions
              </Link>
            </div>
          )}
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

      <section className={styles.motivation}>
        <div className={styles.motivationContent}>
          <h3 className={styles.motivationTitle}>Practice makes perfect</h3>
          <p className={styles.motivationDesc}>
            Regular practice builds confidence and sharpens your skills. Start with any exam and track your progress.
          </p>
        </div>
      </section>

      <section className={styles.exams}>
        <h2 className={styles.sectionTitle}>Choose an Exam</h2>
        <p className={styles.examsIntro}>
          Select an exam below to start. Your progress is saved automatically.
        </p>
        <div className={styles.grid}>
          {examIds.map((id) => (
            <ExamCard key={id} examId={EXAMS[id].id} />
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <p className={styles.ctaText}>Ready to practice? Pick an exam above and get started.</p>
      </section>
    </div>
  );
}
