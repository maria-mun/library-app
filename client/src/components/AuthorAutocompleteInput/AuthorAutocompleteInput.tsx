import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import styles from './author-autocomplete-input.module.css';
import { getErrorMessage } from '../../utils/errorUtils.ts';
const API_URL = import.meta.env.VITE_API_URL;

interface Author {
  _id: string;
  name: string;
}

interface Props {
  value: Author | null;
  onChange: (author: Author | null) => void;
}

const AuthorAutocompleteInput = ({ value, onChange }: Props) => {
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, getFreshToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value?.name || '');
  }, [value]);

  const fetchAuthors = async (query: string) => {
    if (!query) {
      setAuthors([]);
      return;
    }

    try {
      const url = `${API_URL}/authors/${
        user ? 'authorized' : 'public'
      }?search=${query}`;

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
      const { data, message } = await response.json();
      if (!response.ok)
        throw new Error(
          message || 'Помилка при отриманні авторів. Спробуйте ще раз.'
        );

      setAuthors(data || []);
    } catch (error) {
      setError(getErrorMessage(error));
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(null);
    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchAuthors(value);
      } else {
        setAuthors([]);
        setIsLoading(false);
      }
    }, 600);
  };

  const handleAuthorSelect = (author: Author) => {
    onChange(author);
    setInputValue(author.name);
    setIsOpen(false);
    setAuthors([]);
  };

  const clearInput = () => {
    onChange(null);
    setInputValue('');
  };

  return (
    <div className={styles['input-group']}>
      <label htmlFor="author" className={styles.label}>
        Автор<span className="asterisk">*</span>
      </label>
      <div className={styles['input-container']}>
        <input
          className={styles.input}
          type="text"
          id="author"
          required
          maxLength={100}
          aria-required="true"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          autoComplete="off"
          disabled={!!value}
        />
        {value && (
          <button
            type="button"
            onClick={clearInput}
            className={styles['clear-btn']}
            aria-label="Очистити поле"
          >
            &times;
          </button>
        )}
      </div>

      <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
        {!isLoading && authors.length > 0 && (
          <ul className={styles.options}>
            {authors.map((author) => (
              <li
                className={styles.option}
                key={author._id}
                onMouseDown={() => handleAuthorSelect(author)}
              >
                {author.name}
              </li>
            ))}
          </ul>
        )}

        {!isLoading && authors.length === 0 && inputValue !== '' && !error && (
          <p>Нічого не знайдено</p>
        )}
        {inputValue === '' && !error && (
          <p>
            Почніть вводити ім’я і виберіть зі списку. Якщо автора не існує,
            спочатку додайте його до бази
          </p>
        )}
        {isLoading && inputValue !== '' && <p>Завантаження...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <input
        type="hidden"
        name="author"
        value={value?._id || ''}
        required
        aria-required="true"
      />
    </div>
  );
};

export default AuthorAutocompleteInput;
