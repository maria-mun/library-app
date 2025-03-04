import styles from './author-card.module.css';
import { Link } from 'react-router-dom';

type Author = {
  _id: string;
  name: string;
  country?: string;
  books?: Book[];
  photo?: string;
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

type AuthorCardProps = {
  author: Author;
};

const AuthorCard = ({ author }: AuthorCardProps) => {
  return (
    <div className={styles.author}>
      <Link to={`/author/${author._id}`}>
        <div className={styles.photo}>
          {author.photo && (
            <img src={author.photo} alt={`Фото автора - ${author.name}`}></img>
          )}
        </div>
      </Link>
      <div className={styles.details}>
        <h2 className={styles.name}>
          <Link to={`/author/${author._id}`}>{author.name}</Link>
        </h2>
        <p className={styles.country}>{author.country}</p>
      </div>
      <div className={styles['options-cont']}>
        <button className={styles['options-btn']}>⋮</button>
      </div>
    </div>
  );
};

export default AuthorCard;
