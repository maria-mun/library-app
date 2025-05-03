import styles from './all-authors.module.css';
import { useState, useEffect } from 'react';
import AuthorCard from '../../components/AuthorCard/AuthorCard';
import Loader from '../../components/Loader/Loader';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

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

const AllAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [modalAuthorId, setModalAuthorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.log('Помилка при отриманні авторів', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4000/api/authors/${id}`, {
      method: 'DELETE',
    });
    fetchAuthors();
    setModalAuthorId(null);
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
