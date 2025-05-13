import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './add-book-form.module.css';
import Select from '../../components/Select/Select';
import AuthorAutocompleteInput from '../../components/AuthorAutocompleteInput/AuthorAutocompleteInput';
import { SelectOption } from '../../components/Select/Select';
import XIcon from '../../components/Icons/XIcon';
const API_URL = import.meta.env.VITE_API_URL;

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

interface Author {
  _id: string;
  name: string;
}
const AddBookForm = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { getFreshToken } = useAuth();

  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [cover, setCover] = useState('');
  const [author, setAuthor] = useState<Author | null>(null);

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
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/books/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) throw new Error();

      setSuccessMessage('Книгу успішно додано!');
      setTimeout(() => navigate('/allBooks'), 2000);
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
      <h2 className={styles.heading}>Заповніть дані про книгу</h2>
      <p>
        Обов'язкові поля позначені зірочкою <span className="asterisk">*</span>
      </p>
      <div className={styles['input-group']}>
        <label htmlFor="title" className={styles.label}>
          Назва книги<span className="asterisk">*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          id={styles.title}
          name="title"
          placeholder="Назва книги"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          id={styles.year}
          name="year"
          placeholder="Рік виходу"
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
          id={styles.cover}
          name="cover"
          placeholder="Обкладинка"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className={styles['submit-btn']}
        disabled={!title.trim() || !author || loading}
      >
        {loading ? <span className={styles.spinner}></span> : 'Додати'}
      </button>
    </form>
  );
};

export default AddBookForm;
