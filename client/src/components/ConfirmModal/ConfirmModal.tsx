import ReactDOM from 'react-dom';
import styles from './confirm-modal.module.css';

type ConfirmModalProps = {
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  message,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{message}</h2>
        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancel}>
            Скасувати
          </button>
          {onConfirm && (
            <button onClick={onConfirm} className={styles.confirm}>
              Підтвердити
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
