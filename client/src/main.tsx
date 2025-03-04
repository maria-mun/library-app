import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './routes/Root/Root';
import AllBooks from './routes/AllBooks/AllBooks';
import Home from './routes/Home/Home';
import AddBookForm, { action as addBookAction } from './routes/AddBook/AddBook';
import AddAuthorForm, {
  action as addAuthorAction,
} from './routes/AddAuthor/AddAuthor';
import BookDetail from './routes/BookDetail/BookDetail';
import AllAuthors from './routes/AllAuthors/AllAuthors';
import AuthorDetail from './routes/AuthorDetail/AuthorDetail';
import './main.css';

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
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
