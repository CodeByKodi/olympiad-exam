import { indexToLabel } from '../utils/answerUtils';
import styles from '../styles/OptionList.module.css';

export function OptionList({ options, selectedIndex, onSelect, showCorrect, correctIndex, disabled }) {
  if (!options || !Array.isArray(options)) return null;

  return (
    <div className={styles.list}>
      {options.map((text, idx) => {
        const isSelected = selectedIndex === idx;
        const isCorrect = showCorrect && correctIndex === idx;
        const isWrong = showCorrect && isSelected && correctIndex !== idx;

        return (
          <button
            key={idx}
            type="button"
            className={`${styles.option} ${isSelected ? styles.selected : ''} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
            onClick={() => !disabled && onSelect(idx)}
            disabled={disabled}
          >
            <span className={styles.label}>{indexToLabel(idx)}</span>
            <span className={styles.text}>{text}</span>
          </button>
        );
      })}
    </div>
  );
}
