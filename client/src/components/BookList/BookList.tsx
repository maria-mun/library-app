import styles from './booklist.module.css';
import { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Loader from '../Loader/Loader';
import { useAuth } from '../../AuthContext';

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

  useEffect(() => {
    if (!loadingUser) {
      fetchBooks();
    }
  }, [authorId, sort, order, search, loadingUser, list]);

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);

    try {
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка при завантаженні книг');
      }

      setBooks(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Помилка при завантаженні книг'
      );
    } finally {
      setIsLoading(false);
    }
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
      fetchBooks();
      setModalBookId(null);
    } catch (error) {
      setModalError(
        error instanceof Error ? error.message : 'Не вдалося видалити книгу.'
      );
    }
  };

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (search && books.length === 0) {
    return (
      <div className={styles.container}>
        <p>Книг за вашим запитом не знайдено.</p>
      </div>
    );
  }

  if (!isLoading && books.length === 0) {
    return (
      <div className={styles.container}>
        <p>Книг поки немає.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.books}>
        {books.map((book) => (
          <BookCard
            user={user}
            key={book._id}
            book={book}
            onDelete={() => setModalBookId(book._id)}
            isList={!!list}
            onRemovalFromMyList={fetchBooks}
          />
        ))}
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
