import { Link } from 'react-router-dom';
import { EXAMS } from '../constants/exams';
import { getBestScores, getCompletedTests } from '../utils/storageUtils';
import styles from '../styles/ProgressPage.module.css';

export function ProgressPage() {
  const completed = getCompletedTests();
  const bestScores = getBestScores();
  const examIds = Object.keys(EXAMS);

  const byExam = examIds.reduce((acc, id) => {
    const exam = EXAMS[id];
    const tests = completed.filter((t) => t.examId === exam.id);
    const best = bestScores[exam.id];
    acc[exam.id] = { exam, tests, best };
    return acc;
  }, {});

  const byTopic = completed.reduce((acc, t) => {
    const breakdown = t.topicBreakdown || {};
    Object.entries(breakdown).forEach(([topic, { correct, total }]) => {
      if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
      acc[topic].correct += correct;
      acc[topic].total += total;
    });
    return acc;
  }, {});
  const topicList = Object.entries(byTopic)
    .filter(([, v]) => v.total > 0)
    .map(([topic, v]) => ({ topic, ...v, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { dateStyle: 'short' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Progress</h1>
        <p className={styles.subtitle}>
          Tests completed and best scores by exam
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{completed.length}</span>
          <span className={styles.statLabel}>Total Tests Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {examIds.filter((id) => bestScores[EXAMS[id]?.id]).length}
          </span>
          <span className={styles.statLabel}>Exams Attempted</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>By Exam</h2>
        <div className={styles.examGrid}>
          {Object.values(byExam).map(({ exam, tests, best }) => (
            <div key={exam.id} className={styles.examCard} style={{ '--exam-color': exam.color }}>
              <div className={styles.examHeader}>
                <span className={styles.examIcon}>{exam.icon}</span>
                <h3 className={styles.examName}>{exam.fullName}</h3>
              </div>
              <div className={styles.examStats}>
                <div className={styles.examStat}>
                  <span className={styles.examStatValue}>{tests.length}</span>
                  <span className={styles.examStatLabel}>Tests done</span>
                </div>
                {best && (
                  <div className={styles.examStat}>
                    <span className={styles.examStatValue}>{best.percentage}%</span>
                    <span className={styles.examStatLabel}>Best score</span>
                  </div>
                )}
              </div>
              <Link to={`/exam/${exam.id}`} className={styles.examLink}>
                Practice {exam.name} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {topicList.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>By Topic</h2>
          <p className={styles.sectionDesc}>Topics you may want to practice more (lower scores first)</p>
          <ul className={styles.topicList}>
            {topicList.map(({ topic, correct, total, pct }) => (
              <li key={topic} className={styles.topicItem}>
                <span className={styles.topicName}>{topic}</span>
                <span className={styles.topicScore}>{correct}/{total} ({pct}%)</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Tests</h2>
        {completed.length === 0 ? (
          <p className={styles.empty}>No tests completed yet. Start practicing!</p>
        ) : (
          <ul className={styles.recentList}>
            {completed.slice(0, 15).map((t, i) => (
              <li key={i} className={styles.recentItem}>
                <span className={styles.recentExam}>{EXAMS[t.examId?.toUpperCase()]?.fullName || t.examId}</span>
                <span className={styles.recentGrade}>Grade {t.gradeId}</span>
                <span className={styles.recentScore}>{t.percentage ?? t.score ?? '—'}%</span>
                <span className={styles.recentDate}>{formatDate(t.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.exportBtn}
          onClick={() => {
            const data = {
              completed: completed,
              bestScores: bestScores,
              exportedAt: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `olympiad-progress-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export Progress (JSON)
        </button>
        <Link to="/home" className={styles.backLink}>← Back to Home</Link>
      </div>
    </div>
  );
}
