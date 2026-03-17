import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as libraryService from '../services/questionLibraryService';
import { buildPracticePool, buildMockIndex } from '../utils/questionLibraryUtils';

const QuestionLibraryContext = createContext(null);

export function QuestionLibraryProvider({ children }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { packs: list } = await libraryService.loadLibrary();
      setPacks(list || []);
    } catch (e) {
      setError(e.message);
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { packs: list } = await libraryService.reloadLibrary();
      setPacks(list || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
    isAvailable: libraryService.isAvailable(),
    getPracticePool,
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

export function useQuestionLibrary() {
  const ctx = useContext(QuestionLibraryContext);
  if (!ctx) {
    return {
      packs: [],
      loading: false,
      error: null,
      load: () => {},
      reload: () => {},
      isAvailable: false,
      getPracticePool: () => [],
      getMockPacks: () => [],
      hasLibraryPacks: () => false,
      getPackByTestId: () => null,
      service: null,
    };
  }
  return ctx;
}
