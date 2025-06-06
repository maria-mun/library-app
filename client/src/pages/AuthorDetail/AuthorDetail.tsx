import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './author-detail.module.css';
import BookList from '../../components/BookList/BookList';
import Select, { SelectOption } from '../../components/Select/Select';
import { useAuth } from '../../AuthContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Loader from '../../components/Loader/Loader';
import Spinner from '../../components/Spinner/Spinner';
import AddBookIcon from '../../components/Icons/AddBookIcon';
import BinIcon from '../../components/Icons/BinIcon';
import EditIcon from '../../components/Icons/EditIcon';
import ErrorComponent from '../../components/Error/ErrorComponent';
import { getErrorMessage } from '../../utils/errorUtils';

const API_URL = import.meta.env.VITE_API_URL;

type Author = {
  _id: string;
  name: string;
  country?: string;
  description?: string;
  photo?: string;
  isFavorite: boolean;
  hasBooks: boolean;
};

const sortOptions: SelectOption[] = [
  { value: '', label: '- -' },
  { value: 'averageRating_asc', label: 'за рейтингом (зростання)' },
  { value: 'averageRating_desc', label: 'за рейтингом (спадання)' },
  { value: 'title_asc', label: 'за назвою (А-Я)' },
  { value: 'title_desc', label: 'за назвою (Я-А)' },
  { value: 'year_asc', label: 'за роком (зростання)' },
  { value: 'year_desc', label: 'за роком (спадання)' },
];

const AuthorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getFreshToken, user, role, loadingUser } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [selectedSort, setSelectedSort] = useState<SelectOption>(
    sortOptions[0]
  );

  const handleSortChange = (option: SelectOption | undefined) => {
    setSelectedSort(option || sortOptions[0]);
    if (option?.value) {
      const [newSort, newOrder] = option.value.split('_');
      setSort(newSort);
      setOrder(newOrder);
    } else {
      setSort(undefined);
      setOrder(undefined);
    }
  };

  useEffect(() => {
    if (!loadingUser) {
      fetchAuthor();
    }
  }, [id, loadingUser]);

  const fetchAuthor = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/authors/${user ? 'authorized' : 'public'}/${id}`;

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
        throw new Error(data.message || 'Помилка при завантаженні автора.');
      }
      setAuthor(data);
      setIsFavorite(data.isFavorite);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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
        body: JSON.stringify({ authorId: author?._id }),
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
      setModalError(getErrorMessage(error));
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/authors/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не вдалося видалити автора.');
      }

      navigate('/allAuthors');
    } catch (error) {
      setModalError(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorComponent error={error} tryAgain={fetchAuthor} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.author}>
        <div className={styles.left}>
          <div className={styles.photo}>
            {author?.photo && (
              <img
                src={author.photo}
                alt={`Фото автора - ${author.name}`}
              ></img>
            )}
          </div>
        </div>

        <div className={styles.details}>
          <h1 className={styles.name}>
            {author?.name}{' '}
            {isFavorite && <span className={styles['fave-icon']}>✪</span>}
          </h1>
          <p className={styles.country}>{author?.country}</p>
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
      </div>
      <p className={styles.description}>{author?.description}</p>
      {user && (
        <div className={styles.buttons}>
          <button>
            <Link to={`/editAuthorForm/${author?._id}`} className={styles.link}>
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
          {(role === 'admin' || role === 'user') && (
            <button
              onClick={() => {
                navigate('/addBookForm', {
                  state: {
                    authorId: author?._id,
                    authorName: author?.name,
                  },
                });
              }}
            >
              <AddBookIcon />
              <span>Додати книгу</span>
            </button>
          )}
        </div>
      )}
      <hr />
      <h2 className={styles.heading2}>Книги автора</h2>

      <div className={styles.sort}>
        <span>Сортування:</span>
        <Select
          options={sortOptions}
          value={selectedSort}
          onChange={handleSortChange}
        />
      </div>
      <BookList sort={sort} order={order} authorId={id} />

      {isDeleteModalOpen && author?.hasBooks && (
        <ConfirmModal
          message="Цей автор не може бути видалений, оскільки у нього є книги."
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
      {isDeleteModalOpen && !author?.hasBooks && (
        <ConfirmModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          message="Ви впевнені, що хочете видалити цього автора?"
        />
      )}
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </div>
  );
};

export default AuthorDetail;
