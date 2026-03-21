import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EXAMS, TEST_MODES } from '../constants/exams';
import { TestCard } from '../components/TestCard';
import { PackSkeleton } from '../components/PackSkeleton';
import { useQuestionLibrary } from '../hooks/useQuestionLibrary';
import { resolveStaticPath } from '../config';
import * as libraryService from '../services/questionLibraryService';
import styles from '../styles/TestSelectPage.module.css';

const EMPTY_PACKS = [];

const PRACTICE_SORT_OPTIONS = [
  { value: 'topic', label: 'Topic, then title' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'questions', label: 'Fewest questions first' },
  { value: 'duration', label: 'Shortest time first' },
];

const MOCK_SORT_OPTIONS = [
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'questions', label: 'Fewest questions first' },
  { value: 'duration', label: 'Shortest time first' },
];

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
  const [practiceSearch, setPracticeSearch] = useState('');
  const [practiceSort, setPracticeSort] = useState('topic');
  const [mockSearch, setMockSearch] = useState('');
  const [mockSort, setMockSort] = useState('title');

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
  const practicePacks = useMemo(() => {
    if (!hasPracticePacks) return EMPTY_PACKS;
    return getPracticePacks(exam.id, gradeId);
  }, [hasPracticePacks, getPracticePacks, exam.id, gradeId]);

  /** Filtered + sorted practice packs (search, topic, sort). */
  const visiblePracticePacks = useMemo(() => {
    if (!practicePacks.length) return EMPTY_PACKS;
    const q = practiceSearch.trim().toLowerCase();
    let filtered =
      topicFilter === 'all'
        ? practicePacks
        : practicePacks.filter((p) => (p.topic || 'General') === topicFilter);
    if (q) {
      filtered = filtered.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.topic || '').toLowerCase().includes(q) ||
          String(p.id || '').toLowerCase().includes(q),
      );
    }
    return [...filtered].sort((a, b) => {
      switch (practiceSort) {
        case 'title':
          return (a.title || a.id || '').localeCompare(b.title || b.id || '');
        case 'duration':
          return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
        case 'questions':
          return (a.questionCount ?? 0) - (b.questionCount ?? 0);
        case 'topic':
        default: {
          const ta = a.topic || 'General';
          const tb = b.topic || 'General';
          if (ta !== tb) return ta.localeCompare(tb);
          return (a.title || a.id || '').localeCompare(b.title || b.id || '');
        }
      }
    });
  }, [practicePacks, topicFilter, practiceSearch, practiceSort]);

  const visibleMockPacks = useMemo(() => {
    if (!mockPacks.length) return EMPTY_PACKS;
    const q = mockSearch.trim().toLowerCase();
    const filtered = q
      ? mockPacks.filter(
          (p) =>
            (p.title || '').toLowerCase().includes(q) ||
            String(p.id || '').toLowerCase().includes(q),
        )
      : mockPacks;
    return [...filtered].sort((a, b) => {
      switch (mockSort) {
        case 'duration':
          return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
        case 'questions':
          return (a.questionCount ?? 0) - (b.questionCount ?? 0);
        case 'title':
        default:
          return (a.title || a.id || '').localeCompare(b.title || b.id || '');
      }
    });
  }, [mockPacks, mockSearch, mockSort]);

  const emptyContent = !hasPracticePacks && !hasMockPacks;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{exam.fullName} — Grade {gradeId}</h1>
        <p className={styles.subtitle}>
          Choose a test mode and test. Use search and sort to find practice packs quickly.
        </p>
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

      <section className={styles.section} aria-labelledby="practice-heading">
        <div className={styles.sectionIntro}>
          <h2 id="practice-heading" className={styles.sectionTitle}>
            Practice Mode
          </h2>
          <p className={styles.sectionDesc}>
            Take your time, get instant feedback, and learn as you go. Each card shows its topic badge.
          </p>
        </div>

        {hasPracticePacks && practicePacks.length > 0 && (
          <div className={styles.stickyToolbar}>
            <div className={styles.toolbarRow}>
              <label className={styles.searchField}>
                <span className={styles.visuallyHidden}>Search practice packs</span>
                <input
                  type="search"
                  value={practiceSearch}
                  onChange={(e) => setPracticeSearch(e.target.value)}
                  placeholder="Search by title, topic, or pack ID…"
                  className={styles.searchInput}
                  autoComplete="off"
                  enterKeyHint="search"
                />
              </label>
              <label className={styles.sortField}>
                <span className={styles.fieldLabel}>Sort</span>
                <select
                  value={practiceSort}
                  onChange={(e) => setPracticeSort(e.target.value)}
                  className={styles.toolbarSelect}
                  aria-label="Sort practice packs"
                >
                  {PRACTICE_SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {(() => {
              const topics = [...new Set(practicePacks.map((p) => p.topic || 'General'))].sort();
              if (topics.length <= 1) return null;
              return (
                <div className={styles.toolbarRow}>
                  <label className={styles.topicFilter}>
                    <span className={styles.fieldLabel}>Topic</span>
                    <select
                      value={topicFilter}
                      onChange={(e) => setTopicFilter(e.target.value)}
                      className={styles.toolbarSelect}
                      aria-label="Filter by topic"
                    >
                      <option value="all">All topics</option>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              );
            })()}
          </div>
        )}

        <div className={styles.packGrid}>
          {hasPracticePacks && visiblePracticePacks.length > 0 ? (
            visiblePracticePacks.map((p) => (
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
                packOrigin={p.packOrigin}
              />
            ))
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
          ) : !loading && hasPracticePacks && visiblePracticePacks.length === 0 ? (
            <p className={styles.emptyHint}>
              {practiceSearch.trim() ? (
                <>
                  No practice packs match “{practiceSearch.trim()}”.{' '}
                  <button type="button" className={styles.emptyLink} onClick={() => setPracticeSearch('')}>
                    Clear search
                  </button>
                </>
              ) : topicFilter !== 'all' ? (
                <>
                  No practice packs for this topic.{' '}
                  <button
                    type="button"
                    className={styles.emptyLink}
                    onClick={() => setTopicFilter('all')}
                  >
                    Show all topics
                  </button>
                </>
              ) : (
                <>
                  No practice questions yet.{' '}
                  <Link to="/question-library" className={styles.emptyLink}>Import packs in the Library</Link>
                  {' '}to get started.
                </>
              )}
            </p>
          ) : null}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.mockSection}`}
        aria-labelledby="mock-heading"
      >
        <div className={styles.sectionIntro}>
          <h2 id="mock-heading" className={styles.sectionTitle}>
            Mock Test Mode
          </h2>
          <p className={styles.sectionDesc}>
            Timed exam simulation. No feedback until you submit.
          </p>
        </div>

        {hasMockPacks && mockPacks.length > 0 && (
          <div className={styles.mockToolbar}>
            <div className={styles.toolbarRow}>
              <label className={styles.searchField}>
                <span className={styles.visuallyHidden}>Search mock tests</span>
                <input
                  type="search"
                  value={mockSearch}
                  onChange={(e) => setMockSearch(e.target.value)}
                  placeholder="Search mock tests by title or pack ID…"
                  className={styles.searchInput}
                  autoComplete="off"
                />
              </label>
              <label className={styles.sortField}>
                <span className={styles.fieldLabel}>Sort</span>
                <select
                  value={mockSort}
                  onChange={(e) => setMockSort(e.target.value)}
                  className={styles.toolbarSelect}
                  aria-label="Sort mock tests"
                >
                  {MOCK_SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        <div className={styles.packGrid}>
          {hasMockPacks && visibleMockPacks.length > 0 ? (
            visibleMockPacks.map((p) => (
              <TestCard
                key={`mock-${p.id}`}
                examId={exam.id}
                gradeId={gradeId}
                testId={p.id}
                mode={TEST_MODES.MOCK}
                questionCount={p.questionCount}
                durationMinutes={p.durationMinutes}
                title={p.title}
                packOrigin={p.packOrigin}
              />
            ))
          ) : hasMockPacks && visibleMockPacks.length === 0 && mockSearch.trim() ? (
            <p className={styles.emptyHint}>
              No mock tests match “{mockSearch.trim()}”.{' '}
              <button type="button" className={styles.emptyLink} onClick={() => setMockSearch('')}>
                Clear search
              </button>
            </p>
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
