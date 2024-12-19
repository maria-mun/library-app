import { Form, useActionData } from 'react-router-dom';
import './add-author.css';

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const authorData = Object.fromEntries(formData);

  try {
    const response = await fetch('http://localhost:4000/api/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authorData),
    });

    if (!response.ok) {
      throw new Error('Помилка при додаванні автора до бази даних');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: 'Помилка при додаванні автора до бази даних',
    };
  }
};

type ActionData = {
  success: boolean;
  message?: string;
};

const AddAuthorForm = () => {
  const actionData = useActionData() as ActionData;

  return (
    <Form id="add-author-form" method="post">
      <h2>Заповніть дані про автора</h2>
      <p>
        Обов'язкові поля позначені зірочкою <span className="asterisk">*</span>
      </p>
      <div>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Ім'я автора"
          required
          aria-required="true"
        />
        <label htmlFor="name">
          Ім'я автора<span className="asterisk">*</span>
        </label>
      </div>
      <div>
        <input type="text" id="country" name="country" placeholder="Країна" />
        <label htmlFor="country">Країна</label>
      </div>
      <div>
        <input
          type="text"
          id="description"
          name="description"
          placeholder="Коротка інформація"
        />
        <label htmlFor="author">Коротка інформація</label>
      </div>
      <button type="submit" id="submit-btn">
        Додати
      </button>
      {actionData?.success ? (
        <p>Автора/-ку успішно додано!</p>
      ) : (
        actionData && <p>Помилка: {actionData.message}</p>
      )}
    </Form>
  );
};

export default AddAuthorForm;
