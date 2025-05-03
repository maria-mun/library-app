import styles from './booklist.module.css';
import { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Loader from '../Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { User } from 'firebase/auth';

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
};

function BookList({ authorId, sort, order, search, list }: BooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [modalBookId, setModalBookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loadingUser } = useAuth() as {
    user: User;
    loadingUser: boolean;
  };

  console.log('booklist render');
  useEffect(() => {
    if (!loadingUser) {
      fetchBooks();
    }
  }, [authorId, sort, order, search, loadingUser, user, list]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:4000/api/books';
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
      if (user) {
        params.append('firebaseUid', user.uid);
      }
      if (list) {
        params.append('list', list);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setBooks(data);
      console.log('books fetched');
    } catch (error) {
      console.error('Помилка при отриманні книг:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4000/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
    setModalBookId(null);
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
          />
        ))}
      </div>
      {modalBookId && (
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
