import { Link } from 'react-router-dom';
import styles from './book-card.module.css';
import { useState, useEffect, useRef } from 'react';
import Spinner from '../Spinner/Spinner';
import { User } from 'firebase/auth';
import BinIcon from '../Icons/BinIcon';
import EditIcon from '../Icons/EditIcon';
import Rating from '../Rating/Rating';

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
  rating?: number;
  genres?: string[];
  userData?: UserData;
};

type BookCardProps = {
  user: User | null;
  book: Book;
  onDelete: () => void;
};

const BookCard = ({ user, book, onDelete }: BookCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLists, setActiveLists] = useState<string[]>(
    book.userData?.lists || []
  );
  const [loadingListKey, setLoadingListKey] = useState<string | null>(null);

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

  const handleToggleBookStatus = async (
    uid: string,
    list: string,
    bookId: string
  ) => {
    if (!uid || loadingListKey) return; // блокуємо повторні кліки
    setLoadingListKey(list);

    // optimistic update
    const alreadyInList = activeLists.includes(list);
    const newLists = alreadyInList
      ? activeLists.filter((l) => l !== list)
      : [...activeLists, list];
    setActiveLists(newLists);

    try {
      //симуляція заьримки
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch(
        `http://localhost:4000/api/users/${uid}/books/${list}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookId }),
        }
      );

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      const status = data.status; // 'added' або 'removed'

      // якщо сервер каже, що насправді не те зробилось — фіксимо
      if (
        (status === 'added' && alreadyInList) ||
        (status === 'removed' && !alreadyInList)
      ) {
        setActiveLists(
          alreadyInList
            ? [...activeLists, list]
            : activeLists.filter((l) => l !== list)
        );
      }
    } catch (err) {
      console.error(err);
      // відкат, бо фейл
      setActiveLists(
        alreadyInList
          ? [...activeLists, list]
          : activeLists.filter((l) => l !== list)
      );
    } finally {
      setLoadingListKey(null);
    }
  };

  return (
    <div className={styles.book}>
      <Link to={`/book/${book._id}`}>
        <div className={styles.cover}>
          <BookMarks activeLists={activeLists} />
          {book.cover && (
            <img src={book.cover} alt={`Обкладинка книги ${book.title}`}></img>
          )}
        </div>
      </Link>
      <div className={styles.details}>
        <h2 className={styles.title}>
          <Link to={`/book/${book._id}`}>{book.title}</Link>
        </h2>
        <p className={styles.author}>
          <Link to={`/author/${book.author._id}`}>{book.author.name}</Link>
        </p>
        <span className={styles.country}>{book.author.country}</span>
        <span className={styles.year}>{book.year}</span>

        <Rating
          userId={user ? user.uid : null}
          bookId={book._id}
          currentRating={book.userData?.rating || null}
        />
        <div className={styles.genres}>
          {book.genres?.map((genre, index) => (
            <span key={index}>{genre}</span>
          ))}
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
                        handleToggleBookStatus(user.uid, item.key, book._id)
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
                    <li key={item.key} className={styles.option}>
                      <Link to="/register" className={styles.link}>
                        {item.label}
                      </Link>
                    </li>
                  );
                }
              })}
              <hr />
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
              <li className={styles.option}>
                <Link to={`/editBookForm/${book._id}`} className={styles.link}>
                  Редагувати
                </Link>
                <EditIcon size={20} />
              </li>
            </ul>
          </div>
        )}
      </div>
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
