import express from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Book } from './models/Book';

const app = express();
dotenv.config();
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  res.send('<a href="/books">My books</a>');
});

app.get('/books', async (req: Request, res: Response) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні книг' });
  }
});

app.post('/books', async (req: Request, res: Response) => {
  const newBook = new Book(req.body);
  const createdBook = await newBook.save();
  res.status(200).json(createdBook);
});

app.get('/books/:id', async (req: Request, res: Response) => {
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні книги' });
  }
});

mongoose.connect('mongodb://localhost/library_app_DB').then(() => {
  console.log(`connected to db and listening on port ${process.env.PORT}`);
  app.listen(process.env.PORT);
});
