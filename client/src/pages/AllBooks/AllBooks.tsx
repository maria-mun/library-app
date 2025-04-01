import styles from './all-books.module.css';
import { useState, useEffect } from 'react';
import BookList from '../../components/BookList/BookList';

function AllBooksPage() {
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
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
  };

  return (
    <div className={styles.container}>
      <h1>Всі книги</h1>
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Пошук"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <div>
          <span>Сортувати:</span>
          <select onChange={handleSortChange} defaultValue="">
            <option value="">- -</option>
            <option value="title_asc">за назвою (А-Я)</option>
            <option value="title_desc">за назвою (Я-А)</option>
            <option value="year_asc">за роком (зростання)</option>
            <option value="year_desc">за роком (спадання)</option>
          </select>
        </div>
      </div>

      <BookList sort={sort} order={order} search={debouncedSearch} />
    </div>
  );
}

export default AllBooksPage;
