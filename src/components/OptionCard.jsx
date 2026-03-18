import { indexToLabel } from '../utils/answerUtils';
import styles from '../styles/OptionCard.module.css';

const OPTION_COLORS = ['a', 'b', 'c', 'd'];

export function OptionCard({
  index,
  text,
  textLabel,
  isSelected,
  isCorrect,
  isWrong,
  disabled,
  onClick,
}) {
  const label = indexToLabel(index);
  const colorClass = OPTION_COLORS[index] ?? 'a';
  const ariaText = textLabel ?? (typeof text === 'string' ? text : '');

  return (
    <button
      type="button"
      className={`${styles.option} ${styles[colorClass]} ${isSelected ? styles.selected : ''} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
      onClick={() => !disabled && onClick(index)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`Option ${label}: ${ariaText}`}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.text}>{text}</span>
    </button>
  );
}
