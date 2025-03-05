import styles from './booklist.module.css';
import { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import DeleteBookModal from '../ModalDelete/ModalDelete';

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
};

function BookList({ authorId, sort, order }: BooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [modalBookId, setModalBookId] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [authorId, sort, order]);

  const fetchBooks = async () => {
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

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setBooks(data);
      console.log('books fetched');
    } catch (error) {
      console.error('Помилка при отриманні книг:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4000/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
    setModalBookId(null);
  };

  return (
    <>
      <div className={styles.books}>
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              activeBookId={activeBookId}
              onOpenOptions={setActiveBookId}
              onDelete={() => setModalBookId(book._id)}
            />
          ))
        ) : (
          <p>Книг поки немає.</p>
        )}
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

export default BookList;
