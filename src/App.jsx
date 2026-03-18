import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { QuestionLibraryProvider } from './context/QuestionLibraryContext';
import { RoleProvider } from './context/RoleContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { GradePage } from './pages/GradePage';
import { TestSelectPage } from './pages/TestSelectPage';
import { LoginPage } from './pages/LoginPage';
import { LoadingScreen } from './components/LoadingScreen';
import { AdminRoute } from './components/AdminRoute';
import { AuthRoute } from './components/AuthRoute';
import { initStorage } from './utils/storageUtils';

const ExamPage = lazy(() => import('./pages/ExamPage').then((m) => ({ default: m.ExamPage })));
const ResultPage = lazy(() => import('./pages/ResultPage').then((m) => ({ default: m.ResultPage })));
const QuestionLibraryPage = lazy(() => import('./pages/QuestionLibraryPage').then((m) => ({ default: m.QuestionLibraryPage })));
const QuestionManagerPage = lazy(() => import('./pages/QuestionManagerPage').then((m) => ({ default: m.QuestionManagerPage })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })));

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initStorage().then(() => setReady(true));
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <RoleProvider>
        <QuestionLibraryProvider>
          <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="home" element={<LandingPage />} />
              <Route path="exam/:examId" element={<AuthRoute><GradePage /></AuthRoute>} />
              <Route path="exam/:examId/grade/:gradeId" element={<AuthRoute><TestSelectPage /></AuthRoute>} />
              <Route path="exam/:examId/grade/:gradeId/tests" element={<Navigate to=".." replace />} />
              <Route path="exam/:examId/grade/:gradeId/test/:testId" element={<AuthRoute><Suspense fallback={<LoadingScreen />}><ExamPage /></Suspense></AuthRoute>} />
              <Route path="exam/:examId/grade/:gradeId/test/:testId/result" element={<AuthRoute><Suspense fallback={<LoadingScreen />}><ResultPage /></Suspense></AuthRoute>} />
              <Route path="progress" element={<AuthRoute><Suspense fallback={<LoadingScreen />}><ProgressPage /></Suspense></AuthRoute>} />
              <Route path="manage-questions" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><QuestionManagerPage /></Suspense></AdminRoute>} />
              <Route path="question-library" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><QuestionLibraryPage /></Suspense></AdminRoute>} />
              <Route path="library" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><QuestionLibraryPage /></Suspense></AdminRoute>} />
            </Route>
            <Route path="/admin-unlock" element={<Navigate to="/" replace />} />
          </Routes>
          </HashRouter>
        </QuestionLibraryProvider>
      </RoleProvider>
    </ErrorBoundary>
  );
}

export default App;
