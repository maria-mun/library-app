import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';

type Book = {
  _id: string;
  title: string;
  author: Author;
  year?: number;
  cover?: string;
  rating?: number;
  status?: string;
  genres?: string[];
};

type Author = {
  _id: string;
  name: string;
  country?: string;
  description?: string;
  photo?: string;
};

const BookDetail = () => {
  const [bookData, setBookData] = useState<Book | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/books/${id}`);
        const data = await response.json();
        setBookData(data);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };
    fetchBook();
  }, [id]);

  console.log('Book data:', bookData);
  if (!bookData) {
    return <Loader />;
  }

  return (
    <div>
      <h1>{bookData.title}</h1>
      <p>Автор: {bookData.author.name}</p>
      <p>Рік: {bookData.year}</p>
      <div className="cover">
        <img src={bookData.cover} alt="" />
      </div>
    </div>
  );
};

export default BookDetail;
