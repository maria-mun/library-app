import ReactDOM from 'react-dom';
import styles from './delete-book-modal.module.css';

type DeleteModalProps = {
  onConfirm: () => void; // Функція для відкриття опцій
  onClose: () => void; // Функція для закриття опцій
};

export default function DeleteBookModal({
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Видалити книгу?</h2>
        <p>Цю дію неможливо скасувати.</p>
        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancel}>
            Скасувати
          </button>
          <button onClick={onConfirm} className={styles.confirm}>
            Видалити
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
