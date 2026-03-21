import { useModalA11y } from '../hooks/useModalA11y';
import styles from '../styles/ConfirmSubmitModal.module.css';

export function ConfirmSubmitModal({ open, onConfirm, onCancel, unansweredCount, onOpenQuestionList }) {
  const { modalRef, overlayRef } = useModalA11y(open, onCancel);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={onCancel}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-submit-title"
      >
        <h3 id="confirm-submit-title" className={styles.title}>Submit Test?</h3>
        <p className={styles.message}>
          {unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
            : 'Are you sure you want to submit your test?'}
        </p>
        <div className={styles.actions}>
          {unansweredCount > 0 && typeof onOpenQuestionList === 'function' && (
            <button type="button" className={styles.reviewBtn} onClick={onOpenQuestionList}>
              Open question list
            </button>
          )}
          <div className={styles.actionsEnd}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
