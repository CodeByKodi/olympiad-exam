import styles from '../styles/ConfirmSubmitModal.module.css';

export function ConfirmSubmitModal({ open, onConfirm, onCancel, unansweredCount }) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Submit Test?</h3>
        <p className={styles.message}>
          {unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
            : 'Are you sure you want to submit your test?'}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
