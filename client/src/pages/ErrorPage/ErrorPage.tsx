import styles from './error-page.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { code = 500, message = 'Щось пішло не так' } = location.state || {};

  return (
    <div className={styles['error-container']}>
      <h1>Помилка {code}</h1>
      <h3>{message}</h3>
      <p onClick={() => navigate(-1)}>Повернутися</p>
    </div>
  );
}
