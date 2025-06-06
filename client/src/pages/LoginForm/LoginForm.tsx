import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import Input from '../../components/Input/Input';
import styles from './login-form.module.css';
import XIcon from '../../components/Icons/XIcon';
import { getErrorMessage } from '../../utils/errorUtils';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState({
    value: '',
    isFocused: false,
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: '',
    isFocused: false,
    isValid: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEmail({
      isFocused: true,
      value: newValue,
      isValid: validateEmail(newValue),
    });
    setError('');
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword({
      isFocused: true,
      value: newValue,
      isValid: newValue.length > 0,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);

      navigate(from, { replace: true });
    } catch (err) {
      const error = err as { code: string };
      if (error.code === 'auth/invalid-credential') {
        setError('Неправильна електронна адреса або пароль');
      } else if (error.code === 'auth/network-request-failed') {
        setError("Помилка мережі. Перевірте з'єднання з Інтернетом");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const formIsValid = email.isValid && password.value.length > 0;

  return (
    <form className={styles.form}>
      <button
        type="button"
        className={styles['close-btn']}
        onClick={() => navigate(from, { replace: true })}
      >
        <XIcon size={30} />
      </button>
      <h2 className={styles.title}>Вхід</h2>
      <Input
        name="email"
        type="text"
        label="Електронна адреса"
        onChange={handleEmailInput}
        value={email.value}
        isValid={email.isValid}
        placeholder="Електронна адреса"
        isFocused={email.isFocused}
        errorMsg={'Введіть коректну адресу електронної пошти'}
      />
      <Input
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Пароль"
        onChange={handlePasswordInput}
        value={password.value}
        isValid={password.isValid}
        placeholder="Пароль"
        isFocused={password.isFocused}
        errorMsg="Введіть пароль"
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
        className={styles.btn}
        onClick={handleSubmit}
        disabled={!formIsValid || loading}
      >
        {loading ? <span className={styles.spinner}></span> : 'Увійти'}
      </button>
      <p className={styles.text}>
        Ще не зареєстровані?{' '}
        <Link
          to="/register"
          state={{ from: location.state?.from || '/' }}
          className={styles.link}
        >
          Реєстрація
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;

const validateEmail = (email: string) => {
  return !!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
};
