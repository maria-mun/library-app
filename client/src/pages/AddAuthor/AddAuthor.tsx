import { Form, useActionData, useNavigate } from 'react-router-dom';
import styles from './add-author.module.css';

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
  } catch (error) {
    console.error(error);
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
  const navigate = useNavigate();

  return (
    <Form id={styles['add-author-form']} method="post">
      <button
        className={styles['close-btn']}
        onClick={() => {
          navigate(-1);
        }}
      >
        &otimes;
      </button>
      <h2>Заповніть дані про автора</h2>
      <p>
        Обов'язкові поля позначені зірочкою <span className="asterisk">*</span>
      </p>
      <div>
        <input
          className={styles.input}
          type="text"
          id={styles.name}
          name="name"
          placeholder="Ім'я автора"
          required
          aria-required="true"
        />
        <label htmlFor="name" className={styles.label}>
          Ім'я автора<span className={styles.asterisk}>*</span>
        </label>
      </div>
      <div>
        <input
          className={styles.input}
          type="text"
          id={styles.country}
          name="country"
          placeholder="Країна"
        />
        <label htmlFor="country" className={styles.label}>
          Країна
        </label>
      </div>
      <div>
        <input
          className={styles.input}
          type="text"
          id={styles.description}
          name="description"
          placeholder="Коротка інформація"
        />
        <label htmlFor="author" className={styles.label}>
          Коротка інформація
        </label>
      </div>
      <div>
        <input
          className={styles.input}
          type="url"
          id={styles.photo}
          name="photo"
          placeholder="Посилання на фото"
        />
        <label htmlFor="photo" className={styles.label}>
          Посилання на фото
        </label>
      </div>
      <button type="submit" id={styles['submit-btn']}>
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
