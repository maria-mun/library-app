import express from 'express';
import { Author } from '../models/Author';
import { User } from '../models/User';
import { Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { query, body, validationResult } from 'express-validator';

const router = express.Router();

router.get(
  '/authorized',
  verifyToken,
  [
    query('search')
      .optional()
      .trim()
      .escape()
      .isLength({ max: 30 })
      .withMessage('Максимальна довжина пошукового запиту — 30 символів.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const firebaseUid = req.user?.uid;
    const searchQuery = req.query.search;

    try {
      const filter: any = {};

      if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: 'i' };
      }

      const authors = await Author.find(filter);

      let favAuthorIds: string[] = [];

      if (firebaseUid) {
        const user = await User.findOne({ firebaseUid });

        if (user) {
          favAuthorIds = user.favoriteAuthors.map((item) =>
            item.authorId.toString()
          );
        }
      }

      const result = authors.map((author) => {
        const authorObj = author.toObject();
        return {
          ...authorObj,
          isFavorite: favAuthorIds.includes(author._id.toString()),
        };
      });

      res.json(result);
    } catch (error) {
      console.error('Помилка при отриманні авторів:', error);
      res.status(500).json({
        error: 'Щось пішло не так при отриманні авторів. Спробуйте ще раз.',
      });
    }
  }
);

router.get('/public', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.search;
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
    res.status(500).json({
      error: 'Щось пішло не так при отриманні авторів. Спробуйте ще раз.',
    });
  }
});

//зробити окремо public і authorized коли буду робити сторінку для автора
router.get('/:id', async (req: Request, res: Response) => {
  const authorId = req.params.id;
  try {
    const author = await Author.findById(authorId);
    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({
      error: 'Щось пішло не так при отриманні автора. Спробуйте ще раз.',
    });
  }
});

const authorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage("Ім'я обов'язкове")
    .isLength({ max: 100 })
    .withMessage("Ім'я має бути не довше 100 символів")
    .escape(),

  body('country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Назва країни має бути не довше 50 символів')
    .escape(),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Опис має бути не довше 1000 символів')
    .escape(),
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
