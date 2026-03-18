import { Link } from 'react-router-dom';
import { EXAMS } from '../constants/exams';
import { getBestScores, getCompletedTests, getInProgressAttempt } from '../utils/storageUtils';
import { useRole } from '../hooks/useRole';
import { FirstTimeTooltip } from '../components/FirstTimeTooltip';
import styles from '../styles/LandingPage.module.css';

export function LandingPage() {
  const { hasLibraryAccess, isLoggedIn } = useRole();
  const completed = getCompletedTests();
  const bestScores = getBestScores();
  const inProgress = getInProgressAttempt();
  const showFirstTimeHint = completed.length === 0;
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
        <h1 className={styles.title}>Learn for Free</h1>
        {showFirstTimeHint && <FirstTimeTooltip />}
        <p className={styles.tagline}>
          Practice Olympiad exams at your own pace. No cost. No registration required to start.
        </p>
        <p className={styles.subtitle}>
          NSO • IMO • IEO • ICS • IGKO • ISSO — Grades 1–12
        </p>
        <div className={styles.heroSteps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <span className={styles.stepText}>Pick an exam from the menu above</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <span className={styles.stepText}>Choose your grade</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <span className={styles.stepText}>Start practicing</span>
          </div>
        </div>
      </section>

      <section className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.sectionTitle}>Your Progress</h2>
          {hasLibraryAccess && (
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
          {isLoggedIn && (
            <Link to="/progress" className={styles.statCardLink}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>📊</span>
                <span className={styles.statLabel}>View Progress</span>
              </div>
            </Link>
          )}
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

      <section className={styles.features}>
        <h1 className={styles.featuresTitle}>What you get</h1>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📝</span>
            <h3 className={styles.featureTitle}>Practice Mode</h3>
            <p className={styles.featureDesc}>Get instant feedback. Learn as you go.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⏱️</span>
            <h3 className={styles.featureTitle}>Mock Tests</h3>
            <p className={styles.featureDesc}>Timed exam simulation. No feedback until submit.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📱</span>
            <h3 className={styles.featureTitle}>Works offline</h3>
            <p className={styles.featureDesc}>Your progress is saved locally.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔄</span>
            <h3 className={styles.featureTitle}>Review wrong answers</h3>
            <p className={styles.featureDesc}>Practice only the questions you got wrong.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
