import styles from './book-detail.module.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import Spinner from '../../components/Spinner/Spinner';
import { useAuth } from '../../AuthContext';
import CommentSection from '../../components/CommentSection/CommentSection';
import StarIcon from '../../components/Icons/StarIcon';
import EditIcon from '../../components/Icons/EditIcon';
import BinIcon from '../../components/Icons/BinIcon';
import Rating from '../../components/Rating/Rating';
import ArrowIcon from '../../components/Icons/ArrowIcon';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import ErrorComponent from '../../components/Error/ErrorComponent';
import { getErrorMessage } from '../../utils/errorUtils';
import BookMarks from '../../components/BookMarks/BookMarks';

const API_URL = import.meta.env.VITE_API_URL;
const lists = [
  { key: 'readBooks', label: 'Прочитано' },
  { key: 'currentlyReadingBooks', label: 'Читаю' },
  { key: 'plannedBooks', label: 'Планую' },
  { key: 'abandonedBooks', label: 'Закинуто' },
];
type Book = {
  _id: string;
  title: string;
  author: Author;
  year?: number;
  cover?: string;
  averageRating?: number;
  ratingsCount?: number;
  genres?: string[];
  userData?: { lists: string[]; rating: number };
};

type Author = {
  _id: string;
  name: string;
  country?: string;
  description?: string;
  photo?: string;
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, loadingUser, getFreshToken } = useAuth();
  const navigate = useNavigate();

  const [bookData, setBookData] = useState<Book | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeLists, setActiveLists] = useState<string[]>([]);
  const [loadingListKey, setLoadingListKey] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingUser) return;
    fetchBook();
  }, [id, user, loadingUser]);

  const fetchBook = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/books/${user ? 'authorized' : 'public'}/${id}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (user) {
        const token = await getFreshToken();
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка при завантаженні книги.');
      }

      setBookData(data);
      if (user) setActiveLists(data.userData.lists);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleDelete() {
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/books/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не вдалося видалити книгу.');
      }

      navigate('/allBooks');
    } catch (error) {
      setModalError(getErrorMessage(error));
    }
  }

  const handleToggleBookStatus = async (list: string) => {
    if (loadingListKey) return;
    setLoadingListKey(list);

    try {
      const token = await getFreshToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${API_URL}/users/books/${list}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: id }),
      });

      if (!response.ok) {
        throw new Error('Виникла помилка. Не вдалося оновити списки книг.');
      }

      const data = await response.json();
      const status = data.status;

      setActiveLists(
        status === 'added'
          ? [...activeLists, list]
          : activeLists.filter((l) => l !== list)
      );
    } catch (error) {
      setModalError(getErrorMessage(error));
    } finally {
      setLoadingListKey(null);
    }
  };

  if (isLoading || !bookData) {
    return <Loader />;
  }

  if (error) {
    return <ErrorComponent error={error} tryAgain={fetchBook} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.book}>
        <div className={styles.left}>
          <div className={styles.cover}>
            {bookData.cover && (
              <img
                src={bookData.cover}
                alt={`Обкладинка книги ${bookData.title}`}
              ></img>
            )}
            <BookMarks activeLists={activeLists} />
          </div>
        </div>
        <div className={styles.details}>
          <h1 className={styles.title}>{bookData.title}</h1>
          <p className={styles.author}>
            <Link to={`/author/${bookData.author._id}`}>
              {bookData.author.name}
            </Link>
          </p>
          <div>
            <span className={styles.year}>{bookData.year}</span>
            <span> • </span>
            <span className={styles.country}>{bookData.author.country}</span>
          </div>
          <div className={styles.rating}>
            <StarIcon filled={true} />
            {bookData.averageRating != null
              ? `${bookData.averageRating.toFixed(1)} (${
                  bookData.ratingsCount
                })`
              : '0 (0)'}
            <Rating
              bookId={bookData._id}
              currentRating={bookData.userData?.rating || null}
            />
          </div>{' '}
          <div className={styles['dropdown-cont']} ref={dropdownRef}>
            <button
              className={styles['open-dropdown-btn']}
              onClick={() => setIsOpen(!isOpen)}
            >
              У списках:
              <ArrowIcon isOpen={isOpen} />
            </button>
            {isOpen && (
              <div className={styles['lists-dropdown']}>
                <ul className={styles['options-list']}>
                  {lists.map((item) => {
                    const isActive = activeLists.includes(item.key);
                    const isLoading = loadingListKey === item.key;
                    if (user) {
                      return (
                        <li
                          key={item.key}
                          className={`${styles.option} ${styles[item.key]} ${
                            isActive ? styles.active : ''
                          }`}
                          onClick={() =>
                            !loadingListKey && handleToggleBookStatus(item.key)
                          }
                          style={{
                            cursor: loadingListKey ? 'not-allowed' : 'pointer',
                            opacity: loadingListKey && !isLoading ? 0.5 : 1,
                          }}
                        >
                          {item.label}
                          {isLoading && <Spinner />}
                        </li>
                      );
                    } else {
                      return (
                        <Link
                          to="/register"
                          state={{ from: location.pathname }}
                          className={`${styles.option} ${styles.link}`}
                        >
                          {item.label}
                        </Link>
                      );
                    }
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.genres}>
        {bookData.genres?.map((genre, index) => (
          <span key={index}>{genre}</span>
        ))}
      </div>

      {user && (
        <div className={styles.buttons}>
          <button>
            <Link to={`/editBookForm/${bookData._id}`} className={styles.link}>
              <EditIcon />
              <span>Редагувати</span>
            </Link>
          </button>

          {role === 'admin' && (
            <button onClick={() => setIsDeleteModalOpen(true)}>
              <BinIcon />
              <span>Видалити</span>
            </button>
          )}
        </div>
      )}
      {isDeleteModalOpen && (
        <ConfirmModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          message="Ви впевнені, що хочете видалити цю книгу?"
        />
      )}
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
      <hr />
      <CommentSection bookId={bookData._id} />
    </div>
  );
};

export default BookDetail;
