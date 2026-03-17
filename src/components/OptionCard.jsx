import { indexToLabel } from '../utils/answerUtils';
import styles from '../styles/OptionCard.module.css';

const OPTION_COLORS = ['a', 'b', 'c', 'd'];

export function OptionCard({
  index,
  text,
  isSelected,
  isCorrect,
  isWrong,
  disabled,
  onClick,
}) {
  const label = indexToLabel(index);
  const colorClass = OPTION_COLORS[index] ?? 'a';

  return (
    <button
      type="button"
      className={`${styles.option} ${styles[colorClass]} ${isSelected ? styles.selected : ''} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
      onClick={() => !disabled && onClick(index)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`Option ${label}: ${text}`}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.text}>{text}</span>
    </button>
  );
}
