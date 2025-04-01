import styles from './header.module.css';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

export default function Header() {
  const { user, logoutUser } = useAuth();
  return (
    <header className={styles.header}>
      <h1>
        <NavLink to="/" className={styles.link}>
          uLib
        </NavLink>
      </h1>

      <NavLink to="/allBooks" className={styles.link}>
        Книги
      </NavLink>
      <NavLink to="/allAuthors" className={styles.link}>
        Автори
      </NavLink>
      <NavLink to="/addBookForm" className={styles.link}>
        Додати книгу
      </NavLink>
      <NavLink to="/addAuthorForm" className={styles.link}>
        Додати автора
      </NavLink>
      <NavLink to="" className={styles.link}>
        Мої списки
      </NavLink>

      {user ? (
        <div>
          {user.displayName}
          <button className={styles.button1} onClick={logoutUser}>
            Вийти
          </button>
        </div>
      ) : (
        <NavLink to="/register" className={styles.button1}>
          Реєстрація
        </NavLink>
      )}
    </header>
  );
}
