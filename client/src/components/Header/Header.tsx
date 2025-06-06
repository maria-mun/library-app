import styles from './header.module.css';
import { useAuth } from '../../AuthContext';
import { NavLink } from 'react-router-dom';
import ProfileMenu from '../ProfileMenu/ProfileMenu';

export default function Header() {
  const { user, logoutUser } = useAuth();

  return (
    <header className={styles.header}>
      <h1>
        <NavLink to="/" className={styles.link}>
          uLib
        </NavLink>
      </h1>
      <div className={styles.nav}>
        <NavLink to="/allBooks" className={styles.link}>
          Книги
        </NavLink>
        <NavLink to="/allAuthors" className={styles.link}>
          Автори
        </NavLink>

        {user ? (
          <ProfileMenu user={user} logoutUser={logoutUser} />
        ) : (
          <div className={styles['login-buttons']}>
            <NavLink
              to="/register"
              state={{ from: location.pathname }}
              className={styles.button + ' ' + styles['register-btn']}
            >
              Реєстрація
            </NavLink>
            <NavLink
              to="/login"
              state={{ from: location.pathname }}
              className={styles.button + ' ' + styles['login-btn']}
            >
              Вхід
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
