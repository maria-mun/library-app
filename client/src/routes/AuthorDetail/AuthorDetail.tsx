import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './author-detail.module.css';
import BookCard from '../../components/BookCard/BookCard';

type Author = {
  _id: string;
  name: string;
  country?: string;
  description?: string;
  photo?: string;
  books?: Book[];
};
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

const AuthorDetail = () => {
  const [author, setAuthor] = useState<Author | null>(null);
  const { id } = useParams<{ id: string }>();

  const fetchAuthor = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/authors/${id}`);
      const data = await response.json();
      setAuthor(data);
    } catch (error) {
      console.error('Error fetching author details:', error);
    }
  };

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  if (!author) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className={styles.author}>
        <div className={styles.photo}>
          {author.photo && (
            <img src={author.photo} alt={`Фото автора - ${author.name}`}></img>
          )}
        </div>

        <div className={styles.details}>
          <h2 className={styles.name}>{author.name}</h2>
          <p className={styles.country}>{author.country}</p>
          <p className={styles.description}>{author.description}</p>
        </div>
      </div>
      <div className={styles.books}>
        {author.books?.map((book) => {
          return <BookCard book={book} key={book._id} />;
        })}
      </div>
    </>
  );
};

export default AuthorDetail;
