import styles from './all-books.module.css';
import { useState, useEffect } from 'react';
import BookCard from '../../components/BookCard/BookCard';
import DeleteBookModal from '../../components/ModalDelete/ModalDelete';

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

function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [modalBookId, setModalBookId] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Помилка при отриманні книг:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4000/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
    setModalBookId(null);
  };

  return (
    <>
      <div className={styles.books}>
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            activeBookId={activeBookId}
            onOpenOptions={setActiveBookId}
            onDelete={() => setModalBookId(book._id)}
          />
        ))}
      </div>
      {modalBookId && (
        <DeleteBookModal
          onClose={() => setModalBookId(null)}
          onConfirm={() => handleDelete(modalBookId)}
        />
      )}
    </>
  );
}

export default Books;
