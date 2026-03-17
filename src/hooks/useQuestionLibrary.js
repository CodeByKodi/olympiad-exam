import { useContext } from 'react';
import { QuestionLibraryContext } from '../context/QuestionLibraryContext';

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
      getPracticePacks: () => [],
      getMockPacks: () => [],
      hasLibraryPacks: () => false,
      getPackByTestId: () => null,
      service: null,
    };
  }
  return ctx;
}
