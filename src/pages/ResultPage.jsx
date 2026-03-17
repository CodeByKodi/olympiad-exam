import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { EXAMS, STORAGE_KEYS } from '../constants/exams';
import { ResultSummary } from '../components/ResultSummary';
import { ReviewPanel } from '../components/ReviewPanel';
import styles from '../styles/ResultPage.module.css';

function getLastResultKey(examId, gradeId, testId) {
  return `${STORAGE_KEYS.LAST_RESULT}_${examId}_${gradeId}_${testId}`;
}

function saveLastResult(examId, gradeId, testId, data) {
  try {
    sessionStorage.setItem(getLastResultKey(examId, gradeId, testId), JSON.stringify(data));
  } catch {}
}

function loadLastResult(examId, gradeId, testId) {
  try {
    const raw = sessionStorage.getItem(getLastResultKey(examId, gradeId, testId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ResultPage() {
  const { examId, gradeId, testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fromState = location.state || {};
  const fromStorage = !fromState.summary && !fromState.questions?.length
    ? loadLastResult(examId, gradeId, testId)
    : null;
  const { questions = [], answers = {}, summary } = fromState.summary
    ? fromState
    : (fromStorage || fromState);

  const hasResult = !!fromState.summary && !!fromState.questions?.length;
  const resultAnswers = fromState.answers;
  const resultQuestions = fromState.questions;
  const resultSummary = fromState.summary;

  useEffect(() => {
    if (hasResult && resultQuestions && resultSummary) {
      saveLastResult(examId, gradeId, testId, {
        questions: resultQuestions,
        answers: resultAnswers || {},
        summary: resultSummary,
      });
    }
  }, [examId, gradeId, testId, hasResult, resultAnswers, resultQuestions, resultSummary]);

  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;

  if (!summary || !questions.length) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          No result data found. Please take a test first.
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const exportData = {
      examId,
      gradeId,
      testId,
      examName: exam.fullName,
      timestamp: new Date().toISOString(),
      summary,
      review: questions.map((q, idx) => ({
        questionNumber: idx + 1,
        questionText: q.questionText,
        userAnswer: answers[q.id],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `olympiad-result-${examId}-test${testId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Test Results</h1>
        <p className={styles.subtitle}>
          {exam.fullName} — Grade {gradeId} • Test {testId}
        </p>
      </div>

      <ResultSummary summary={summary} />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => navigate(`/exam/${examId}/grade/${gradeId}/test/${testId}`, { replace: true })}
        >
          Restart Test
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => navigate(`/exam/${examId}/grade/${gradeId}`)}
        >
          Choose Another Test
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
        <button
          type="button"
          className={styles.printBtn}
          onClick={handlePrint}
        >
          Print Results
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleExportJson}
        >
          Export to JSON
        </button>
      </div>

      <ReviewPanel
        questions={questions}
        userAnswers={answers}
      />
    </div>
  );
}
