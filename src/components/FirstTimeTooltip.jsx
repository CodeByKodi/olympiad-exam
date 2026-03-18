import { useState } from 'react';
import styles from '../styles/FirstTimeTooltip.module.css';

const STORAGE_KEY = 'olympiad_first_time_tooltip_dismissed';

function getInitialVisible() {
  if (typeof window === 'undefined') return false;
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function FirstTimeTooltip() {
  const [visible, setVisible] = useState(getInitialVisible);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <div
      className={styles.tooltip}
      role="status"
      aria-live="polite"
    >
      <p className={styles.text}>Pick an exam from the menu above to start</p>
      <button
        type="button"
        className={styles.dismiss}
        onClick={dismiss}
        aria-label="Dismiss hint"
      >
        Got it
      </button>
    </div>
  );
}
