import styles from './profile-menu.module.css';
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import ArrowIcon from '../Icons/ArrowIcon';
import AccountIcon from '../Icons/AccountIcon';
import LogoutIcon from '../Icons/LogoutIcon';

interface ProfileProps {
  user: User;
  logoutUser: () => void;
}

export default function ProfileMenu({ user, logoutUser }: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    logoutUser();
    navigate('/allBooks');
  };

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
        <div className={styles.displayName}>{user.displayName}</div>
        <span className={styles['arrow-icon']}>
          <ArrowIcon isOpen={isOpen} />
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.displayName}>{user.displayName}</div>
          <NavLink
            to="/myProfile"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            Профіль
          </NavLink>
          <NavLink
            to="/myAuthors"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            Улюблені автори
          </NavLink>
          <NavLink
            to="/myBooks"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            Мої списки книг
          </NavLink>
          <hr />
          <NavLink
            to="/addBookForm"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            <span className={styles['add-icon']}>+</span>
            <p>Додати книгу до бази даних</p>
          </NavLink>
          <NavLink
            to="/addAuthorForm"
            className={styles['menu-option']}
            onClick={() => setIsOpen(false)}
          >
            <span className={styles['add-icon']}>+</span>
            <p>Додати автора до бази даних</p>
          </NavLink>{' '}
          <button
            onClick={handleLogout}
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
