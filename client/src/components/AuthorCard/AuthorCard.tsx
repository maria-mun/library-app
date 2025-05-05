import styles from './author-card.module.css';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import BinIcon from '../Icons/BinIcon';
import EditIcon from '../Icons/EditIcon';

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
  photo?: string;
};

type Book = {
  _id: string;
  title: string;
  author: Author;
  year?: number;
  cover?: string;
  rating?: number;
  genres?: string[];
};

type AuthorCardProps = {
  author: Author;
  onDelete: () => void;
};

const AuthorCard = ({ author, onDelete }: AuthorCardProps) => {
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
    <div className={styles.author}>
      <Link to={`/author/${author._id}`}>
        <div className={styles.photo}>
          {author.photo && (
            <img src={author.photo} alt={`Фото автора - ${author.name}`}></img>
          )}
        </div>
      </Link>
      <div className={styles.details}>
        <h2 className={styles.name}>
          <Link to={`/author/${author._id}`}>{author.name}</Link>
        </h2>
        <p className={styles.country}>{author.country}</p>
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
              <li
                className={styles.option}
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
              >
                Видалити з бази даних
                <EditIcon size={35} />
              </li>
              <li className={styles.option}>
                <Link
                  to={`/editAuthorForm/${author._id}`}
                  className={styles.link}
                >
                  Редагувати
                </Link>
                <BinIcon size={20} />
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
