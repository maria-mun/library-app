import styles from './all-books.module.css';
import { useState, useEffect } from 'react';
import BookList from '../../components/BookList/BookList';

function AllBooksPage() {
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [error, setError] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setError('');
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('_');
    setSort(newSort);
    setOrder(newOrder);
    setError('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <h2 className={styles.title}>Усі книги</h2>
        <div className={styles.filters}>
          <input
            className={styles.search}
            type="text"
            placeholder="Пошук"
            value={searchValue}
            onChange={handleSearchChange}
            maxLength={30}
          />
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
        {error && <p>{error}</p>}
      </div>

      <BookList
        onError={setError}
        sort={sort}
        order={order}
        search={debouncedSearch}
      />
    </div>
  );
}

export default AllBooksPage;
