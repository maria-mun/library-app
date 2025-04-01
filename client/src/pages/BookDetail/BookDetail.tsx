import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

type Book = {
  _id: string;
  title: string;
  author: string;
  year?: number;
  cover?: string;
  rating?: number;
  status?: string;
  genres?: string[];
};

const BookDetail = () => {
  const [bookData, setBookData] = useState<Book | null>(null);
  const { id } = useParams<{ id: string }>();

  const fetchBook = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/books/${id}`);
      const data = await response.json();
      setBookData(data);
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (!bookData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{bookData.title}</h1>
      <p>Author: {bookData.author}</p>
      <p>Year: {bookData.year}</p>
      <div className="cover">
        <img src={bookData.cover} alt="" />
      </div>
    </div>
  );
};

export default BookDetail;
