import { Link } from 'react-router-dom';
import styles from './book-card.module.css';

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
  activeBookId: string | null;
  onOpenOptions: (id: string | null) => void;
  onDelete: () => void;
};

const BookCard = ({
  book,
  activeBookId,
  onOpenOptions,
  onDelete,
}: BookCardProps) => {
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
      <div
        className={styles['options-cont']}
        tabIndex={0}
        onBlur={() => onOpenOptions(null)}
      >
        <button
          className={styles['options-btn']}
          onClick={() =>
            onOpenOptions(activeBookId === book._id ? null : book._id)
          }
        >
          ⋮
        </button>
        {activeBookId === book._id && (
          <div
            className={styles.dropdown}
            tabIndex={0}
            onBlur={() => onOpenOptions(null)}
          >
            <ul className={styles.options}>
              <li className={styles.option}>Додати в список</li>
              <li className={styles.option}>Видалити зі списку</li>
              <li
                className={styles.option}
                onClick={() => {
                  onDelete();
                  onOpenOptions(null);
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
