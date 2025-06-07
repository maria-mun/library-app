import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
import styles from './book-card.module.css';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import Spinner from '../Spinner/Spinner';
import { User } from 'firebase/auth';
import BinIcon from '../Icons/BinIcon';
import EditIcon from '../Icons/EditIcon';
import StarIcon from '../Icons/StarIcon';
import Rating from '../Rating/Rating';
import BookMarks from '../BookMarks/BookMarks';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { getErrorMessage } from '../../utils/errorUtils';

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
};

type UserData = {
  lists: string[];
  rating: number | null;
};

type Book = {
  _id: string;
  title: string;
  author: Author;
  year?: number;
  cover?: string;
  averageRating?: number;
  ratingsCount?: number;
  genres?: string[];
  userData?: UserData;
};

type BookCardProps = {
  countNumber?: number;
  user: User | null;
  book: Book;
  onDelete: () => void;
  isList?: boolean; //чи список книг зараз рендериться для списку користувача
  onRemovalFromMyList: () => void;
};

const lists = [
  { key: 'readBooks', label: 'Прочитано' },
  { key: 'currentlyReadingBooks', label: 'Читаю' },
  { key: 'plannedBooks', label: 'Планую' },
  { key: 'abandonedBooks', label: 'Закинуто' },
];

const BookCard = ({
  countNumber,
  user,
  book,
  onDelete,
  isList,
  onRemovalFromMyList,
}: BookCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLists, setActiveLists] = useState<string[]>(
    book.userData?.lists || []
  );
  const [loadingListKey, setLoadingListKey] = useState<string | null>(null);
  const { getFreshToken, role } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [modalError, setModalError] = useState<string | null>(null);

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

  const handleToggleBookStatus = async (list: string, bookId: string) => {
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
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        throw new Error('Виникла помилка. Не вдалося оновити списки книг.');
      }

      const data = await response.json();
      const status = data.status;
      console.log(status);

      setActiveLists(
        status === 'added'
          ? [...activeLists, list]
          : activeLists.filter((l) => l !== list)
      );

      if (isList) {
        onRemovalFromMyList();
      }
    } catch (error) {
      setModalError(getErrorMessage(error));
    } finally {
      setLoadingListKey(null);
    }
  };

  return (
    <div className={styles.book}>
      <div className={styles.left}>
        <Link to={`/book/${book._id}`}>
          <div className={styles.cover}>
            <BookMarks activeLists={activeLists} />
            {book.cover && (
              <img
                src={book.cover}
                alt={`Обкладинка книги ${book.title}`}
              ></img>
            )}
          </div>
        </Link>
      </div>
      <div className={styles.details}>
        <h2 className={styles.title}>
          {countNumber && `${countNumber}. `}
          <Link to={`/book/${book._id}`}>{book.title}</Link>
        </h2>
        <p className={styles.author}>
          <Link to={`/author/${book.author._id}`}>{book.author.name}</Link>
        </p>
        <div>
          <span className={styles.year}>{book.year}</span>
          {book.year && book.author.country && <span> • </span>}
          <span className={styles.country}>{book.author.country}</span>
        </div>
        <div className={styles.rating}>
          <StarIcon filled={true} />
          {book.averageRating != null
            ? `${book.averageRating.toFixed(1)} (${book.ratingsCount})`
            : '0 (0)'}

          <Rating
            bookId={book._id}
            currentRating={book.userData?.rating || null}
          />
        </div>
        <div className={styles['genres-wrap']}>
          <div className={styles.genres}>
            {book.genres?.map((genre, index) => (
              <span key={index}>{genre}</span>
            ))}
          </div>
        </div>
      </div>
      <div className={styles['options-cont']} ref={dropdownRef}>
        <button
          className={styles['options-btn']}
          onClick={() => setIsOpen(!isOpen)}
        >
          ⋮
        </button>
        {isOpen && (
          <div className={styles.dropdown}>
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
                        !loadingListKey &&
                        handleToggleBookStatus(item.key, book._id)
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
              <hr />
              {role === 'admin' && (
                <li
                  className={styles.option}
                  onClick={() => {
                    setIsOpen(false);
                    onDelete();
                  }}
                >
                  Видалити з бази даних
                  <BinIcon size={35} />
                </li>
              )}
              {(role === 'admin' || role === 'user') && (
                <>
                  <Link
                    to={`/editBookForm/${book._id}`}
                    className={`${styles.option} ${styles.link}`}
                  >
                    Редагувати
                    <EditIcon size={20} />
                  </Link>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </div>
  );
};

export default BookCard;
