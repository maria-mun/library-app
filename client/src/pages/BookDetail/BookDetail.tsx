import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../AuthContext';
import CommentSection from '../../components/CommentSection/CommentSection';
const API_URL = import.meta.env.VITE_API_URL;

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const { user, loadingUser, getFreshToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const url = `${API_URL}/books/${user ? 'authorized' : 'public'}/${id}`;
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

        const data = await response.json();
        setBookData(data);
      } catch (error) {
        console.error(error);
        navigate('/error', {
          state: {
            code: 500,
            message: 'Помилка при з’єднанні з сервером. Спробуйте ще раз.',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, user, loadingUser]);

  if (isLoading || !bookData) {
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
      <CommentSection bookId={bookData._id} />
    </div>
  );
};

export default BookDetail;
