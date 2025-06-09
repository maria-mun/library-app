import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { useAuth } from '../../AuthContext';
import Select, { SelectOption } from '../Select/Select';
import LoadMoreButton from '../LoadMore/LoadMore';
import BinIcon from '../Icons/BinIcon';
import styles from './comment-section.module.css';
import { getErrorMessage } from '../../utils/errorUtils';
import ErrorComponent from '../Error/ErrorComponent';
const API_URL = import.meta.env.VITE_API_URL;

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'спочатку новіші' },
  { value: 'oldest', label: 'спочатку старіші' },
];

export default function CommentSection({ bookId }: { bookId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedSort, setSelectedSort] = useState<SelectOption>(
    sortOptions[0]
  );

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const { loadingUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingUser) {
      setPage(0);
      fetchComments(0, true);
    }
  }, [selectedSort, loadingUser]);

  const fetchComments = async (pageToLoad = 0, reset = false) => {
    setError(null);
    setLoading(true);

    try {
      /* await new Promise((res) => setTimeout(res, 3000)); */
      const response = await fetch(
        `${API_URL}/comments/book/${bookId}?sort=${selectedSort.value}&offset=${
          pageToLoad * limit
        }&limit=${limit}`
      );
      const { data, totalCount, message } = await response.json();

      if (!response.ok) {
        throw new Error(message || 'Помилка при завантаженні коментарів.');
      }

      if (reset) {
        setComments(data);
      } else {
        setComments((prev) => [...prev, ...data]);
      }

      setHasMore((pageToLoad + 1) * limit < totalCount);
      setTotalCount(totalCount);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (option: SelectOption | undefined) => {
    setSelectedSort(option || sortOptions[0]);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  return (
    <div className={styles['comment-section']}>
      <h2 className={styles.heading2}>
        Коментарі ({comments.length} із {totalCount})
      </h2>
      <div className={styles.sort}>
        <span>Сортування:</span>
        <Select
          options={sortOptions}
          value={selectedSort}
          onChange={handleSortChange}
        />
      </div>
      <CommentInput
        bookId={bookId}
        onCommentAdded={() => {
          setSelectedSort(sortOptions[0]);
          setPage(0);
          fetchComments(0, true);
        }}
      />
      {page === 0 ? (
        loading ? (
          <Loader />
        ) : error ? (
          <ErrorComponent
            error={error}
            tryAgain={() => fetchComments(0, true)}
          />
        ) : (
          <>
            <Comments
              comments={comments}
              onCommentDeleted={() => {
                setPage(0);
                fetchComments(0, true);
              }}
            />
            {comments.length > 0 && (
              <LoadMoreButton
                onClick={loadMore}
                hasMore={hasMore}
                loading={loading}
                error={error}
              />
            )}
          </>
        )
      ) : (
        <>
          <Comments
            comments={comments}
            onCommentDeleted={() => fetchComments(0, true)}
          />
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorComponent
              error={error}
              tryAgain={() => fetchComments(page, false)}
            />
          ) : (
            comments.length > 0 && (
              <LoadMoreButton
                onClick={loadMore}
                hasMore={hasMore}
                loading={loading}
                error={error}
              />
            )
          )}
        </>
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
    photo: string;
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
    return (
      <div className={styles.container}>
        <p>Коментарів поки немає.</p>
      </div>
    );
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
            <div className={styles.top}>
              <div className={styles.left}>
                {com.userId ? (
                  <div className={styles['user-photo']}>
                    {com.userId.photo && <img src={com.userId.photo} />}
                  </div>
                ) : (
                  <div
                    className={`${styles['user-photo']} ${styles.deleted}`}
                  ></div>
                )}
              </div>
              <div className={styles['com-content']}>
                <h3
                  className={`${styles['user-name']} ${
                    userId === com.userId?._id ? styles.current : ''
                  }`}
                >
                  {com.userId ? com.userId.name : '[Користувач видалений]'}
                </h3>
                <p className={styles.text}>{com.text}</p>
              </div>
            </div>
            <div className={styles.bottom}>
              {(userId === com.userId?._id || role === 'admin') && (
                <button
                  className={`${styles.button} ${styles['delete-com-btn']}`}
                  onClick={() => setModalCommentId(com._id)}
                >
                  <BinIcon size={20} />
                  Видалити
                </button>
              )}{' '}
              <span className={styles.date}>{formatted} </span>
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
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Залишіть коментар"
      ></textarea>
      {user ? (
        <button
          className={`${styles['send-btn']} ${styles.button}`}
          onClick={handleSubmit}
          disabled={!text}
        >
          Надіслати
        </button>
      ) : (
        <button
          className={`${styles['send-btn']} ${styles.button}`}
          onClick={() => navigate('/register')}
        >
          Надіслати
        </button>
      )}
    </div>
  );
}
