import styles from './header.module.css';

import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>
        <NavLink to="/">uLib</NavLink>
      </h1>

      <NavLink to="/allBooks">Книги</NavLink>
      <NavLink to="/allAuthors">Автори</NavLink>
      <NavLink to="/addBookForm">Додати книгу</NavLink>
      <NavLink to="/addAuthorForm">Додати автора</NavLink>
      <NavLink to="">Мої списки</NavLink>
    </header>
  );
}
