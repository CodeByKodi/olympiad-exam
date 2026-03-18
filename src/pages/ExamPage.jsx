import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
import { calculateScoreSummary, normalizeCorrectAnswer } from '../utils/scoreUtils';
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
  const location = useLocation();
  const mode = searchParams.get('mode') || TEST_MODES.PRACTICE;
  const isPractice = mode === TEST_MODES.PRACTICE;

  const customQuestions = location.state?.customQuestions;
  const isReviewWrong = testId === 'review-wrong' && Array.isArray(customQuestions) && customQuestions.length > 0;

  const settings = getSettings();
  const { data, loading, error } = useTestData(
    examId,
    gradeId,
    isReviewWrong ? 'practice' : testId,
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
  const [timerPaused, setTimerPaused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);
  const questionRef = useRef(null);

  const exam = EXAMS[examId?.toUpperCase()] || EXAMS.NSO;
  const questions = useMemo(() => {
    if (isReviewWrong) return customQuestions;
    return data?.questions || [];
  }, [isReviewWrong, customQuestions, data?.questions]);
  const durationMinutes = isReviewWrong ? Math.ceil(questions.length * 1.2) : (data?.durationMinutes ?? MOCK_TEST_DURATION_MINUTES);
  const totalSeconds = parseDurationToSeconds(durationMinutes);
  const currentQuestion = questions[Math.min(currentIndex, Math.max(0, questions.length - 1))];

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
            setTimerPaused(inProgress.timerPaused ?? false);
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
    questionRef.current?.focus({ preventScroll: true });
  }, [currentIndex]);

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
    const topicBreakdown = questions.reduce((acc, q) => {
      const topic = q.topic || 'General';
      if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
      acc[topic].total++;
      const userAns = answers[q.id];
      if (userAns != null && userAns >= 0) {
        const correctIdx = normalizeCorrectAnswer(q.correctAnswer, q.options?.length ?? 4);
        if (userAns === correctIdx) acc[topic].correct++;
      }
      return acc;
    }, {});
    addCompletedTest({
      examId,
      gradeId,
      testId,
      mode,
      ...summary,
      topicBreakdown,
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
    if (timerPaused || isPractice || submitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t == null || t <= 0) return t;
        return Math.max(0, t - 1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPractice, timerPaused, submitted]);

  useEffect(() => {
    if (!isPractice && !submitted && getInProgressAttempt()) {
      const handler = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [isPractice, submitted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (submitted || !questions.length) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setCurrentIndex((i) => Math.max(0, i - 1));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'Enter':
          e.preventDefault();
          if (currentIndex >= questions.length - 1) {
            setShowSubmitModal(true);
          } else {
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            const idx = parseInt(e.key, 10) - 1;
            const opts = currentQuestion?.options?.length ?? 0;
            if (idx >= 0 && idx < opts) {
              e.preventDefault();
              handleSelectAnswer(currentQuestion.id, idx);
            }
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions.length, submitted, currentQuestion, handleSelectAnswer, currentIndex]);

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
        timerPaused,
        startedAt: Date.now(),
      });
    }
  }, [examId, gradeId, testId, mode, answers, currentIndex, markedForReview, timeRemaining, timerPaused, questions.length]);

  if (!isReviewWrong && loading) {
    return <ExamSkeleton />;
  }

  if (isReviewWrong && questions.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          No questions to review. <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  if (!isReviewWrong && (error || questions.length === 0)) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          Failed to load test. Please go back and try again.
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          Failed to load test. Please go back and try again.
        </div>
      </div>
    );
  }
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] >= 0
  ).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className={styles.page}>
      <a href="#question-content" className={styles.skipToQuestion}>
        Skip to question
      </a>
      <ExamHeader
        examName={exam.fullName}
        testTitle={data?.title || `Test ${testId}`}
        gradeId={gradeId}
        mode={isPractice ? 'practice' : 'mock'}
        timeRemaining={timeRemaining}
        timeExpired={timeExpired}
        timerPaused={timerPaused}
        onPause={() => setTimerPaused((p) => !p)}
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
          <div
            id="question-content"
            ref={questionRef}
            tabIndex={-1}
            className={styles.questionFocusTarget}
          >
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
          </div>

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
