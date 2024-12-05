import React from 'react';
import { Form, useActionData } from 'react-router-dom';
import './add-book-form.css';

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

const AddBookForm: React.FC = () => {
  const actionData = useActionData() as ActionData;

  return (
    <Form id="add-book-form" method="post">
      <h2>Заповніть дані про книгу</h2>
      <p>
        Обов'язкові поля позначені зірочкою <span>*</span>
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
          Назва книги<span>*</span>
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
          Автор<span>*</span>
        </label>
      </div>
      <div>
        <input
          type="number"
          id="year"
          name="year"
          placeholder="Рік вииходу"
          min="0"
          max={new Date().getFullYear()}
        />
        <label htmlFor="year">Рік виходу</label>
      </div>
      <div>
        <input type="text" id="genres" name="genres" placeholder="Жанри" />
        <label htmlFor="genres">Жанри</label>
      </div>
      <div>
        <input type="url" id="cover" name="cover" placeholder="Обкладинка" />
        <label htmlFor="cover">Посилання на обкладинку</label>
      </div>
      <button type="submit">Додати</button>
      {actionData?.success ? (
        <p>Книга успішно додана!</p>
      ) : (
        actionData && <p>Помилка: {actionData.message}</p>
      )}
    </Form>
  );
};

export default AddBookForm;
