import styles from './all-books.module.css';
import { useState } from 'react';
import BookList from '../../components/BookList/BookList';

function AllBooksPage() {
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('_'); // Формат value: 'title_asc', 'year_desc' і т.д.
    setSort(newSort);
    setOrder(newOrder);
  };

  return (
    <div className={styles.container}>
      <h1>All Books</h1>
      <p>Сортувати за:</p>
      <select onChange={handleSortChange} defaultValue="">
        <option value="">Оберіть сортування</option>
        <option value="title_asc">За назвою (А-Я)</option>
        <option value="title_desc">За назвою (Я-А)</option>
        <option value="year_asc">За роком (зростання)</option>
        <option value="year_desc">За роком (спадання)</option>
      </select>
      <BookList sort={sort} order={order} />
    </div>
  );
}

export default AllBooksPage;
