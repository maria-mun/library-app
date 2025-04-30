import styles from './header.module.css';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { User } from 'firebase/auth';

interface ProfileProps {
  user: User;
  logoutUser: () => void;
}

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
      {user && (
        <>
          <NavLink to="/addBookForm" className={styles.link}>
            Додати книгу
          </NavLink>
          <NavLink to="/addAuthorForm" className={styles.link}>
            Додати автора
          </NavLink>
        </>
      )}

      {user ? (
        <ProfileMenu user={user} logoutUser={logoutUser} />
      ) : (
        <div className={styles['login-buttons']}>
          <NavLink
            to="/register"
            className={styles.button + ' ' + styles['register-btn']}
          >
            Реєстрація
          </NavLink>
          <NavLink
            to="/login"
            className={styles.button + ' ' + styles['login-btn']}
          >
            Вхід
          </NavLink>
        </div>
      )}
    </header>
  );
}

function ProfileMenu({ user, logoutUser }: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.profileMenu} ref={dropdownRef}>
      <div
        className={styles.profile}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <AccountIcon />
        {user.displayName}
        <ArrowIcon isOpen={isOpen} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <NavLink
            to="/profile"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            Профіль
          </NavLink>
          <NavLink
            to="/myRatings"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            Мої оцінки
          </NavLink>
          <NavLink
            to="/myLists"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            Мої списки
          </NavLink>
          <hr />
          <button
            onClick={logoutUser}
            className={styles['logout-btn'] + ' ' + styles['menu-option']}
          >
            <LogoutIcon />
            Вийти
          </button>
        </div>
      )}
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg
      className={styles['logout-icon']}
      fill="currentColor"
      width="1.1em"
      viewBox="0 0 32 32"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      transform="matrix(-1, 0, 0, 1, 0, 0)"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {' '}
        <path d="M3.651 16.989h17.326c0.553 0 1-0.448 1-1s-0.447-1-1-1h-17.264l3.617-3.617c0.391-0.39 0.391-1.024 0-1.414s-1.024-0.39-1.414 0l-5.907 6.062 5.907 6.063c0.196 0.195 0.451 0.293 0.707 0.293s0.511-0.098 0.707-0.293c0.391-0.39 0.391-1.023 0-1.414zM29.989 0h-17c-1.105 0-2 0.895-2 2v9h2.013v-7.78c0-0.668 0.542-1.21 1.21-1.21h14.523c0.669 0 1.21 0.542 1.21 1.21l0.032 25.572c0 0.668-0.541 1.21-1.21 1.21h-14.553c-0.668 0-1.21-0.542-1.21-1.21v-7.824l-2.013 0.003v9.030c0 1.105 0.895 2 2 2h16.999c1.105 0 2.001-0.895 2.001-2v-28c-0-1.105-0.896-2-2-2z"></path>{' '}
      </g>
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      className={styles['account-icon']}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      height="1.5em"
      fill="currentColor"
    >
      <path d="M 45 0 C 20.147 0 0 20.147 0 45 c 0 24.853 20.147 45 45 45 s 45 -20.147 45 -45 C 90 20.147 69.853 0 45 0 z M 45 22.007 c 8.899 0 16.14 7.241 16.14 16.14 c 0 8.9 -7.241 16.14 -16.14 16.14 c -8.9 0 -16.14 -7.24 -16.14 -16.14 C 28.86 29.248 36.1 22.007 45 22.007 z M 45 83.843 c -11.135 0 -21.123 -4.885 -27.957 -12.623 c 3.177 -5.75 8.144 -10.476 14.05 -13.341 c 2.009 -0.974 4.354 -0.958 6.435 0.041 c 2.343 1.126 4.857 1.696 7.473 1.696 c 2.615 0 5.13 -0.571 7.473 -1.696 c 2.083 -1 4.428 -1.015 6.435 -0.041 c 5.906 2.864 10.872 7.591 14.049 13.341 C 66.123 78.957 56.135 83.843 45 83.843 z" />
    </svg>
  );
}

function ArrowIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 123.958 123.959"
      transform={`rotate(${isOpen ? 270 : 90})`}
      width="0.7em"
      fill="currentColor"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <path d="M38.217,1.779c-3.8-3.8-10.2-1.1-10.2,4.2v112c0,5.3,6.4,8,10.2,4.2l56-56c2.3-2.301,2.3-6.101,0-8.401L38.217,1.779z"></path>{' '}
        </g>
      </g>
    </svg>
  );
}
