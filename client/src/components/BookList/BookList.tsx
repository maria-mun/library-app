import styles from './booklist.module.css';
import { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Loader from '../Loader/Loader';
import LoadMoreButton from '../LoadMore/LoadMore';
import ErrorComponent from '../Error/ErrorComponent';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../utils/errorUtils';

const API_URL = import.meta.env.VITE_API_URL;

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
  averageRating?: number;
  ratingsCount?: number;
  genres?: string[];
};

type BooksProps = {
  authorId?: string;
  sort?: string;
  order?: string;
  search?: string;
  list?: string;
};

function BookList({ authorId, sort, order, search, list }: BooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [modalBookId, setModalBookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, loadingUser, getFreshToken } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const navigate = useNavigate();

  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    if (!loadingUser) {
      setPage(0);
      fetchBooks(0, true);
    }
  }, [authorId, sort, order, search, loadingUser, list]);

  const fetchBooks = async (pageToLoad = 0, reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      /*await new Promise((res) => setTimeout(res, 3000));*/
      let url = `${API_URL}/books/${user ? 'authorized' : 'public'}`;
      const params = new URLSearchParams();

      if (authorId) {
        params.append('author', authorId);
      }
      if (sort) {
        params.append('sort', sort);
      }
      if (order) {
        params.append('order', order);
      }
      if (search) {
        params.append('search', search);
      }

      params.append('offset', String(pageToLoad * limit));
      params.append('limit', String(limit));

      if (list) {
        params.append('list', list);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

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
        throw new Error(message || 'Помилка при завантаженні книг');
      }

      if (search || list) {
        setTotalCount(totalCount);
      }

      if (reset) {
        setBooks(data);
      } else {
        setBooks((prev) => [...prev, ...data]);
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
    fetchBooks(nextPage);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/books/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не вдалося видалити книгу.');
      }
      setPage(0);
      fetchBooks(0, true);
      setModalBookId(null);
      if (authorId) navigate(0);
    } catch (error) {
      setModalError(getErrorMessage(error));
    }
  };

  if (search && !error && books.length === 0) {
    return (
      <div className={styles.container}>
        <p>Книг за вашим запитом не знайдено.</p>
      </div>
    );
  }

  if (!isLoading && !error && books.length === 0) {
    return (
      <div className={styles.container}>
        <p>Книг поки немає.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.books}>
        {page === 0 ? (
          isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorComponent
              error={error}
              tryAgain={() => fetchBooks(0, true)}
            />
          ) : (
            <>
              {search && totalCount > 0 ? (
                <p className={styles.totalCount}>Знайдено: {totalCount}</p>
              ) : (
                list && (
                  <p className={styles.totalCount}>
                    Книг у списку: {totalCount}
                  </p>
                )
              )}
              {books.map((book, index) => (
                <BookCard
                  countNumber={index + 1}
                  user={user}
                  key={book._id}
                  book={book}
                  onDelete={() => setModalBookId(book._id)}
                  isList={!!list}
                  onRemovalFromMyList={() => fetchBooks(0, true)}
                />
              ))}
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
            {search && totalCount > 0 ? (
              <p className={styles.totalCount}>Знайдено: {totalCount}</p>
            ) : (
              list && (
                <p className={styles.totalCount}>Книг у списку: {totalCount}</p>
              )
            )}
            {books.map((book, index) => (
              <BookCard
                countNumber={index + 1}
                user={user}
                key={book._id}
                book={book}
                onDelete={() => setModalBookId(book._id)}
                isList={!!list}
                onRemovalFromMyList={() => fetchBooks(0, true)}
              />
            ))}
            {isLoading ? (
              <Loader />
            ) : error ? (
              <ErrorComponent
                error={error}
                tryAgain={() => fetchBooks(page, false)}
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
      {modalBookId && role === 'admin' && (
        <ConfirmModal
          message="Ви впевнені, що хочете видалити цю книгу?"
          onClose={() => setModalBookId(null)}
          onConfirm={() => handleDelete(modalBookId)}
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

export default BookList;
