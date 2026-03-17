import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storageUtils';
import styles from '../styles/SettingsModal.module.css';

export function SettingsModal({ open, onClose }) {
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  useEffect(() => {
    if (open) {
      const s = getSettings();
      setShuffleQuestions(s.shuffleQuestions ?? false);
      setShuffleOptions(s.shuffleOptions ?? false);
    }
  }, [open]);

  const handleSave = () => {
    saveSettings({ shuffleQuestions, shuffleOptions });
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Practice Mode Settings</h3>
        <p className={styles.desc}>These apply when you take a test in Practice mode.</p>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
          />
          <span>Shuffle question order</span>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={shuffleOptions}
            onChange={(e) => setShuffleOptions(e.target.checked)}
          />
          <span>Shuffle answer options</span>
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
