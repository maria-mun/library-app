import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './edit-book-form.module.css';
import Select from '../../components/Select/Select';
import AuthorAutocompleteInput from '../../components/AuthorAutocompleteInput/AuthorAutocompleteInput';
import { SelectOption } from '../../components/Select/Select';
import XIcon from '../../components/Icons/XIcon';

interface Author {
  _id: string;
  name: string;
}

interface Book {
  title: string;
  year: string;
  cover: string;
  author: Author;
  genres: string[];
}

const allGenres = [
  'Фентезі',
  'Пригоди',
  'Детектив',
  'Романтика',
  'Історичне',
  'Науково-популярне',
  'Лірика',
  'Для дітей',
  'Для підлітків',
];

const EditBookForm = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [cover, setCover] = useState('');
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/books/${bookId}`);
        if (!res.ok) throw new Error('Не вдалося отримати книгу');
        const data: Book = await res.json();
        setTitle(data.title);
        setYear(data.year);
        setCover(data.cover);
        setAuthor(data.author);
        setGenres(data.genres);
      } catch (err) {
        console.error('Помилка при завантаженні книги:', err);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const bookData = {
      title,
      year,
      cover,
      author: author?._id,
      genres: genres,
    };

    try {
      const res = await fetch(`http://localhost:4000/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!res.ok) throw new Error();
      setSuccessMessage('Книгу оновлено!');
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className={styles.successContainer}>
        <h3>{successMessage}</h3>
        <img
          className={styles.successIcon}
          width="80"
          src="/success.svg"
          alt=""
        />
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <button
        type="button"
        className={styles['close-btn']}
        onClick={() => navigate(-1)}
      >
        <XIcon size={30} />
      </button>
      <h2 className={styles.heading}>Редагувати книгу</h2>

      <div className={styles['input-group']}>
        <label htmlFor="title" className={styles.label}>
          Назва книги<span className="asterisk">*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <AuthorAutocompleteInput value={author} onChange={setAuthor} />

      <div className={styles['input-group']}>
        <label htmlFor="year" className={styles.label}>
          Рік виходу
        </label>
        <input
          className={styles.input}
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <Select
        label="Жанри"
        multiple
        options={allGenres}
        value={genres}
        onChange={(o) => setGenres(o)}
      />

      <div className={styles['input-group']}>
        <label htmlFor="cover" className={styles.label}>
          Посилання на обкладинку
        </label>
        <input
          className={styles.input}
          type="url"
          id="cover"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className={styles['submit-btn']}
        disabled={!title.trim() || !author || loading}
      >
        {loading ? <span className={styles.spinner}></span> : 'Оновити'}
      </button>
    </form>
  );
};

export default EditBookForm;
