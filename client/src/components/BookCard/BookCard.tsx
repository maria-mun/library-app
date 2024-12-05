import React from 'react';
import { Link } from 'react-router-dom';
import './book-card.css';

type Book = {
  _id: string;
  title: string;
  author: string;
  year: number;
  cover: string;
  rating: number;
  genres: string[];
};

type BookCardProps = {
  book: Book;
};

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="book">
      <Link to={`/book/${book._id}`}>
        <div className="cover">
          {book.cover && (
            <img src={book.cover} alt={`Обкладинка книги ${book.title}`}></img>
          )}
        </div>
      </Link>
      <div className="details">
        <h2 className="title">
          <Link to={`/book/${book._id}`}>{book.title}</Link>
        </h2>
        <p className="author">{book.author}</p>
        <p className="year">{book.year}</p>
        <div className="rating">
          <span>⭐ {book.rating}</span>
        </div>
        <div className="genres">
          {book.genres.map((genre, index) => (
            <span key={index}>{genre}</span>
          ))}
        </div>
      </div>
      <div className="options-cont">
        <button className="options-btn">⋮</button>
      </div>
    </div>
  );
};

export default BookCard;
