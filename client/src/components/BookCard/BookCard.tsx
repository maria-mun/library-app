import { Link } from 'react-router-dom';
import styles from './book-card.module.css';
import { useState, useEffect, useRef } from 'react';
import Loader from '../Loader/Loader';
import { User } from 'firebase/auth';

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
  user: User;
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
        <div className={styles.rating}>
          <span>⭐ {book.rating}</span>
        </div>
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
                    {isLoading && <Loader dotSize={10} />}
                  </li>
                );
              })}

              <li
                className={styles.option}
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
              >
                Видалити з бази даних
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
