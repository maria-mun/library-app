import styles from './my-lists.module.css';
import { useState, useEffect } from 'react';
import BookList from '../../components/BookList/BookList';
import SearchIcon from '../../components/Icons/SearchIcon';
import Select, { SelectOption } from '../../components/Select/Select';

const lists = [
  { key: 'allLists', label: 'Всі' },
  { key: 'readBooks', label: 'Прочитано' },
  { key: 'currentlyReadingBooks', label: 'Читаю' },
  { key: 'plannedBooks', label: 'Планую' },
  { key: 'abandonedBooks', label: 'Закинуто' },
];

const sortOptions: SelectOption[] = [
  { value: '', label: '- -' },
  { value: 'title_asc', label: 'за назвою (А-Я)' },
  { value: 'title_desc', label: 'за назвою (Я-А)' },
  { value: 'year_asc', label: 'за роком (зростання)' },
  { value: 'year_desc', label: 'за роком (спадання)' },
];

function MyLists() {
  const [sort, setSort] = useState<string>();
  const [order, setOrder] = useState<string>();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState<SelectOption>(
    sortOptions[0]
  );
  const [activeList, setActiveList] = useState('allLists');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

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
      <h2 className={styles.title}>Мої списки</h2>

      <div className={styles.lists}>
        {lists.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles['list-btn']} ${styles[key]} ${
              activeList === key ? styles.active : ''
            }`}
            onClick={() => setActiveList(key)}
          >
            {label}
          </button>
        ))}
      </div>

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

      <BookList
        sort={sort}
        order={order}
        search={debouncedSearch}
        list={activeList}
      />
    </div>
  );
}

export default MyLists;
