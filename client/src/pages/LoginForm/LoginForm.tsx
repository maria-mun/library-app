import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import Input from '../../components/Input/Input';
import styles from './login-form.module.css';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState({
    value: '',
    isFocused: false,
    isValid: false,
    doesExist: true,
  });
  const [password, setPassword] = useState({
    value: '',
    isFocused: false,
    isCorrect: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEmail({
      doesExist: true,
      isFocused: true,
      value: newValue,
      isValid: validateEmail(newValue),
    });
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword({
      isFocused: true,
      value: newValue,
      isCorrect: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      console.log('Успішний вхід:', userCredential.user.displayName);

      navigate('/');
    } catch (err) {
      const error = err as { code: string };
      if (error.code === 'auth/invalid-credential') {
        try {
          console.log('Перевірка email:', email.value);
          const response = await fetch(
            `http://localhost:4000/api/auth/user-exists?email=${email.value}`
          );
          const { exists } = await response.json();
          console.log(exists);

          if (!exists) {
            setEmail((prev) => ({ ...prev, doesExist: false }));
          } else {
            setPassword((prev) => ({ ...prev, isCorrect: false }));
          }
        } catch (fetchError) {
          console.error('Помилка перевірки email:', fetchError);
          setError('Помилка перевірки email');
        }
      } else {
        setError('Помилка сервера');
      }
    } finally {
      setLoading(false);
    }
  };

  const formIsValid =
    email.isValid &&
    email.doesExist &&
    password.value.length > 0 &&
    password.isCorrect;

  return (
    <form className={styles.form}>
      <h2 className={styles.title}>Вхід</h2>

      <Input
        name="email"
        type="text"
        label="Електронна адреса"
        onChange={handleEmailInput}
        value={email.value}
        isValid={email.isValid && email.doesExist}
        placeholder="Електронна адреса"
        isFocused={email.isFocused}
        errorMsg={
          !email.doesExist
            ? 'Ця адреса ще не зареєстрована'
            : 'Введіть коректну адресу електронної пошти'
        }
      />
      <Input
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Пароль"
        onChange={handlePasswordInput}
        value={password.value}
        isValid={password.isCorrect}
        placeholder="Пароль"
        isFocused={password.isFocused}
        errorMsg="Пароль не вірний"
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
    </form>
  );
};

export default LoginForm;

const validateEmail = (email: string) => {
  return !!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
};
