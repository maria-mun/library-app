import express from 'express';
import { Author } from '../models/Author';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const authors = await Author.find();
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
    console.error('Помилка при додаванні автора:', error);
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

export default router;
