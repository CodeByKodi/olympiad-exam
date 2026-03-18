import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EXAMS, TEST_MODES } from '../constants/exams';
import { TestCard } from '../components/TestCard';
import { PackSkeleton } from '../components/PackSkeleton';
import { useQuestionLibrary } from '../hooks/useQuestionLibrary';
import { resolveStaticPath } from '../config';
import * as libraryService from '../services/questionLibraryService';
import styles from '../styles/TestSelectPage.module.css';

/** Sample pack paths for import when no built-in content exists. */
const SAMPLE_PACKS = {
  practice: 'sample-packs/nso-grade3-practice.json',
  mock: 'sample-packs/nso-grade3-mock.json',
};

function getSamplePackDownloadUrl(mode = 'practice') {
  const relPath = SAMPLE_PACKS[mode] || SAMPLE_PACKS.practice;
  const path = resolveStaticPath(relPath);
  const clean = path.startsWith('./') ? path.slice(1) : path;
  return `${window.location.origin}${clean.startsWith('/') ? '' : '/'}${clean}`;
}

export function TestSelectPage() {
  const { examId, gradeId } = useParams();
  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const { getMockPacks, getPracticePacks, hasLibraryPacks, loading, reload, loadBankFor, preloadBankFor, hasBankFor } = useQuestionLibrary();
  const [importingSample, setImportingSample] = useState(false);
  const [topicFilter, setTopicFilter] = useState('all');

  useEffect(() => {
    if (examId && gradeId && !hasBankFor(exam.id, gradeId)) {
      loadBankFor(exam.id, gradeId);
    }
  }, [examId, gradeId, exam.id, loadBankFor, hasBankFor]);

  useEffect(() => {
    if (examId && gradeId && hasBankFor(exam.id, gradeId)) {
      const nextGrade = parseInt(gradeId, 10) + 1;
      if (nextGrade >= 1 && nextGrade <= 12) {
        preloadBankFor(exam.id, String(nextGrade));
      }
    }
  }, [examId, gradeId, exam.id, hasBankFor, preloadBankFor]);

  const handleImportSample = async (mode) => {
    setImportingSample(true);
    try {
      const url = getSamplePackDownloadUrl(mode);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch sample');
      const data = await res.json();
      // Adapt sample to current exam/grade so it appears on this page
      const adapted = {
        ...data,
        exam: exam.id,
        grade: Number(gradeId) || 3,
        packId: `${exam.id}-grade${gradeId}-${mode === 'mock' ? 'mock-01' : 'plants-animals-practice-01'}`,
      };
      const result = await libraryService.importPack(JSON.stringify(adapted), true);
      if (result.ok) await reload();
      else throw new Error(result.error);
    } catch (e) {
      alert(e.message || 'Import failed');
    } finally {
      setImportingSample(false);
    }
  };

  const hasPracticePacks = hasLibraryPacks(exam.id, gradeId, 'practice');
  const hasMockPacks = hasLibraryPacks(exam.id, gradeId, 'mock');
  const mockPacks = getMockPacks(exam.id, gradeId);
  const practicePacks = hasPracticePacks ? getPracticePacks(exam.id, gradeId) : [];

  const emptyContent = !hasPracticePacks && !hasMockPacks;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{exam.fullName} — Grade {gradeId}</h1>
        <p className={styles.subtitle}>Choose a test mode and test</p>
        {loading && (
          <div className={styles.loadingSkeleton}>
            <PackSkeleton count={6} />
          </div>
        )}
        {!loading && emptyContent && (
          <p className={styles.loadingHint}>
            <button
              type="button"
              className={styles.reloadBtn}
              onClick={async () => {
                await reload();
                loadBankFor(exam.id, gradeId, true);
              }}
            >
              Reload content
            </button>
            {' '}if content should be available.
          </p>
        )}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Practice Mode</h2>
            <p className={styles.sectionDesc}>Take your time, get instant feedback, and learn as you go. Topic-based practice packs.</p>
          </div>
          {hasPracticePacks && practicePacks.length > 0 && (() => {
            const topics = [...new Set(practicePacks.map((p) => p.topic || 'General'))].sort();
            if (topics.length <= 1) return null;
            return (
              <label className={styles.topicFilter}>
                <span className={styles.topicFilterLabel}>Filter:</span>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className={styles.topicFilterSelect}
                  aria-label="Filter by topic"
                >
                  <option value="all">All topics</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            );
          })()}
        </div>
        <div className={styles.grid}>
          {hasPracticePacks && practicePacks.length > 0 ? (
            (() => {
              const byTopic = practicePacks.reduce((acc, p) => {
                const t = p.topic || 'General';
                if (!acc[t]) acc[t] = [];
                acc[t].push(p);
                return acc;
              }, {});
              const entries = topicFilter === 'all'
                ? Object.entries(byTopic)
                : Object.entries(byTopic).filter(([t]) => t === topicFilter);
              return entries.map(([topic, packs]) => (
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
          ) : !loading && !hasPracticePacks ? (
            <p className={styles.emptyHint}>
              No practice content for this grade yet.{' '}
              <Link to="/question-library" className={styles.emptyLink}>Import packs in the Library</Link>
              ,{' '}
              <button
                type="button"
                className={styles.emptyLink}
                onClick={() => handleImportSample('practice')}
                disabled={importingSample}
              >
                import a sample pack
              </button>
              , or{' '}
              <a href={getSamplePackDownloadUrl()} download="sample-practice-pack.json" className={styles.emptyLink}>
                download a sample
              </a>
              {' '}to get started.
            </p>
          ) : !loading && practicePacks.length === 0 ? (
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
          ) : !loading ? (
            <p className={styles.emptyHint}>
              No mock tests for this grade yet.{' '}
              <Link to="/question-library" className={styles.emptyLink}>Import packs in the Library</Link>
              ,{' '}
              <button
                type="button"
                className={styles.emptyLink}
                onClick={() => handleImportSample('mock')}
                disabled={importingSample}
              >
                import a sample mock pack
              </button>
              , or{' '}
              <a href={getSamplePackDownloadUrl('mock')} download="sample-mock-pack.json" className={styles.emptyLink}>
                download a sample
              </a>
              {' '}to add mock tests.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
