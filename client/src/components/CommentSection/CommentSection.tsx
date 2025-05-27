import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { useAuth } from '../../AuthContext';
import styles from './comment-section.module.css';
const API_URL = import.meta.env.VITE_API_URL;

export default function CommentSection({ bookId }: { bookId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<string>();
  const { loadingUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingUser) {
      fetchComments();
    }
  }, [sortOrder, loadingUser]);

  const fetchComments = async () => {
    setError(null);
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/comments/book/${bookId}?sort=${sortOrder}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка при завантаженні коментарів.');
      }
      setComments(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Помилка при завантаженні коментарів.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  return (
    <div className={styles['comment-section']}>
      <p>Коментарі ({comments.length})</p>
      <div>
        <span>Сортувати:</span>
        <select
          onChange={handleSortChange}
          defaultValue="newest"
          className={styles.sort}
        >
          <option value="newest">Спочатку новіші</option>
          <option value="oldest">Спочатку старіші</option>
        </select>
      </div>
      <CommentInput bookId={bookId} onCommentAdded={fetchComments} />
      {loading ? (
        <Loader />
      ) : error ? (
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
        </div>
      ) : (
        <Comments comments={comments} onCommentDeleted={fetchComments} />
      )}
    </div>
  );
}

type Comment = {
  _id: string;
  bookId: string;
  userId: {
    _id: string | null;
    name: string;
  };
  text: string;
  createdAt: string;
};
type CommentsProps = {
  comments: Comment[];
  onCommentDeleted: () => void;
};

function Comments({ comments, onCommentDeleted }: CommentsProps) {
  const { userId, role, getFreshToken } = useAuth();
  const [modalCommentId, setModalCommentId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/comments/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Виникла помилка при видаленні коментаря.');
      }
      onCommentDeleted();
      setModalCommentId(null);
    } catch (error) {
      setModalError(
        error instanceof Error
          ? error.message
          : 'Виникла помилка при видаленні коментаря.'
      );
    }
  };

  if (comments.length === 0) {
    return <p>Коментарів поки немає.</p>;
  }

  return (
    <div className={styles.comments}>
      {comments.map((com) => {
        const date = new Date(com.createdAt);
        const formatted = date.toLocaleString('uk-UA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={com._id} className={styles.comment}>
            <div className={styles['user-photo']}>
              {com.userId ? (
                <img
                  src={'com.userId.photo' || 'defaultUserPhoto'}
                  alt="User photo"
                />
              ) : (
                <img
                  src={'deletedUserPhoto'}
                  alt="Видалений користувач, фото"
                />
              )}
            </div>
            <div className={styles['com-content']}>
              <h6>{com.userId ? com.userId.name : '[Користувач видалений]'}</h6>
              <p className={styles.text}>{com.text}</p>
              <p className={styles.date}>{formatted} </p>
              {(userId === com.userId?._id || role === 'admin') && (
                <button
                  className={styles['delete-my-comment-btn']}
                  onClick={() => setModalCommentId(com._id)}
                >
                  {userId === com.userId?._id
                    ? 'Видалити свій коментар'
                    : 'Видалити коментар'}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {modalCommentId && (
        <ConfirmModal
          message="Ви впевнені, що хочете видалити цей коментар?"
          onClose={() => setModalCommentId(null)}
          onConfirm={() => handleDelete(modalCommentId)}
        />
      )}
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </div>
  );
}

type CommentInputProps = {
  bookId: string;
  onCommentAdded: () => void;
};

function CommentInput({ bookId, onCommentAdded }: CommentInputProps) {
  const { getFreshToken } = useAuth();
  const [text, setText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      const token = await getFreshToken();

      const response = await fetch(`${API_URL}/comments/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, bookId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Помилка ${response.status}. ${errorData.message}.`);
        return;
      }

      setText('');
      onCommentAdded();
    } catch (error) {
      console.log(error);
      alert("Не вдалося зв'язатися із сервером. Спробуйте ще раз.");
    }
  };

  return (
    <div className={styles['comment-input']}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Залишіть коментар"
      ></textarea>
      {user ? (
        <button onClick={handleSubmit}>Надіслати</button>
      ) : (
        <button onClick={() => navigate('/register')}>Надіслати</button>
      )}
    </div>
  );
}
