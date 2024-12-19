import React, { useState, useRef } from 'react';
import styles from './author-autocomplete-input.module.css';

const AuthorAutocomplete = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [authors, setAuthors] = useState<{ _id: string; name: string }[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<any>(null);

  const fetchAuthors = async (query: string) => {
    if (!query) {
      setAuthors([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/authors?search=${query}`
      );
      if (!response.ok) {
        throw new Error('Помилка при отриманні авторів');
      }
      const data = await response.json();
      setAuthors(data || []);
    } catch (error) {
      console.error('Помилка:', error);
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedAuthor(null);
    setIsOpen(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchAuthors(value);
      } else {
        setAuthors([]);
      }
    }, 600);
  };

  const handleAuthorSelect = (author: { _id: string; name: string }) => {
    setInputValue(author.name);
    setSelectedAuthor(author);
    setIsDisabled(true);
    setIsOpen(false);
    setAuthors([]);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  const clearInput = () => {
    setIsDisabled(false);
    setSelectedAuthor(null);
    setInputValue('');
  };

  return (
    <div className={styles.container}>
      <input
        disabled={isDisabled}
        type="text"
        id="author"
        placeholder="Автор"
        required
        aria-required="true"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
        onBlur={handleBlur}
      />
      {isDisabled && (
        <button
          type="button"
          onClick={clearInput}
          className={styles['clear-btn']}
        >
          &times;
        </button>
      )}
      <label htmlFor="author" className={isDisabled ? styles['has-value'] : ''}>
        Автор<span className="asterisk">*</span>
      </label>

      <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
        {!isLoading && authors.length > 0 && (
          <ul className={styles.options}>
            {authors.map((author) => (
              <li
                className={styles.option}
                key={author._id}
                onMouseDown={() => {
                  handleAuthorSelect(author);
                }}
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
          <p>Почніть вводити прізвище і виберіть з існуючих авторів.</p>
        )}
        {isLoading && <p>Завантаження...</p>}
      </div>

      <input
        type="hidden"
        name="author"
        value={selectedAuthor?._id}
        required
        aria-required="true"
      />
    </div>
  );
};

export default AuthorAutocomplete;
