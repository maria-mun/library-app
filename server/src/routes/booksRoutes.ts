import express from 'express';
import { Book } from '../models/Book';
import { Author } from '../models/Author';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const books = await Book.find().populate('author', '_id name country');
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні книг' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    if (typeof req.body.genres === 'string') {
      req.body.genres = JSON.parse(req.body.genres); // Перетворюємо рядок у масив
    }
    const newBook = new Book(req.body);
    const createdBook = await newBook.save();

    const authorId = req.body.author;
    await Author.updateOne(
      { _id: authorId },
      { $push: { books: createdBook._id } }
    );

    res.status(200).json(createdBook);
  } catch (error) {
    console.error('Помилка при додаванні книги:', error);
    res.status(500).json({ message: 'Не вдалося додати книгу', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні книги' });
  }
});

export default router;
