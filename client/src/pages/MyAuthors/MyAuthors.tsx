import styles from './my-authors.module.css';
import { useState, useEffect } from 'react';
import AuthorList from '../../components/AuthorList/AuthorList';
import SearchIcon from '../../components/Icons/SearchIcon';

function MyAuthors() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Мої улюблені автори</h2>

      <div className={styles.search}>
        <div className={styles['search-icon']}>
          <SearchIcon size="1rem" />
        </div>

        <input
          className={styles.input}
          type="text"
          placeholder="Пошук"
          value={searchValue}
          onChange={handleSearchChange}
          maxLength={100}
        />

        <button
          className={styles['clear-input-btn']}
          onClick={() => setSearchValue('')}
        >
          &times;
        </button>
      </div>

      <AuthorList favoriteList={true} search={debouncedSearch} />
    </div>
  );
}

export default MyAuthors;
