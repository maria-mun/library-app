import styles from './my-lists.module.css';
import { useState, useEffect } from 'react';
import BookList from '../../components/BookList/BookList';

function MyLists() {
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [activeList, setActiveList] = useState<string>('allLists');

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
      <div className={styles.navigation}>
        <h2 className={styles.title}>Мої списки</h2>
        <div className={styles.lists}>
          {lists.map((list) => (
            <button
              key={list.key}
              className={`${styles['list-btn']} ${styles[list.key]} ${
                activeList === list.key ? styles.active : ''
              }`}
              onClick={() => setActiveList(list.key)}
            >
              {list.label}
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <input
            className={styles.search}
            type="text"
            placeholder="Пошук"
            value={searchValue}
            onChange={handleSearchChange}
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

const lists = [
  { key: 'allLists', label: 'Всі' },
  { key: 'readBooks', label: 'Прочитано' },
  { key: 'currentlyReadingBooks', label: 'Читаю' },
  { key: 'plannedBooks', label: 'Планую' },
  { key: 'abandonedBooks', label: 'Закинуто' },
];
