import styles from './all-authors.module.css';
import { useState, useEffect } from 'react';
import AuthorCard from '../../components/AuthorCard/AuthorCard';

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

  const fetchAuthors = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.log('Помилка при отриманні авторів', error);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  return (
    <div className={styles.authors}>
      {authors.map((author) => {
        return <AuthorCard author={author} key={author._id} />;
      })}
    </div>
  );
};

export default AllAuthors;
