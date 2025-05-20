import styles from './all-authors.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import AuthorCard from '../../components/AuthorCard/AuthorCard';
import Loader from '../../components/Loader/Loader';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
const API_URL = import.meta.env.VITE_API_URL;

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
  isFavorite?: boolean;
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

const AllAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [modalAuthorId, setModalAuthorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getFreshToken, user, loadingUser } = useAuth();

  useEffect(() => {
    if (!loadingUser) {
      fetchAuthors();
    }
    console.log('authors fetched');
  }, [loadingUser]);

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const url = `${API_URL}/authors/${user ? 'authorized' : 'public'}`;

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
      setAuthors(data);
    } catch (error) {
      console.log('Помилка при отриманні авторів', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getFreshToken();
      await fetch(`${API_URL}/authors/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAuthors();
      setModalAuthorId(null);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className={styles.authors}>
        {authors.map((author) => {
          return (
            <AuthorCard
              author={author}
              key={author._id}
              onDelete={() => {
                if (author.books && author.books.length > 0) {
                  setModalAuthorId('can not be deleted');
                } else {
                  setModalAuthorId(author._id);
                }
              }}
            />
          );
        })}
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
    </>
  );
};

export default AllAuthors;
