import express from 'express';
import { Author } from '../models/Author';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.search as string;
    let authors;
    if (searchQuery) {
      authors = await Author.find({
        name: { $regex: searchQuery, $options: 'i' },
      }).select('_id name');
    } else {
      authors = await Author.find();
    }
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні авторів' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const newAuthor = new Author(req.body);
    const createdAuthor = await newAuthor.save();
    res.status(200).json(createdAuthor);
  } catch (error) {
    res.status(500).json({ message: 'Не вдалося додати автора', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const authorId = req.params.id;
  try {
    const author = await Author.findById(authorId);
    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні автора' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const authorId = req.params.id;
  try {
    const author = await Author.findById(authorId);
    if (!author) {
      res.status(404).json({ message: 'Автора не знайдено' });
      return;
    }

    if (author && author.books.length > 0) {
      res
        .status(400)
        .json({ message: 'Не можна видалити автора, у якого є книги' });
      return;
    }

    await Author.findByIdAndDelete(authorId);

    res.status(200).json({ message: 'Автора успішно видалено' });
  } catch (error) {
    console.error('Помилка при видаленні автора:', error);
    res.status(500).json({ message: 'Виникла помилка на сервері' });
  }
});

export default router;
