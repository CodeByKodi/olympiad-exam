import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import * as libraryService from '../services/questionLibraryService';
import { buildPracticePool, buildMockIndex, buildPracticeIndex } from '../utils/questionLibraryUtils';

const QuestionLibraryContext = createContext(null);

export function QuestionLibraryProvider({ children }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedBanks, setLoadedBanks] = useState(new Set());
  const loadBankInProgressRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { packs: list, warning } = await libraryService.reloadLibrary();
      setPacks(list || []);
      setLoadedBanks(new Set());
      if (warning) setError(warning);
    } catch (e) {
      setError(e.message || 'Failed to load library');
      setPacks([]);
    } finally {
      if (!loadBankInProgressRef.current) setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { packs: list, warning } = await libraryService.reloadLibrary();
      setPacks(list || []);
      setLoadedBanks(new Set());
      if (warning) setError(warning);
    } catch (e) {
      setError(e.message || 'Failed to reload library');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBankFor = useCallback(async (examId, gradeId, forceRetry = false) => {
    const key = `${examId}-${gradeId}`;
    if (loadedBanks.has(key) && !forceRetry) return;
    if (forceRetry) setLoadedBanks((prev) => { const s = new Set(prev); s.delete(key); return s; });
    loadBankInProgressRef.current = true;
    setLoading(true);
    try {
      const newPacks = await libraryService.loadBankForExamGrade(examId, gradeId);
      if (newPacks.length > 0) {
        setLoadedBanks((prev) => new Set(prev).add(key));
        setPacks((prev) => {
          const filtered = prev.filter(
            (p) => !(p.isQuestionBank && p.exam === examId && String(p.grade) === String(gradeId))
          );
          return libraryService.mergeLibraries(newPacks, filtered);
        });
      }
    } catch (e) {
      console.warn('Failed to load bank for', examId, gradeId, e);
    } finally {
      loadBankInProgressRef.current = false;
      setLoading(false);
    }
  }, [loadedBanks]);

  const hasBankFor = useCallback(
    (examId, gradeId) =>
      packs.some(
        (p) =>
          p.isQuestionBank &&
          p.exam === examId &&
          String(p.grade) === String(gradeId)
      ),
    [packs]
  );

  const preloadBankFor = useCallback(async (examId, gradeId) => {
    const key = `${examId}-${gradeId}`;
    if (loadedBanks.has(key)) return;
    try {
      const newPacks = await libraryService.loadBankForExamGrade(examId, gradeId);
      if (newPacks.length > 0) {
        setLoadedBanks((prev) => new Set(prev).add(key));
        setPacks((prev) => {
          const filtered = prev.filter(
            (p) => !(p.isQuestionBank && p.exam === examId && String(p.grade) === String(gradeId))
          );
          return libraryService.mergeLibraries(newPacks, filtered);
        });
      }
    } catch {
      /* silent preload */
    }
  }, [loadedBanks]);

  useEffect(() => {
    load();
  }, [load]);

  const getPracticePool = useCallback(
    (examId, gradeId) => {
      const enabled = packs.filter(
        (p) =>
          p.enabled !== false &&
          p.exam === examId &&
          String(p.grade) === String(gradeId) &&
          p.mode === 'practice'
      );
      return buildPracticePool(enabled);
    },
    [packs]
  );

  const getMockPacks = useCallback(
    (examId, gradeId) => {
      const enabled = packs.filter(
        (p) =>
          p.enabled !== false &&
          p.exam === examId &&
          String(p.grade) === String(gradeId) &&
          p.mode === 'mock'
      );
      return buildMockIndex(enabled);
    },
    [packs]
  );

  const getPracticePacks = useCallback(
    (examId, gradeId) => {
      const enabled = packs.filter(
        (p) =>
          p.enabled !== false &&
          p.exam === examId &&
          String(p.grade) === String(gradeId) &&
          p.mode === 'practice'
      );
      return buildPracticeIndex(enabled);
    },
    [packs]
  );

  const hasLibraryPacks = useCallback(
    (examId, gradeId, mode) => {
      return packs.some(
        (p) =>
          p.enabled !== false &&
          p.exam === examId &&
          String(p.grade) === String(gradeId) &&
          p.mode === mode
      );
    },
    [packs]
  );

  const getPackByTestId = useCallback(
    (examId, gradeId, testId) => {
      return packs.find(
        (p) =>
          p.enabled !== false &&
          p.exam === examId &&
          String(p.grade) === String(gradeId) &&
          p.mode === 'mock' &&
          p.packId === testId
      );
    },
    [packs]
  );

  const value = {
    packs,
    loading,
    error,
    load,
    reload,
    loadBankFor,
    preloadBankFor,
    hasBankFor,
    isAvailable: libraryService.isAvailable(),
    getPracticePool,
    getPracticePacks,
    getMockPacks,
    hasLibraryPacks,
    getPackByTestId,
    service: libraryService,
  };

  return (
    <QuestionLibraryContext.Provider value={value}>
      {children}
    </QuestionLibraryContext.Provider>
  );
}

export { QuestionLibraryContext };
