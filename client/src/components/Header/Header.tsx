import './header.css';

import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <h1>
        <NavLink to="/">uLib</NavLink>
      </h1>

      <NavLink to="/allBooks">Всі книги</NavLink>
      <NavLink to="/addBookForm">Додати книгу</NavLink>
      <NavLink to="">Мої списки</NavLink>
    </header>
  );
}
