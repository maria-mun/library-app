import { useState } from 'react';
import { Form, useActionData } from 'react-router-dom';
import './add-book-form.css';
import Select from '../../components/Select/Select';
import { SelectOption } from '../../components/Select/Select';

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const bookData = Object.fromEntries(formData);

  try {
    const response = await fetch('http://localhost:4000/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      throw new Error('Помилка при додаванні книги до бази даних');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: 'Помилка при додаванні книги до бази даних',
    };
  }
};

type ActionData = {
  success: boolean;
  message?: string;
};

const AddBookForm = () => {
  const actionData = useActionData() as ActionData;
  const [genres, setGenres] = useState<SelectOption[]>([]);

  return (
    <Form id="add-book-form" method="post">
      <h2>Заповніть дані про книгу</h2>
      <p>
        Обов'язкові поля позначені зірочкою <span className="asterisk">*</span>
      </p>
      <div>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Назва книги"
          required
          aria-required="true"
        />
        <label htmlFor="title">
          Назва книги<span className="asterisk">*</span>
        </label>
      </div>
      <div>
        <input
          type="text"
          id="author"
          name="author"
          placeholder="Автор"
          required
          aria-required="true"
        />
        <label htmlFor="author">
          Автор<span className="asterisk">*</span>
        </label>
      </div>
      <div>
        <input
          type="number"
          id="year"
          name="year"
          placeholder="Рік виходу"
          min="0"
          max={new Date().getFullYear()}
        />
        <label htmlFor="year">Рік виходу</label>
      </div>
      <input type="hidden" name="genres" value={JSON.stringify(genres)} />
      <Select
        label="Жанри"
        multiple
        options={allGenres}
        value={genres}
        onChange={(o) => setGenres(o)}
      />
      <div>
        <input type="url" id="cover" name="cover" placeholder="Обкладинка" />
        <label htmlFor="cover">Посилання на обкладинку</label>
      </div>
      <button type="submit" id="submit-btn">
        Додати
      </button>
      {actionData?.success ? (
        <p>Книга успішно додана!</p>
      ) : (
        actionData && <p>Помилка: {actionData.message}</p>
      )}
    </Form>
  );
};

const allGenres = [
  'Фентезі',
  'Пригоди',
  'Детектив',
  'Романтика',
  'Історичне',
  'Науково-популярне',
  'Лірика',
  'Для дітей',
  'Для підлітків',
];

export default AddBookForm;
