import { Link } from 'react-router-dom';
import styles from './book-card.module.css';
import { useState, useEffect, useRef } from 'react';

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
};

type Book = {
  _id: string;
  title: string;
  author: Author;
  year?: number;
  cover?: string;
  rating?: number;
  status?: string;
  genres?: string[];
};

type BookCardProps = {
  book: Book;
  onDelete: () => void;
};

const BookCard = ({ book, onDelete }: BookCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
            <ul className={styles.options}>
              <li className={styles.option}>Додати в список</li>
              <li className={styles.option}>Видалити зі списку</li>
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
