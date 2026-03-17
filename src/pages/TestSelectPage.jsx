import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EXAMS, TEST_MODES, TESTS_PER_EXAM } from '../constants/exams';
import { TestCard } from '../components/TestCard';
import { getTestMetadata } from '../utils/loadTestData';
import { useQuestionLibrary } from '../context/QuestionLibraryContext';
import styles from '../styles/TestSelectPage.module.css';

export function TestSelectPage() {
  const { examId, gradeId } = useParams();
  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const [testMeta, setTestMeta] = useState({});
  const { getMockPacks, hasLibraryPacks, getPracticePool } = useQuestionLibrary();

  const hasPracticePacks = hasLibraryPacks(exam.id, gradeId, 'practice');
  const hasMockPacks = hasLibraryPacks(exam.id, gradeId, 'mock');
  const mockPacks = getMockPacks(exam.id, gradeId);
  const practicePool = hasPracticePacks ? getPracticePool(exam.id, gradeId) : [];

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
        <p className={styles.sectionDesc}>Take your time, get instant feedback, and learn as you go.</p>
        <div className={styles.grid}>
          {hasPracticePacks && practicePool.length > 0 ? (
            <TestCard
              examId={exam.id}
              gradeId={gradeId}
              testId="practice"
              mode={TEST_MODES.PRACTICE}
              questionCount={practicePool.length}
              durationMinutes={Math.ceil(practicePool.length * 1.5)}
              title="Practice (All Questions)"
            />
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
          ) : (
            <p className={styles.emptyHint}>No practice questions yet. Import packs in the Library.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
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
