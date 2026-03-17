import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { EXAMS, TEST_MODES, MOCK_TEST_DURATION_MINUTES } from '../constants/exams';
import { ExamHeader } from '../components/ExamHeader';
import { SectionTabs } from '../components/SectionTabs';
import { ExamSidebar } from '../components/ExamSidebar';
import { PaletteDrawer } from '../components/PaletteDrawer';
import { QuestionCard } from '../components/QuestionCard';
import { BottomActionBar } from '../components/BottomActionBar';
import { ConfirmSubmitModal } from '../components/ConfirmSubmitModal';
import { ExamSkeleton } from '../components/ExamSkeleton';
import { useTestData } from '../hooks/useTestData';
import { calculateScoreSummary } from '../utils/scoreUtils';
import {
  getSettings,
  getInProgressAttempt,
  saveInProgressAttempt,
  clearInProgressAttempt,
  addCompletedTest,
  updateBestScore,
} from '../utils/storageUtils';
import { parseDurationToSeconds } from '../utils/timeUtils';
import styles from '../styles/ExamPage.module.css';

export function ExamPage() {
  const { examId, gradeId, testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || TEST_MODES.PRACTICE;
  const isPractice = mode === TEST_MODES.PRACTICE;

  const settings = getSettings();
  const { data, loading, error } = useTestData(
    examId,
    gradeId,
    testId,
    isPractice && settings.shuffleQuestions,
    isPractice && settings.shuffleOptions
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);

  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const questions = useMemo(() => data?.questions || [], [data?.questions]);
  const durationMinutes = data?.durationMinutes ?? MOCK_TEST_DURATION_MINUTES;
  const totalSeconds = parseDurationToSeconds(durationMinutes);

  useEffect(() => {
    if (restored || !questions.length) return;
    const inProgress = getInProgressAttempt();
    const isSameAttempt =
      inProgress &&
      inProgress.examId === examId &&
      inProgress.gradeId === gradeId &&
      inProgress.testId === testId &&
      inProgress.mode === mode;
    if (isSameAttempt) {
      queueMicrotask(() => {
        setAnswers(inProgress.answers || {});
        setCurrentIndex(Math.min(inProgress.currentIndex ?? 0, questions.length - 1));
        setMarkedForReview(new Set(inProgress.markedForReview || []));
        if (!isPractice) {
          const saved = inProgress.timeRemaining;
          if (saved != null && saved > 0) {
            setTimeRemaining(Math.floor(saved));
          } else {
            setTimeExpired(true);
          }
        }
        setRestored(true);
      });
    } else if (!isPractice) {
      queueMicrotask(() => {
        setTimeRemaining(totalSeconds);
        setRestored(true);
      });
    } else {
      queueMicrotask(() => setRestored(true));
    }
  }, [examId, gradeId, testId, mode, questions.length, isPractice, totalSeconds, restored]);

  useEffect(() => {
    if (!isPractice && timeRemaining !== null && timeRemaining <= 0 && !timeExpired) {
      queueMicrotask(() => setTimeExpired(true));
    }
  }, [isPractice, timeRemaining, timeExpired]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    clearInProgressAttempt();

    const summary = calculateScoreSummary(questions, answers);
    addCompletedTest({
      examId,
      gradeId,
      testId,
      mode,
      ...summary,
    });
    updateBestScore(examId, summary.percentage, testId);

    navigate(`/exam/${examId}/grade/${gradeId}/test/${testId}/result`, {
      state: { questions, answers, summary },
    });
  }, [submitted, questions, answers, examId, gradeId, testId, mode, navigate]);

  useEffect(() => {
    if (timeExpired && !submitted) {
      queueMicrotask(() => handleSubmit());
    }
  }, [timeExpired, submitted, handleSubmit]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPractice && timeRemaining !== null && timeRemaining > 0 && !submitted) {
        setTimeRemaining((t) => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPractice, timeRemaining, submitted]);

  useEffect(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      saveInProgressAttempt({
        examId,
        gradeId,
        testId,
        mode,
        answers,
        currentIndex,
        markedForReview: [...markedForReview],
        timeRemaining,
        startedAt: Date.now(),
      });
    }
  }, [examId, gradeId, testId, mode, answers, currentIndex, markedForReview, timeRemaining, questions.length]);

  const handleSelectAnswer = useCallback((qId, idx) => {
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  }, []);

  const handleMarkForReview = useCallback(() => {
    const q = questions[currentIndex];
    if (!q) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  }, [questions, currentIndex]);

  const handleClearAnswer = useCallback(() => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
  }, [questions, currentIndex]);

  if (loading) {
    return <ExamSkeleton />;
  }

  if (error || questions.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          Failed to load test. Please go back and try again.
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] >= 0
  ).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className={styles.page}>
      <ExamHeader
        examName={exam.fullName}
        testTitle={data?.title || `Test ${testId}`}
        gradeId={gradeId}
        mode={isPractice ? 'practice' : 'mock'}
        timeRemaining={timeRemaining}
        timeExpired={timeExpired}
        onMarkForReview={handleMarkForReview}
        onSubmit={() => setShowSubmitModal(true)}
        isMarked={currentQuestion && markedForReview.has(currentQuestion.id)}
        progress={answeredCount}
        totalQuestions={questions.length}
      />

      <div className={styles.sectionTabsWrap}>
        <SectionTabs sections={[{ id: '1', label: 'Questions', count: questions.length }]} />
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          <button
            type="button"
            className={styles.paletteBtn}
            onClick={() => setPaletteDrawerOpen(true)}
            aria-label="Open question palette"
          >
            📋 Questions ({answeredCount}/{questions.length})
          </button>
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            topic={currentQuestion.topic}
            selectedAnswer={answers[currentQuestion.id]}
            onSelectAnswer={(idx) => handleSelectAnswer(currentQuestion.id, idx)}
            showFeedback={isPractice}
            correctAnswer={currentQuestion.correctAnswer}
            disabled={submitted}
            explanation={currentQuestion.explanation}
          />

          <BottomActionBar
            onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            onClearAnswer={handleClearAnswer}
            onMarkForReview={handleMarkForReview}
            onSubmit={() => setShowSubmitModal(true)}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
            isMarked={currentQuestion && markedForReview.has(currentQuestion.id)}
            hasAnswer={answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== null && answers[currentQuestion.id] >= 0}
            disabled={submitted}
          />
        </div>

        <ExamSidebar
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onSelectQuestion={setCurrentIndex}
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          markedCount={markedForReview.size}
          timeRemaining={timeRemaining}
          isPractice={isPractice}
        />
      </div>

      <ConfirmSubmitModal
        open={showSubmitModal}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitModal(false)}
        unansweredCount={unansweredCount}
      />

      <PaletteDrawer
        open={paletteDrawerOpen}
        onClose={() => setPaletteDrawerOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        markedForReview={markedForReview}
        onSelectQuestion={setCurrentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        markedCount={markedForReview.size}
        timeRemaining={timeRemaining}
        isPractice={isPractice}
      />
    </div>
  );
}
