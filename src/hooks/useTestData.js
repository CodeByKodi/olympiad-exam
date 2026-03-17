import { useState, useEffect } from 'react';
import { loadTestData } from '../utils/loadTestData';
import { loadPracticePool, loadPracticePack, loadMockPack } from '../utils/loadLibraryTestData';
import { normalizeCorrectAnswer } from '../utils/scoreUtils';
import { useQuestionLibrary } from '../context/QuestionLibraryContext';
import { TESTS_PER_EXAM } from '../constants/exams';

/**
 * Hook to load test data.
 * Tries library first when available; falls back to public JSON.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} testId - 'practice' for combined pool, packId for mock, or '1'-'5' for built-in
 * @param {boolean} shuffleQuestions
 * @param {boolean} shuffleOptions
 */
export function useTestData(examId, gradeId, testId, shuffleQuestions = false, shuffleOptions = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { packs, getMockPacks, hasLibraryPacks } = useQuestionLibrary();

  useEffect(() => {
    if (!examId || !gradeId || !testId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      let raw = null;

      const isPracticePool = testId === 'practice';
      const mockPacks = getMockPacks(examId, gradeId);
      const isLibraryMock = mockPacks.some((p) => p.id === testId);
      const isLibraryPracticePack = packs.some(
        (p) =>
          p.enabled !== false &&
          p.exam === examId &&
          String(p.grade) === String(gradeId) &&
          p.mode === 'practice' &&
          p.packId === testId
      );

      if (isPracticePool && hasLibraryPacks(examId, gradeId, 'practice')) {
        raw = await loadPracticePool(examId, gradeId, packs);
      } else if (isLibraryPracticePack) {
        raw = await loadPracticePack(examId, gradeId, testId, packs);
      } else if (isLibraryMock) {
        raw = await loadMockPack(examId, gradeId, testId, packs);
      }

      if (!raw && !isPracticePool) {
        const builtInId = TESTS_PER_EXAM.some((t) => t.id === testId) ? testId : null;
        if (builtInId) {
          raw = await loadTestData(examId, gradeId, builtInId);
        }
      }

      if (cancelled) return;

      if (!raw) {
        setError(new Error('Test not found'));
        setLoading(false);
        return;
      }

      let questions = raw.questions || raw;
      if (!Array.isArray(questions)) questions = [];

      if (shuffleQuestions) {
        questions = [...questions].sort(() => Math.random() - 0.5);
      }

      if (shuffleOptions) {
        questions = questions.map((q) => {
          const opts = q.options || [];
          const indices = opts.map((_, i) => i);
          indices.sort(() => Math.random() - 0.5);
          const newOpts = indices.map((i) => opts[i]);
          const oldCorrectIdx = normalizeCorrectAnswer(q.correctAnswer, opts.length);
          const newCorrect = indices.indexOf(oldCorrectIdx);
          return {
            ...q,
            options: newOpts,
            correctAnswer: newCorrect >= 0 ? newCorrect : oldCorrectIdx,
          };
        });
      }

      setData({
        ...raw,
        questions,
      });
      setLoading(false);
    };

    load().catch((err) => {
      if (!cancelled) {
        setError(err);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [examId, gradeId, testId, shuffleQuestions, shuffleOptions, packs, getMockPacks, hasLibraryPacks]);

  return { data, loading, error };
}
