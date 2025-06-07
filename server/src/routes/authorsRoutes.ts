3;
import express from 'express';
import { Author } from '../models/Author';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { query, body, validationResult } from 'express-validator';
import { fstat } from 'fs';

const router = express.Router();

router.get(
  '/authorized',
  verifyToken,
  [
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Максимальна довжина пошукового запиту — 100 символів.'),
    query('favoriteList').optional().isBoolean().toBoolean(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const firebaseUid = req.user?.uid;
    const { searchQuery, favoriteList } = req.query;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const filter: any = {};

      //отримуємо ід улюблених авторів користувача
      let favAuthorIds: string[] = [];

      if (firebaseUid) {
        const user = await User.findOne({ firebaseUid });

        if (user) {
          favAuthorIds = user.favoriteAuthors.map((item) =>
            item.authorId.toString()
          );
        }
      }

      // Якщо запит на улюблені автори, додаємо фільтр
      if (favoriteList) {
        filter._id = { $in: favAuthorIds };
      }

      if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: 'i' };
      }

      const authors = await Author.find(filter)
        .select('_id name country description photo')
        .skip(offset)
        .limit(limit);

      const authorIds = authors.map((a) => a._id);

      // Отримуємо кількість книг на кожного автора
      const bookCounts = await Book.aggregate([
        { $match: { author: { $in: authorIds } } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ]);

      const bookCountMap = new Map(
        bookCounts.map((item) => [item._id.toString(), item.count])
      );

      const result = authors.map((author) => {
        const authorObj = author.toObject();
        const idStr = author._id.toString();
        return {
          ...authorObj,
          isFavorite: favoriteList ? true : favAuthorIds.includes(idStr),
          hasBooks: bookCountMap.has(idStr),
        };
      });

      const totalCount = await Author.countDocuments(filter);

      res.json({ data: result, totalCount });
    } catch (error) {
      console.error('Помилка при отриманні авторів:', error);
      res.status(500).json({
        error: 'Щось пішло не так при отриманні авторів. Спробуйте ще раз.',
      });
    }
  }
);

router.get(
  '/public',
  [
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Максимальна довжина пошукового запиту — 100 символів.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const searchQuery = req.query.search;

      const filter: any = {};

      if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: 'i' };
      }

      const authors = await Author.find(filter)
        .select('_id name country description photo')
        .skip(offset)
        .limit(limit);

      const totalCount = await Author.countDocuments(filter);

      res.json({ data: authors, totalCount });
    } catch (error) {
      res.status(500).json({
        error: 'Щось пішло не так при отриманні авторів. Спробуйте ще раз.',
      });
    }
  }
);

router.get('/public/:id', async (req: Request, res: Response) => {
  const authorId = req.params.id;
  try {
    const author = await Author.findById(authorId);
    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({
      message: 'Щось пішло не так при отриманні автора. Спробуйте ще раз.',
    });
  }
});

router.get(
  '/authorized/:id',
  verifyToken,
  async (req: Request, res: Response) => {
    const authorId = req.params.id;
    const firebaseUid = req.user?.uid;

    try {
      const author = await Author.findById(authorId).lean();

      if (!author) {
        res.status(404).json({ message: 'Автор не знайдений.' });
        return;
      }

      let isFavorite = false;

      if (firebaseUid) {
        const user = await User.findOne({ firebaseUid });

        if (user) {
          isFavorite = user.favoriteAuthors.some(
            (item) => item.authorId.toString() === authorId
          );
        }
      }

      // Перевірка наявності книг
      const hasBooks = await Book.exists({ author: authorId });

      res.status(200).json({
        ...author,
        isFavorite,
        hasBooks: Boolean(hasBooks),
      });
    } catch (error) {
      console.error('Помилка при отриманні автора:', error);
      res.status(500).json({
        error: 'Щось пішло не так при отриманні автора. Спробуйте ще раз.',
      });
    }
  }
);

const authorValidation = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Ім'я обов'язкове")
    .isLength({ max: 100 })
    .withMessage("Ім'я має бути не довше 100 символів"),

  body('country')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Назва країни має бути не довше 50 символів'),

  body('description')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Опис має бути не довше 1000 символів'),
  body('photo').optional({ checkFalsy: true }).isString().trim(),
];

router.post(
  '/add',
  verifyToken,
  authorValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res.status(403).json({
        message: 'Заборонено: тільки для зареєстрованих користувачів',
      });
      return;
    }

    try {
      const newAuthor = new Author(req.body);
      const createdAuthor = await newAuthor.save();
      res.status(200).json(createdAuthor);
    } catch (error) {
      res.status(500).json({
        message: 'Щось пішло не так при додаванні автора. Спробуйте ще раз.',
        error,
      });
    }
  }
);

router.put(
  '/edit/:id',
  verifyToken,
  authorValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res.status(403).json({
        message: 'Заборонено: тільки для зареєстрованих користувачів',
      });
      return;
    }

    try {
      const updated = await Author.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!updated) {
        res.status(404).json({ message: 'Автор не знайдений' });
        return;
      }

      res.status(200).json(updated);
    } catch (error) {
      console.error('Помилка при оновленні автора:', error);
      res.status(500).json({
        message: 'Щось пішло не так при оновленні автора. Спробуйте ще раз.',
      });
    }
  }
);

router.delete(
  '/delete/:id',
  verifyToken,
  async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Заборонено: тільки для адмінів' });
      return;
    }

    const authorId = req.params.id;
    try {
      const author = await Author.findById(authorId);
      if (!author) {
        res.status(404).json({ message: 'Автора не знайдено.' });
        return;
      }

      if (author && author.books.length > 0) {
        res.status(400).json({
          message: 'Не можна видалити автора, у якого є хоча б одна книга.',
        });
        return;
      }

      await Author.findByIdAndDelete(authorId);

      res.status(200).json({ message: 'Автора успішно видалено.' });
    } catch (error) {
      console.error('Помилка при видаленні автора:', error);
      res.status(500).json({
        message: 'Щось пішло не так при видаленні автора. Спробуйте ще раз.',
      });
    }
  }
);

export default router;
