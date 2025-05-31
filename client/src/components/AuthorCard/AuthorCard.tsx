import styles from './author-card.module.css';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import BinIcon from '../Icons/BinIcon';
import EditIcon from '../Icons/EditIcon';
import Spinner from '../Spinner/Spinner';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
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
  const [loadingToggle, setLoadingToggle] = useState(false);
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

  const toggleFavorite = async () => {
    setLoadingToggle(true);

    try {
      const token = await getFreshToken();
      const res = await fetch(`${API_URL}/users/favoriteAuthors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ authorId: author._id }),
      });

      if (!res.ok) {
        throw new Error(
          'Виникла помилка. Не вдалося оновити улюблених авторів.'
        );
      }

      const data = await res.json();
      const status = data.status;

      setIsFavorite(status === 'added');
    } catch (error) {
      setModalError(
        error instanceof Error
          ? error.message
          : 'Виникла помилка. Не вдалося оновити улюблених авторів'
      );
    } finally {
      setLoadingToggle(false);
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
          <Link to={`/author/${author._id}`}>{author.name}</Link>{' '}
          {isFavorite && <span className={styles['fave-icon']}>✪</span>}
        </h2>
        <p className={styles.country}>{author.country}</p>
        {user ? (
          <button
            onClick={() => !loadingToggle && toggleFavorite()}
            style={{
              cursor: loadingToggle ? 'not-allowed' : 'pointer',
            }}
            className={styles['fave-btn']}
          >
            {isFavorite ? 'Видалити з улюблених' : 'Додати до улюблених'}
            {loadingToggle && <Spinner />}
          </button>
        ) : (
          <Link
            to="/register"
            state={{ from: location.pathname }}
            className={`${styles['fave-btn']} ${styles.link}`}
          >
            Додати до улюблених
          </Link>
        )}
      </div>
      <div className={styles['options-cont']} ref={dropdownRef}>
        {user && (
          <button
            className={styles['options-btn']}
            onClick={() => setIsOpen(!isOpen)}
          >
            ⋮
          </button>
        )}

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
                  <BinIcon size={35} />
                </li>
              )}
              {(role === 'admin' || role === 'user') && (
                <>
                  <Link
                    to={`/editAuthorForm/${author._id}`}
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

export default AuthorCard;
