import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Root from './pages/Root/Root';
import AllBooks from './pages/AllBooks/AllBooks';
import Home from './pages/Home/Home';
import AddBookForm, { action as addBookAction } from './pages/AddBook/AddBook';
import AddAuthorForm, {
  action as addAuthorAction,
} from './pages/AddAuthor/AddAuthor';
import BookDetail from './pages/BookDetail/BookDetail';
import AllAuthors from './pages/AllAuthors/AllAuthors';
import AuthorDetail from './pages/AuthorDetail/AuthorDetail';
import './main.css';
import RegisterForm from './pages/RegisterForm/RegisterForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      {
        path: '/allBooks',
        element: <AllBooks />,
      },
      {
        path: '/book/:id',
        element: <BookDetail />,
      },
      {
        path: '/allAuthors',
        element: <AllAuthors />,
      },
      {
        path: '/author/:id',
        element: <AuthorDetail />,
      },
    ],
  },
  {
    path: '/addBookForm',
    element: <AddBookForm />,
    action: addBookAction,
  },
  {
    path: '/addAuthorForm',
    element: <AddAuthorForm />,
    action: addAuthorAction,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
