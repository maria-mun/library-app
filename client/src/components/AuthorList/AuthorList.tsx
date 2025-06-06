import styles from './authorlist.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import AuthorCard from '../../components/AuthorCard/AuthorCard';
import Loader from '../../components/Loader/Loader';
import LoadMoreButton from '../LoadMore/LoadMore';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import ErrorComponent from '../Error/ErrorComponent';
import { getErrorMessage } from '../../utils/errorUtils';
const API_URL = import.meta.env.VITE_API_URL;

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
  isFavorite: boolean;
  hasBooks: boolean;
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
};

type AuthorProps = {
  search?: string;
};

function AuthorList({ search }: AuthorProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [modalAuthorId, setModalAuthorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getFreshToken, user, loadingUser } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    if (!loadingUser) {
      setPage(0);
      fetchAuthors(0, true);
    }
  }, [loadingUser, search]);

  const fetchAuthors = async (pageToLoad = 0, reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      /* await new Promise((res) => setTimeout(res, 3000)); */
      const url = `${API_URL}/authors/${
        user ? 'authorized' : 'public'
      }?offset=${pageToLoad * limit}&limit=${limit}${
        search ? `&search=${encodeURIComponent(search)}` : ''
      }`;

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
      const { data, totalCount, message } = await response.json();

      if (!response.ok) {
        throw new Error(message || 'Помилка при завантаженні авторів.');
      }

      if (search) {
        setTotalCount(totalCount);
      }

      if (reset) {
        setAuthors(data);
      } else {
        setAuthors((prev) => [...prev, ...data]);
      }

      setHasMore((pageToLoad + 1) * limit < totalCount);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAuthors(nextPage);
  };

  const handleDelete = async (id: string) => {
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

      setPage(0);
      fetchAuthors(0, true);

      setModalAuthorId(null);
    } catch (error) {
      setModalError(getErrorMessage(error));
    }
  };

  if (search && !error && authors.length === 0) {
    return (
      <div className={styles.container}>
        <p>Авторів за вашим запитом не знайдено.</p>
      </div>
    );
  }

  if (!isLoading && !error && authors.length === 0) {
    return (
      <div className={styles.container}>
        <p>Авторів поки немає.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.authors}>
        {page === 0 ? (
          isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorComponent
              error={error}
              tryAgain={() => fetchAuthors(0, true)}
            />
          ) : (
            <>
              {search && totalCount > 0 && (
                <p className={styles.totalCount}>Знайдено: {totalCount}</p>
              )}
              {authors.map((author) => {
                return (
                  <AuthorCard
                    author={author}
                    key={author._id}
                    onDelete={() => {
                      if (author.hasBooks) {
                        setModalAuthorId('can not be deleted');
                      } else {
                        setModalAuthorId(author._id);
                      }
                    }}
                  />
                );
              })}
              <LoadMoreButton
                onClick={loadMore}
                hasMore={hasMore}
                loading={isLoading}
                error={error}
              />
            </>
          )
        ) : (
          <>
            {search && totalCount > 0 && (
              <p className={styles.totalCount}>Знайдено: {totalCount}</p>
            )}
            {authors.map((author) => {
              return (
                <AuthorCard
                  author={author}
                  key={author._id}
                  onDelete={() => {
                    if (author.hasBooks) {
                      setModalAuthorId('can not be deleted');
                    } else {
                      setModalAuthorId(author._id);
                    }
                  }}
                />
              );
            })}
            {isLoading ? (
              <Loader />
            ) : error ? (
              <ErrorComponent
                error={error}
                tryAgain={() => fetchAuthors(page, false)}
              />
            ) : (
              <LoadMoreButton
                onClick={loadMore}
                hasMore={hasMore}
                loading={isLoading}
                error={error}
              />
            )}
          </>
        )}
      </div>
      {modalAuthorId && modalAuthorId !== 'can not be deleted' && (
        <ConfirmModal
          onClose={() => setModalAuthorId(null)}
          onConfirm={() => handleDelete(modalAuthorId)}
          message="Ви впевнені, що хочете видалити цього автора?"
        />
      )}
      {modalAuthorId === 'can not be deleted' && (
        <ConfirmModal
          message="Цей автор не може бути видалений, оскільки у нього є книги."
          onClose={() => setModalAuthorId(null)}
        />
      )}
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </>
  );
}

export default AuthorList;
