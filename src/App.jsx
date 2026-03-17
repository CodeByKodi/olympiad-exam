import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuestionLibraryProvider } from './context/QuestionLibraryContext';
import { RoleProvider } from './context/RoleContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { GradePage } from './pages/GradePage';
import { TestSelectPage } from './pages/TestSelectPage';
import { ExamPage } from './pages/ExamPage';
import { ResultPage } from './pages/ResultPage';
import { QuestionManagerPage } from './pages/QuestionManagerPage';
import { QuestionLibraryPage } from './pages/QuestionLibraryPage';
import { AdminUnlockPage } from './pages/AdminUnlockPage';
import { LoadingScreen } from './components/LoadingScreen';
import { AdminRoute } from './components/AdminRoute';
import { initStorage } from './utils/storageUtils';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initStorage().then(() => setReady(true));
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <RoleProvider>
      <QuestionLibraryProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="exam/:examId" element={<GradePage />} />
              <Route path="exam/:examId/grade/:gradeId" element={<TestSelectPage />} />
              <Route path="exam/:examId/grade/:gradeId/tests" element={<Navigate to=".." replace />} />
              <Route path="exam/:examId/grade/:gradeId/test/:testId" element={<ExamPage />} />
              <Route path="exam/:examId/grade/:gradeId/test/:testId/result" element={<ResultPage />} />
              <Route path="manage-questions" element={<AdminRoute><QuestionManagerPage /></AdminRoute>} />
              <Route path="question-library" element={<AdminRoute><QuestionLibraryPage /></AdminRoute>} />
              <Route path="library" element={<AdminRoute><QuestionLibraryPage /></AdminRoute>} />
            </Route>
            <Route path="/admin-unlock" element={<AdminUnlockPage />} />
          </Routes>
        </HashRouter>
      </QuestionLibraryProvider>
    </RoleProvider>
  );
}

export default App;
