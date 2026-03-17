import { indexToLabel } from '../utils/answerUtils';
import { normalizeCorrectAnswer } from '../utils/scoreUtils';
import styles from '../styles/ReviewPanel.module.css';

export function ReviewPanel({ questions, userAnswers }) {
  const getCorrectIndex = (q) =>
    normalizeCorrectAnswer(q.correctAnswer, q.options?.length ?? 4);

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Review Answers</h3>
      <div className={styles.list}>
        {questions.map((q, idx) => {
          const userAns = userAnswers[q.id];
          const correctIdx = getCorrectIndex(q);
          const userIdx = userAns !== undefined && userAns !== null && userAns >= 0 ? userAns : -1;
          const isCorrect = userIdx === correctIdx;
          const isUnanswered = userIdx < 0;

          return (
            <div key={q.id} className={`${styles.item} ${isCorrect ? styles.correct : isUnanswered ? styles.unanswered : styles.wrong}`}>
              <div className={styles.header}>
                <span className={styles.qNum}>Q{idx + 1}</span>
                <span className={styles.status}>
                  {isCorrect ? '✓ Correct' : isUnanswered ? '— Unanswered' : '✗ Incorrect'}
                </span>
              </div>
              <p className={styles.questionText}>{q.questionText}</p>
              <div className={styles.answers}>
                <span>Your answer: {userIdx >= 0 ? indexToLabel(userIdx) : '—'}</span>
                {!isCorrect && (
                  <span>Correct: {indexToLabel(correctIdx)}</span>
                )}
              </div>
              {q.explanation && (
                <p className={styles.explanation}>{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
