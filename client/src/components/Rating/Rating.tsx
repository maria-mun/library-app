import styles from './rating.module.css';
import ReactDOM from 'react-dom';
import { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

type RatingProps = {
  bookId: string;
  currentRating: number | null;
};

type RatingModalProps = {
  bookId: string;
  currentRating: number | null;
  onClose: () => void;
  onUpdateRating: (rating: number | null) => void;
};

export default function Rating({ bookId, currentRating }: RatingProps) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(currentRating);
  const { user } = useAuth();
  const ratingContent = (
    <>
      <StarIcon filled={!!rating} />
      <p>{rating ? rating : 'Оцінити'}</p>
    </>
  );

  return (
    <>
      {user ? (
        <div
          className={styles.rating}
          onClick={() => setIsRatingModalOpen(true)}
        >
          {ratingContent}
        </div>
      ) : (
        <div className={styles.rating}>
          <Link
            to="/register"
            state={{ from: location.pathname }}
            className={styles.link}
          >
            <StarIcon filled={false} />
            <p>Оцінити</p>
          </Link>
        </div>
      )}

      {isRatingModalOpen && user && (
        <RatingModal
          onClose={() => setIsRatingModalOpen(false)}
          bookId={bookId}
          currentRating={rating || null}
          onUpdateRating={setRating}
        />
      )}
    </>
  );
}

function RatingModal({
  bookId,
  currentRating,
  onClose,
  onUpdateRating,
}: RatingModalProps) {
  const [newRating, setNewRating] = useState<number | null>(
    currentRating || null
  );
  const { getFreshToken } = useAuth();
  const handleUpdateRating = async (rating: number | null) => {
    try {
      const token = await getFreshToken();
      const res = await fetch(`${API_URL}/users/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({ bookId, rating }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || 'Не вдалося оновити/видалити оцінку'
        );
      }
      onUpdateRating(rating);
      onClose();
      return await res.json();
    } catch (err) {
      console.error('Помилка при оновленні оцінки:', err);
      throw err;
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <input
          type="number"
          max="10"
          min="1"
          value={newRating || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            setNewRating(value);
          }}
        />

        <div className={styles.buttons}>
          <button
            onClick={() => handleUpdateRating(null)}
            className={styles.delete}
          >
            Видалити оцінку
          </button>
          <button onClick={onClose} className={styles.cancel}>
            Скасувати
          </button>

          <button
            onClick={() => handleUpdateRating(newRating)}
            className={styles.confirm}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      fill={filled ? 'gold' : 'none'}
      height="20"
      width="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
