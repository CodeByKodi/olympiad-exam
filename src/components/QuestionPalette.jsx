import { indexToLabel } from '../utils/answerUtils';
import styles from '../styles/QuestionPalette.module.css';

export function QuestionPalette({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onSelect,
}) {
  return (
    <div className={styles.palette}>
      <h4 className={styles.title}>Questions</h4>
      <div className={styles.grid}>
        {questions.map((q, idx) => {
          const answered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] >= 0;
          const marked = markedForReview.has(q.id);
          const current = idx === currentIndex;

          return (
            <button
              key={q.id}
              type="button"
              className={`${styles.item} ${current ? styles.current : ''} ${answered ? styles.answered : ''} ${marked ? styles.marked : ''}`}
              onClick={() => onSelect(idx)}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
