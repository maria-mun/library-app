import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import styles from './register-form.module.css';
import Input from '../../components/Input/Input';
import { getErrorMessage } from '../../utils/errorUtils.ts';
import XIcon from '../../components/Icons/XIcon';
const API_URL = import.meta.env.VITE_API_URL;

const RegisterForm = () => {
  const [displayName, setDisplayName] = useState({
    value: '',
    isFocused: false,
    isValid: false,
  });
  const [email, setEmail] = useState({
    value: '',
    isFocused: false,
    isValid: false,
    isTaken: false,
  });

  const [password, setPassword] = useState({
    value: '',
    isFocused: false,
    isValid: false,
  });

  const [confirmPassword, setConfirmPassword] = useState({
    value: '',
    isFocused: false,
    isValid: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  function handleDisplayNameInput(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setDisplayName({
      isFocused: true,
      value: newValue,
      isValid: newValue.length > 0,
    });

    setError('');
  }

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setEmail({
      isTaken: false,
      isFocused: true,
      value: newValue,
      isValid: validateEmail(newValue),
    });
    setError('');
  }

  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword({
      isFocused: true,
      value: e.target.value,
      isValid: e.target.value.length >= 6,
    });
    setError('');
  }

  function handleConfirmPasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword({
      isFocused: true,
      value: e.target.value,
      isValid: e.target.value === password.value,
    });
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await registerUser(
        email.value,
        password.value,
        displayName.value
      );

      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Помилка при реєстрації користувача.'
        );
      }

      setSuccessMessage(`Користувач ${user.displayName} зареєстрований!`);
      setTimeout(() => navigate(from, { replace: true }), 2000);
    } catch (err) {
      const error = err as { code: string };

      if (error.code === 'auth/email-already-in-use') {
        setEmail((prev) => ({ ...prev, isTaken: true }));
      } else if (error.code === 'auth/network-request-failed') {
        setError("Помилка мережі. Перевірте з'єднання з Інтернетом");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const formIsValid =
    email.isValid &&
    !email.isTaken &&
    password.isValid &&
    confirmPassword.isValid &&
    displayName.isValid;

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
    <form className={styles.form}>
      <button
        type="button"
        className={styles['close-btn']}
        onClick={() => navigate(from, { replace: true })}
      >
        <XIcon size={30} />
      </button>

      <h1 className={styles.title}>Реєстрація</h1>

      <Input
        name="displayName"
        type="text"
        label="Ім'я"
        onChange={handleDisplayNameInput}
        isValid={displayName.isValid}
        isFocused={displayName.isFocused}
        placeholder="Ім'я"
        value={displayName.value}
        errorMsg="Введіть ваше ім'я"
      />
      <Input
        name="email"
        type="text"
        label="Електронна адреса"
        onChange={handleEmailInput}
        isValid={email.isValid && !email.isTaken}
        isFocused={email.isFocused}
        placeholder="Електронна адреса"
        value={email.value}
        errorMsg={
          email.isTaken
            ? 'Ця електронна адреса вже зайнята'
            : 'Введіть коректну адресу електронної пошти'
        }
      />
      <Input
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Пароль"
        onChange={handlePasswordInput}
        isValid={password.isValid}
        isFocused={password.isFocused}
        placeholder="Пароль"
        value={password.value}
        errorMsg="Пароль має містити не менше 6 символів"
      />
      <Input
        name="confirmPassword"
        type={showPassword ? 'text' : 'password'}
        label="Підтвердіть пароль"
        onChange={handleConfirmPasswordInput}
        isValid={confirmPassword.isValid}
        isFocused={confirmPassword.isFocused}
        placeholder="Підтвердіть пароль"
        value={confirmPassword.value}
        errorMsg="Паролі не збігаються!"
      />
      <label htmlFor="showPassword">
        <input
          type="checkbox"
          id={'showPassword'}
          className={styles.checkbox}
          name="showPassword"
          checked={showPassword}
          onChange={() => {
            setShowPassword((prev) => !prev);
          }}
        />
        Показати пароль
      </label>
      {error && <div className={styles.error}>{error}</div>}
      <button
        className={styles['submit-btn']}
        onClick={handleSubmit}
        disabled={!formIsValid || loading}
      >
        {loading ? <span className={styles.spinner}></span> : 'Зареєструватися'}
      </button>
      <p className={styles.text}>
        Вже маєте акаунт?{' '}
        <Link
          to="/login"
          state={{ from: location.state?.from || '/' }}
          className={styles.link}
        >
          Увійти
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;

const validateEmail = (email: string) => {
  return !!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
};
