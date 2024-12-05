import './all-books.css';
import React, { useState, useEffect } from 'react';
import BookCard from '../../components/BookCard/BookCard';

type Book = {
  _id: string;
  title: string;
  author: string;
  year: number;
  cover: string;
  rating: number;
  status: string;
  genres: string[];
};

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:4000/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="books">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default Books;
