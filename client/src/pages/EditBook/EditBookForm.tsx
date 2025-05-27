import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './edit-book-form.module.css';
import Select, { SelectOption } from '../../components/Select/Select';
import AuthorAutocompleteInput from '../../components/AuthorAutocompleteInput/AuthorAutocompleteInput';
import XIcon from '../../components/Icons/XIcon';
import Spinner from '../../components/Spinner/Spinner';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL;
import { useAuth } from '../../AuthContext';

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

const allGenres: SelectOption[] = [
  'Антиутопія',
  'Біографія / Мемуари',
  'Бізнес / Економіка',
  'Вестерн',
  'Жахи',
  'Графічний роман / Комікси',
  'Гумор / Сатира',
  'Детектив',
  'Дитяча література',
  'Історія',
  'Історична проза',
  'Класика',
  'Кримінальна проза',
  'Кулінарія',
  'Літературна проза',
  'Магічний реалізм',
  'Мистецтво / Культура',
  'Міське фентезі',
  'Міфи / Ретелінги (переосмислення міфів)',
  'Наука / Популярна наука',
  'Наукова фантастика',
  'Освіта / Навчальні матеріали',
  'Оповідання / Новели',
  'Паранормальна проза',
  'Подорожі',
  'Політика / Суспільство',
  'Пригоди',
  'Релігія / Духовність',
  'Романтика',
  'Саморозвиток / Психологія',
  'Сучасна проза',
  'Темне фентезі',
  'Трилер',
  'Фентезі',
  'Філософія',
  'Шпигунський роман',
  'Юнацька література',
].map((genre) => ({ label: genre, value: genre }));

const EditBookForm = () => {
  const { bookId } = useParams<{ bookId: string }>();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { getFreshToken } = useAuth();
  const [modalError, setModalError] = useState<string | null>(null);

  const [genres, setGenres] = useState<SelectOption[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [cover, setCover] = useState('');
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${API_URL}/books/public/${bookId}`);
        if (!res.ok) throw new Error('Не вдалося отримати дані про книгу.');
        const data: Book = await res.json();
        setTitle(data.title);
        setYear(data.year);
        setCover(data.cover);
        setAuthor(data.author);
        setGenres(data.genres.map((genre) => ({ label: genre, value: genre })));
      } catch (error) {
        setModalError(
          error instanceof Error
            ? error.message
            : 'Не вдалося отримати дані про книгу.'
        );
      }
    };

    fetchBook();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModalError(null);

    const bookData = {
      title,
      year,
      cover,
      author: author?._id,
      genres: genres.map((g) => g.value),
    };

    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/books/edit/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при оновленні книги.');
      }
      setSuccessMessage('Книгу оновлено!');
      setTimeout(() => navigate(-1), 2000);
    } catch (error) {
      console.log(error);
      setModalError(
        error instanceof Error
          ? error.message
          : 'Виникла помилка при оновленні книги.'
      );
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
          maxLength={100}
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
          max={new Date().getFullYear()}
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
        onChange={setGenres}
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
        {loading ? <Spinner /> : 'Оновити'}
      </button>

      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </form>
  );
};

export default EditBookForm;
