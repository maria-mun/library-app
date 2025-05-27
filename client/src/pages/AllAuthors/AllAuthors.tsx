import styles from './all-authors.module.css';
import { useState, useEffect } from 'react';
import AuthorList from '../../components/AuthorList/AuthorList';
import SearchIcon from '../../components/Icons/SearchIcon';

function AllAuthors() {
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
      <h2 className={styles.title}>Усі автори</h2>

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

      <AuthorList search={debouncedSearch} />
    </div>
  );
}

export default AllAuthors;
