import React, { useRef, useState, useEffect } from 'react';
import styles from './author-autocomplete-input.module.css';
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value?.name || '');
  }, [value]);

  const fetchAuthors = async (query: string) => {
    if (!query) {
      setAuthors([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/authors?search=${query}`);
      if (!response.ok) throw new Error('Помилка при отриманні авторів');
      const data = await response.json();
      setAuthors(data || []);
    } catch (err) {
      console.error('Помилка:', err);
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(null); // обнуляємо вибраного автора
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchAuthors(value);
      } else {
        setAuthors([]);
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

        {!isLoading && authors.length === 0 && inputValue !== '' && (
          <p>Нічого не знайдено</p>
        )}
        {!isLoading && authors.length === 0 && inputValue === '' && (
          <p>Почніть вводити ім’я і виберіть зі списку</p>
        )}
        {isLoading && <p>Завантаження...</p>}
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
