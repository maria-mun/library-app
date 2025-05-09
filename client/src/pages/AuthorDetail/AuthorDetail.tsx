import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './author-detail.module.css';
import BookList from '../../components/BookList/BookList';
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

  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('_');
    setSort(newSort);
    setOrder(newOrder);
  };

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/authors/${id}`);
        const data = await response.json();
        setAuthor(data);
      } catch (error) {
        console.error('Error fetching author details:', error);
      }
    };

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
        <div>
          <span>Сортувати:</span>
          <select
            onChange={handleSortChange}
            defaultValue=""
            className={styles.sort}
          >
            <option value="">- -</option>
            <option value="title_asc">за назвою (А-Я)</option>
            <option value="title_desc">за назвою (Я-А)</option>
            <option value="year_asc">за роком (зростання)</option>
            <option value="year_desc">за роком (спадання)</option>
          </select>
        </div>
      </div>
      <BookList sort={sort} order={order} authorId={id} />
    </>
  );
};

export default AuthorDetail;
