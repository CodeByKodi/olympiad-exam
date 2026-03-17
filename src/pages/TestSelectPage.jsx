import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EXAMS, TEST_MODES, TESTS_PER_EXAM } from '../constants/exams';
import { TestCard } from '../components/TestCard';
import { getTestMetadata } from '../utils/loadTestData';
import { useQuestionLibrary } from '../context/QuestionLibraryContext';
import styles from '../styles/TestSelectPage.module.css';

export function TestSelectPage() {
  const { examId, gradeId } = useParams();
  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const [testMeta, setTestMeta] = useState({});
  const { getMockPacks, getPracticePacks, hasLibraryPacks } = useQuestionLibrary();

  const hasPracticePacks = hasLibraryPacks(exam.id, gradeId, 'practice');
  const hasMockPacks = hasLibraryPacks(exam.id, gradeId, 'mock');
  const mockPacks = getMockPacks(exam.id, gradeId);
  const practicePacks = hasPracticePacks ? getPracticePacks(exam.id, gradeId) : [];

  useEffect(() => {
    if (hasPracticePacks || hasMockPacks) return;
    const load = async () => {
      const meta = {};
      for (const t of TESTS_PER_EXAM) {
        try {
          const m = await getTestMetadata(exam.id, gradeId, t.id);
          meta[t.id] = m;
        } catch {
          meta[t.id] = { questionCount: 10, durationMinutes: 15 };
        }
      }
      setTestMeta(meta);
    };
    load();
  }, [exam.id, gradeId, hasPracticePacks, hasMockPacks]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{exam.fullName} — Grade {gradeId}</h1>
        <p className={styles.subtitle}>Choose a test mode and test</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Practice Mode</h2>
        <p className={styles.sectionDesc}>Take your time, get instant feedback, and learn as you go. Topic-based practice packs.</p>
        <div className={styles.grid}>
          {hasPracticePacks && practicePacks.length > 0 ? (
            (() => {
              const byTopic = practicePacks.reduce((acc, p) => {
                const t = p.topic || 'General';
                if (!acc[t]) acc[t] = [];
                acc[t].push(p);
                return acc;
              }, {});
              return Object.entries(byTopic).map(([topic, packs]) => (
                <div key={`topic-${topic}`} className={styles.topicGroup}>
                  <h3 className={styles.topicGroupTitle}>{topic}</h3>
                  <div className={styles.topicGrid}>
                    {packs.map((p) => (
                      <TestCard
                        key={`practice-${p.id}`}
                        examId={exam.id}
                        gradeId={gradeId}
                        testId={p.id}
                        mode={TEST_MODES.PRACTICE}
                        questionCount={p.questionCount}
                        durationMinutes={p.durationMinutes}
                        title={p.title}
                        topic={p.topic}
                      />
                    ))}
                  </div>
                </div>
              ));
            })()
          ) : !hasPracticePacks ? (
            TESTS_PER_EXAM.map((t) => (
              <TestCard
                key={`practice-${t.id}`}
                examId={exam.id}
                gradeId={gradeId}
                testId={t.id}
                mode={TEST_MODES.PRACTICE}
                questionCount={testMeta[t.id]?.questionCount ?? 10}
                durationMinutes={testMeta[t.id]?.durationMinutes ?? 15}
                title={t.title}
              />
            ))
          ) : practicePacks.length === 0 ? (
            <p className={styles.emptyHint}>
              No practice questions yet.{' '}
              <Link to="/question-library" className={styles.emptyLink}>Import packs in the Library</Link>
              {' '}to get started.
            </p>
          ) : null}
        </div>
      </section>

      <section className={`${styles.section} ${styles.mockSection}`}>
        <h2 className={styles.sectionTitle}>Mock Test Mode</h2>
        <p className={styles.sectionDesc}>Timed exam simulation. No feedback until you submit.</p>
        <div className={styles.grid}>
          {hasMockPacks ? (
            mockPacks.map((p) => (
              <TestCard
                key={`mock-${p.id}`}
                examId={exam.id}
                gradeId={gradeId}
                testId={p.id}
                mode={TEST_MODES.MOCK}
                questionCount={p.questionCount}
                durationMinutes={p.durationMinutes}
                title={p.title}
              />
            ))
          ) : (
            TESTS_PER_EXAM.map((t) => (
              <TestCard
                key={`mock-${t.id}`}
                examId={exam.id}
                gradeId={gradeId}
                testId={t.id}
                mode={TEST_MODES.MOCK}
                questionCount={testMeta[t.id]?.questionCount ?? 10}
                durationMinutes={testMeta[t.id]?.durationMinutes ?? 15}
                title={t.title}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
