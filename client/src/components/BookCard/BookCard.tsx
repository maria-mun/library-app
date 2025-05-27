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
import ConfirmModal from '../ConfirmModal/ConfirmModal';

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
  user: User | null;
  book: Book;
  onDelete: () => void;
  isList?: boolean; //чи список книг зараз рендериться для списку користувача
  onRemovalFromMyList: () => void;
};

const BookCard = ({
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
      setModalError(
        error instanceof Error
          ? error.message
          : 'Виникла помилка. Не вдалося оновити списки книг.'
      );
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
          <Link to={`/book/${book._id}`}>{book.title}</Link>
        </h2>
        <p className={styles.author}>
          <Link to={`/author/${book.author._id}`}>{book.author.name}</Link>
        </p>
        <div>
          <span className={styles.year}>{book.year}</span>
          <span> • </span>
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

const lists = [
  { key: 'readBooks', label: 'Прочитано' },
  { key: 'currentlyReadingBooks', label: 'Читаю' },
  { key: 'plannedBooks', label: 'Планую' },
  { key: 'abandonedBooks', label: 'Закинуто' },
];

function BookMarks({ activeLists }: { activeLists: string[] }) {
  return (
    <div className={styles.bookmarks}>
      {lists.map((list) => {
        if (activeLists.includes(list.key)) {
          return (
            <div
              key={list.key}
              className={`${styles[list.key]} ${styles.bookmark}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="30"
                height="30"
                viewBox="0 0 64 64"
              >
                <path
                  fill="currentColor"
                  d="M45.41,55.83l-12.82-9.4a1,1,0,0,0-1.18,0l-12.82,9.4A1,1,0,0,1,17,55V8a1,1,0,0,1,1-1H46a1,1,0,0,1,1,1V55A1,1,0,0,1,45.41,55.83Z"
                ></path>
                <path
                  fill="#0000002c"
                  d="M45.41,48.83,33.77,40.3a3,3,0,0,0-3.55,0L18.59,48.83A1,1,0,0,1,17,48v7a1,1,0,0,0,1.59.81l12.82-9.4a1,1,0,0,1,1.18,0l12.82,9.4A1,1,0,0,0,47,55V48A1,1,0,0,1,45.41,48.83Z"
                ></path>
                <path
                  fill="#0000002c"
                  d="M46,7H18a1,1,0,0,0-1,1v5a1,1,0,0,1,1-1H46a1,1,0,0,1,1,1V8A1,1,0,0,0,46,7Z"
                ></path>
                <path
                  fill="black"
                  d="M45,6H19a3,3,0,0,0-3,3V55a2,2,0,0,0,3.18,1.61l12.22-9a1,1,0,0,1,1.18,0l12.23,9A2,2,0,0,0,48,55V9A3,3,0,0,0,45,6Zm1,49-12.23-9a3,3,0,0,0-3.55,0L18,55V9a1,1,0,0,1,1-1H45a1,1,0,0,1,1,1Z"
                ></path>
                <path
                  fill="black"
                  d="M37 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 37 10zM42 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 42 10zM22 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 22 10zM27 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 27 10zM32 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V11A1 1 0 0 0 32 10z"
                ></path>
              </svg>
            </div>
          );
        }
      })}
    </div>
  );
}
