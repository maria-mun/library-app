import styles from './rating.module.css';
import ReactDOM from 'react-dom';
import { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { getErrorMessage } from '../../utils/errorUtils';
import StarIcon from '../Icons/StarIcon';
import XIcon from '../Icons/XIcon';
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
      <StarIcon filled={!!rating} color="skyblue" />
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
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { getFreshToken } = useAuth();
  const handleUpdateRating = async (rating: number | null) => {
    setIsLoading(true);
    setModalError(null);
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
        throw new Error(errorData.message || 'Не вдалося оновити оцінку.');
      }
      onUpdateRating(rating);
      onClose();
      return await res.json();
    } catch (error) {
      setModalError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  const effectiveRating = hoverRating ?? newRating;
  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles['close-btn']} onClick={onClose}>
          <XIcon size={30} />
        </button>
        <div className={styles.stars}>
          {[...Array(10)].map((_, i) => (
            <StarIcon
              key={i}
              number={i + 1}
              size={35}
              filled={effectiveRating !== null && i < effectiveRating}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(null)}
              color="skyblue"
              onClick={() => setNewRating(i + 1)}
            />
          ))}
        </div>
        <div className={styles.buttons}>
          <button
            onClick={() => handleUpdateRating(null)}
            className={styles['delete-btn']}
            disabled={isLoading}
            style={{
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Видалити оцінку
          </button>

          <button
            onClick={() => handleUpdateRating(newRating)}
            className={styles['confirm-btn']}
            disabled={isLoading}
            style={{
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Підтвердити
          </button>
        </div>
      </div>
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </div>,
    document.body
  );
}
