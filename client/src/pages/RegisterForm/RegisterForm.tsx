import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import styles from './register-form.module.css';
import Input from '../../components/Input/Input';

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

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  function handleDisplayNameInput(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setDisplayName({
      isFocused: true,
      value: newValue,
      isValid: newValue.length > 0,
    });
  }

  function handleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setEmail({
      isTaken: false,
      isFocused: true,
      value: newValue,
      isValid: validateEmail(newValue),
    });
  }

  function handlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword({
      isFocused: true,
      value: e.target.value,
      isValid: e.target.value.length >= 6,
    });
  }

  function handleConfirmPasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword({
      isFocused: true,
      value: e.target.value,
      isValid: e.target.value === password.value,
    });
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

      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка при додаванні користувача до бази даних');
      }
      setSuccessMessage(`Користувач ${user.displayName} зареєстрований!`);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const error = err as { code: string };
      if (error.code === 'auth/email-already-in-use') {
        setEmail((prev) => ({ ...prev, isTaken: true }));
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
    <form className={styles.container}>
      <h1>Реєстрація</h1>
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
        type="password"
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
        type="password"
        label="Підтвердіть пароль"
        onChange={handleConfirmPasswordInput}
        isValid={confirmPassword.isValid}
        isFocused={confirmPassword.isFocused}
        placeholder="Підтвердіть пароль"
        value={confirmPassword.value}
        errorMsg="Паролі не збігаються!"
      />

      <button
        className={styles.btn}
        onClick={handleSubmit}
        disabled={!formIsValid || loading}
      >
        {loading ? <span className={styles.spinner}></span> : 'Зареєструватися'}
      </button>
    </form>
  );
};

export default RegisterForm;

const validateEmail = (email: string) => {
  return !!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
};
