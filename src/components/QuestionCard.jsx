import { OptionCard } from './OptionCard';
import { MathText } from './MathText';
import { resolveAssetUrl } from '../utils/assetUtils';
import { normalizeCorrectAnswer } from '../utils/scoreUtils';
import styles from '../styles/QuestionCard.module.css';

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  topic,
  selectedAnswer,
  onSelectAnswer,
  showFeedback,
  correctAnswer,
  disabled,
  explanation,
}) {
  const options = question.options || [];
  const marks = question.marks ?? 1;
  const normalizedCorrect = normalizeCorrectAnswer(correctAnswer, options.length);

  const hasAnswered = selectedAnswer !== undefined && selectedAnswer !== null && selectedAnswer >= 0;
  const showFeedbackNow = showFeedback && hasAnswered;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.qCounter}>Q {questionNumber} of {totalQuestions}</span>
        <div className={styles.headerRight}>
          {topic && (
            <span className={styles.topicBadge}>{topic}</span>
          )}
          <span className={styles.marksBadge}>{marks} {marks === 1 ? 'mark' : 'marks'}</span>
        </div>
      </div>

      <div className={styles.questionText}>
        <MathText text={question.questionText} as="span" />
      </div>

      {question.image && (
        <div className={styles.imageWrap}>
          <img
            src={resolveAssetUrl(question.image)}
            alt="Question"
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.options}>
        {options.map((text, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = showFeedbackNow && normalizedCorrect === idx;
          const isWrong = showFeedbackNow && isSelected && normalizedCorrect !== idx;
          const textContent = typeof text === 'string' ? <MathText text={text} as="span" /> : text;
          return (
            <OptionCard
              key={idx}
              index={idx}
              text={textContent}
              textLabel={typeof text === 'string' ? text : String(text)}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isWrong={isWrong}
              disabled={disabled}
              onClick={onSelectAnswer}
            />
          );
        })}
      </div>

      {showFeedbackNow && explanation && (
        <div className={styles.explanation}>
          <span className={styles.explanationLabel}>Explanation</span>
          <p className={styles.explanationText}>{explanation}</p>
        </div>
      )}
    </div>
  );
}
