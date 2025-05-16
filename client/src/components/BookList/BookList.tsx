import styles from './booklist.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  rating?: number;
  genres?: string[];
};

type BooksProps = {
  authorId?: string;
  sort?: string;
  order?: string;
  search?: string;
  list?: string;
  onError: (errorMessage: string) => void;
};

function BookList({
  authorId,
  sort,
  order,
  search,
  list,
  onError,
}: BooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [modalBookId, setModalBookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, loadingUser, getFreshToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser || user) {
      fetchBooks();
    }
  }, [authorId, sort, order, search, loadingUser, user, list]);

  const fetchBooks = async () => {
    setIsLoading(true);

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
        onError(data.message);
      }

      setBooks(data);
    } catch (error) {
      console.error(error);
      onError("Не вдалося зв'язатися з сервером. Спробуйте ще раз.");
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
        navigate('/error', {
          state: {
            code: response.status,
            message: errorData.message || 'Щось пішло не так',
          },
        });
        return;
      }
      fetchBooks();
      setModalBookId(null);
    } catch (err) {
      console.log(err);
      navigate('/error', {
        state: {
          code: 500,
          message: 'Помилка при з’єднанні з сервером. Спробуйте ще раз.',
        },
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (search && books.length === 0) {
    return <p>Книг за вашим запитом не знайдено.</p>;
  }

  if (books.length === 0) {
    return <p>Книг поки немає.</p>;
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
    </>
  );
}

export default BookList;
