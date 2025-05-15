import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Root from './pages/Root/Root';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import AllBooks from './pages/AllBooks/AllBooks';
import Home from './pages/Home/Home';
import AddBookForm from './pages/AddBook/AddBook';
import AddAuthorForm from './pages/AddAuthor/AddAuthor';
import BookDetail from './pages/BookDetail/BookDetail';
import AllAuthors from './pages/AllAuthors/AllAuthors';
import AuthorDetail from './pages/AuthorDetail/AuthorDetail';
import './main.css';
import RegisterForm from './pages/RegisterForm/RegisterForm';
import LoginForm from './pages/LoginForm/LoginForm';
import MyLists from './pages/MyLists/MyLists';
import EditBookForm from './pages/EditBook/EditBookForm';
import EditAuthorForm from './pages/EditAuthor/EditAuthorForm';

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
      {
        path: '/myLists',
        element: <MyLists />,
      },
    ],
  },
  {
    path: '/addBookForm',
    element: <AddBookForm />,
  },
  {
    path: '/addAuthorForm',
    element: <AddAuthorForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/editBookForm/:bookId',
    element: <EditBookForm />,
  },
  {
    path: '/editAuthorForm/:authorId',
    element: <EditAuthorForm />,
  },
  {
    path: '/error',
    element: <ErrorPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
