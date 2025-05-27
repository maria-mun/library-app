import styles from './all-books.module.css';
import { useState, useEffect } from 'react';
import BookList from '../../components/BookList/BookList';
import SearchIcon from '../../components/Icons/SearchIcon';
import Select, { SelectOption } from '../../components/Select/Select';

const sortOptions: SelectOption[] = [
  { value: '', label: '- -' },
  { value: 'averageRating_asc', label: 'за рейтингом (зростання)' },
  { value: 'averageRating_desc', label: 'за рейтингом (спадання)' },
  { value: 'title_asc', label: 'за назвою (А-Я)' },
  { value: 'title_desc', label: 'за назвою (Я-А)' },
  { value: 'year_asc', label: 'за роком (зростання)' },
  { value: 'year_desc', label: 'за роком (спадання)' },
];

function AllBooksPage() {
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState<SelectOption>(
    sortOptions[0]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const handleSortChange = (option: SelectOption | undefined) => {
    setSelectedSort(option || sortOptions[0]);
    if (option?.value) {
      const [newSort, newOrder] = option.value.split('_');
      setSort(newSort);
      setOrder(newOrder);
    } else {
      setSort(undefined);
      setOrder(undefined);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Усі книги</h2>

      <div className={styles.filters}>
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
        <div className={styles.sort}>
          <span>Сортування:</span>
          <Select
            options={sortOptions}
            value={selectedSort}
            onChange={handleSortChange}
          />
        </div>
      </div>

      <BookList sort={sort} order={order} search={debouncedSearch} />
    </div>
  );
}

export default AllBooksPage;
