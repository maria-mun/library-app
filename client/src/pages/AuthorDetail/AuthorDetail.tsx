import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './author-detail.module.css';
import BookList from '../../components/BookList/BookList';
import Select, { SelectOption } from '../../components/Select/Select';
import AuthorCard from '../../components/AuthorCard/AuthorCard';
const API_URL = import.meta.env.VITE_API_URL;

type Author = {
  _id: string;
  name: string;
  country?: string;
  description?: string;
  photo?: string;
  books?: Book[];
};
type Book = {
  _id: string;
  title: string;
  author: Author;
  year?: number;
  cover?: string;
  rating?: number;
  status?: string;
  genres?: string[];
};

const sortOptions: SelectOption[] = [
  { value: '', label: '- -' },
  { value: 'averageRating_asc', label: 'за рейтингом (зростання)' },
  { value: 'averageRating_desc', label: 'за рейтингом (спадання)' },
  { value: 'title_asc', label: 'за назвою (А-Я)' },
  { value: 'title_desc', label: 'за назвою (Я-А)' },
  { value: 'year_asc', label: 'за роком (зростання)' },
  { value: 'year_desc', label: 'за роком (спадання)' },
];

const AuthorDetail = () => {
  const [author, setAuthor] = useState<Author | null>(null);
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [selectedSort, setSelectedSort] = useState<SelectOption>(
    sortOptions[0]
  );

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

  useEffect(() => {
    const fetchAuthor = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/authors/${id}`);
        const data = await response.json();
        setAuthor(data);
      } catch (error) {
        console.error('Error fetching author details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [id]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <AuthorCard
        author={author}
        onDelete={() => {
          // Handle author deletion logic here
          console.log('Author deleted');
        }}
      />
      <div className={styles.sort}>
        <span>Сортування:</span>
        <Select
          options={sortOptions}
          value={selectedSort}
          onChange={handleSortChange}
        />
      </div>
      <BookList sort={sort} order={order} authorId={id} />
    </div>
  );
};

export default AuthorDetail;
