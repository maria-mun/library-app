import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../AuthContext';
import styles from './add-author.module.css';
import XIcon from '../../components/Icons/XIcon';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { getErrorMessage } from '../../utils/errorUtils';
const API_URL = import.meta.env.VITE_API_URL;

const AddAuthorForm = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { getFreshToken } = useAuth();
  const [modalError, setModalError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModalError(null);

    const authorData = {
      name: name.trim(),
      country,
      description,
      photo,
    };

    try {
      const token = await getFreshToken();

      const response = await fetch(`${API_URL}/authors/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(authorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при додаванні автора.');
      }

      setSuccessMessage('Автора/-ку успішно додано!');
      setTimeout(() => navigate(-1), 2000);
    } catch (error) {
      setModalError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className={styles.successContainer}>
        <h3>{successMessage}</h3>
        <img
          className={styles.successIcon}
          width="80"
          src="/success.svg"
          alt=""
        />
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <button
        type="button"
        className={styles['close-btn']}
        onClick={() => navigate(-1)}
      >
        <XIcon size={30} />
      </button>
      <h2 className={styles.heading}>Заповніть дані про автора</h2>
      <p>
        Обов'язкові поля позначені зірочкою <span className="asterisk">*</span>
      </p>
      <div className={styles['input-group']}>
        <label htmlFor="name" className={styles.label}>
          Ім'я автора<span className={styles.asterisk}>*</span>
        </label>
        <input
          autoComplete="off"
          className={styles.input}
          type="text"
          id={styles.name}
          name="name"
          maxLength={100}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className={styles['input-group']}>
        <label htmlFor="country" className={styles.label}>
          Країна
        </label>
        <input
          autoComplete="off"
          className={styles.input}
          type="text"
          id={styles.country}
          name="country"
          maxLength={50}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>
      <div className={styles['input-group']}>
        <label htmlFor="description" className={styles.label}>
          Коротка інформація
        </label>
        <input
          autoComplete="off"
          className={styles.input}
          type="text"
          id={styles.description}
          name="description"
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className={styles['input-group']}>
        <label htmlFor="photo" className={styles.label}>
          Посилання на фото
        </label>
        <input
          autoComplete="off"
          className={styles.input}
          type="url"
          id={styles.photo}
          name="photo"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className={styles['submit-btn']}
        disabled={!name.trim() || loading}
      >
        {loading ? <span className={styles.spinner}></span> : 'Додати'}
      </button>
      {modalError && (
        <ConfirmModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </form>
  );
};

export default AddAuthorForm;
