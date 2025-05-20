import styles from './author-card.module.css';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import BinIcon from '../Icons/BinIcon';
import EditIcon from '../Icons/EditIcon';
const API_URL = import.meta.env.VITE_API_URL;

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
  photo?: string;
  isFavorite?: boolean;
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
  const [isFavorite, setIsFavorite] = useState(author.isFavorite);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, role, getFreshToken } = useAuth();

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

  const toggleFavorite = async () => {
    const token = await getFreshToken();
    const prevFavorite = isFavorite;
    setIsFavorite(!prevFavorite);
    try {
      const res = await fetch(`${API_URL}/users/favoriteAuthors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ authorId: author._id }),
      });

      if (!res.ok) {
        throw new Error('Не вдалося оновити улюблених авторів');
      }

      const data = await res.json();
      const status = data.status;

      const shouldBeFavorite = status === 'added';
      if (shouldBeFavorite !== !prevFavorite) {
        // якщо стан розсинхронізувався — оновлюємо вручну
        setIsFavorite(shouldBeFavorite);
      }
    } catch (err) {
      console.error('Помилка при оновленні улюблених авторів:', err);
    }
  };

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
        {user ? (
          <div onClick={toggleFavorite}>
            {isFavorite ? 'Видалити з улюблених' : 'Додати до улюблених'}
          </div>
        ) : (
          <div>
            <Link to="/register" state={{ from: location.pathname }}>
              Додати до улюблених
            </Link>
          </div>
        )}
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
              {role === 'admin' && (
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
              )}
              {(role === 'admin' || role === 'user') && (
                <li className={styles.option}>
                  <Link
                    to={`/editAuthorForm/${author._id}`}
                    className={styles.link}
                  >
                    Редагувати
                  </Link>
                  <BinIcon size={20} />
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
