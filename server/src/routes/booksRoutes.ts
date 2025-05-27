import express from 'express';
import { query, body, validationResult } from 'express-validator';
import { Book } from '../models/Book';
import { Author } from '../models/Author';
import { User } from '../models/User';
import { Comment } from '../models/Comment';
import { Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

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

    const { sort, order, author, search } = req.query;

    try {
      const filter: any = {};

      if (author) filter.author = author;

      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [{ title: searchRegex }];
      }

      const books = await Book.find(filter)
        .populate('author', '_id name country')
        .sort({ [sort as string]: order === 'asc' ? 1 : -1 });

      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Щось пішло не так при отриманні книг. Спробуйте ще раз.',
      });
    }
  }
);

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
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const firebaseUid = req.user?.uid;
    const { sort, order, author, search, list } = req.query;

    try {
      const filter: any = {};
      let user: any = null;
      let userBookIds: string[] = [];

      if (firebaseUid) {
        user = await User.findOne({ firebaseUid });

        if (!user) {
          res.status(404).json({ error: 'Користувач не знайдений' });
          return;
        }

        if (list && typeof list === 'string') {
          const ids = getUserBookIdsFromList(user, list);

          if (!ids) {
            res.status(400).json({ error: 'Невалідний список' });
            return;
          }

          userBookIds = ids;
          filter._id = { $in: userBookIds };
        }
      }

      if (author) filter.author = author;

      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [{ title: searchRegex }];
      }

      const books = await Book.find(filter)
        .populate('author', '_id name country')
        .sort({ [sort as string]: order === 'asc' ? 1 : -1 });

      // Додаємо дані користувача до книг
      const booksWithUserData = books.map((book) => {
        if (!user) return book;

        const bookId = book._id.toString();

        const userLists = [
          { name: 'readBooks', list: user.readBooks },
          { name: 'currentlyReadingBooks', list: user.currentlyReadingBooks },
          { name: 'plannedBooks', list: user.plannedBooks },
          { name: 'abandonedBooks', list: user.abandonedBooks },
        ];

        const lists = userLists
          .filter(({ list }) =>
            list.some((b: any) => b.bookId.toString() === bookId)
          )
          .map(({ name }) => name);

        const rating =
          user.ratedBooks.find((b: any) => b.bookId.toString() === bookId)
            ?.rating || null;

        return {
          ...book.toObject(),
          userData: {
            lists,
            rating,
          },
        };
      });

      res.json(booksWithUserData);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Щось пішло не так при отриманні книг. Спробуйте ще раз.',
      });
    }
  }
);

router.get('/public/:id', async (req: Request, res: Response) => {
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId).populate('author');
    if (!book) {
      res.status(404).json({ message: 'Книга не знайдена.' });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({
      error: 'Щось пішло не так при отриманні книги. Спробуйте ще раз.',
    });
  }
});

router.get(
  '/authorized/:id',
  verifyToken,
  async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      res
        .status(403)
        .json({ message: 'Заборонено: тільки для зареєстрованих' });
      return;
    }

    const bookId = req.params.id;
    try {
      const book = await Book.findById(bookId).populate('author');
      if (!book) {
        res.status(404).json({ message: 'Книга не знайдена.' });
        return;
      }

      const userLists = [
        { name: 'readBooks', list: user.readBooks },
        { name: 'currentlyReadingBooks', list: user.currentlyReadingBooks },
        { name: 'plannedBooks', list: user.plannedBooks },
        { name: 'abandonedBooks', list: user.abandonedBooks },
      ];

      const lists = userLists
        .filter(({ list }) =>
          list.some((b: any) => b.bookId.toString() === bookId)
        )
        .map(({ name }) => name);

      const rating =
        user.ratedBooks.find((b: any) => b.bookId.toString() === bookId)
          ?.rating || null;

      const plainBook = book.toObject();

      res.status(200).json({
        ...plainBook,
        userData: {
          lists,
          rating,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Щось пішло не так при отриманні книги. Спробуйте ще раз.',
      });
    }
  }
);

const validateBookData = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Назва книги обовʼязкова')
    .isLength({ max: 100 })
    .withMessage('Назва занадто довга'),

  body('author')
    .notEmpty()
    .withMessage('Автор обовʼязковий')
    .isMongoId()
    .withMessage('Невалідний ID автора'),

  body('year')
    .optional({ checkFalsy: true })
    .isInt({ max: new Date().getFullYear() })
    .withMessage('Рік має бути не більше поточного')
    .toInt(),

  body('cover').optional({ checkFalsy: true }).isString().trim(),
];

router.post(
  '/add',
  verifyToken,
  validateBookData,
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

    if (typeof req.body.genres === 'string') {
      req.body.genres = JSON.parse(req.body.genres);
    }

    try {
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
      res.status(500).json({
        message: 'Щось пішло не так при додаванні книги. Спробуйте ще раз.',
        error,
      });
    }
  }
);

router.put(
  '/edit/:id',
  verifyToken,
  validateBookData,
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
      if (typeof req.body.genres === 'string') {
        req.body.genres = JSON.parse(req.body.genres);
      }

      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

      if (!updatedBook) {
        res.status(404).json({ message: 'Книгу не знайдено' });
        return;
      }

      res.status(200).json(updatedBook);
    } catch (error) {
      console.error('Помилка при оновленні книги:', error);
      res.status(500).json({
        message: 'Щось пішло не так при оновленні книги. Спробуйте ще раз.',
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

    const bookId = req.params.id;

    try {
      const book = await Book.findById(bookId);
      if (!book) {
        res.status(404).json({ message: 'Книгу не знайдено.' });
        return;
      }
      await Author.findByIdAndUpdate(book.author, {
        $pull: { books: book._id },
      });

      await User.updateMany(
        {},
        {
          $pull: {
            readBooks: { bookId },
            plannedBooks: { bookId },
            currentlyReadingBooks: { bookId },
            abandonedBooks: { bookId },
            ratedBooks: { bookId },
          },
        }
      );
      await Comment.deleteMany({ bookId });
      await Book.findByIdAndDelete(bookId);
      res.status(200).json({ message: 'Книгу успішно видалено.' });
    } catch (error) {
      console.error('Помилка при видаленні книги:', error);
      res.status(500).json({
        message: 'Щось пішло не так при видаленні книги. Спробуйте ще раз.',
      });
    }
  }
);

export default router;

function getUserBookIdsFromList(user: any, list: string): string[] | null {
  const validLists = [
    'readBooks',
    'currentlyReadingBooks',
    'plannedBooks',
    'abandonedBooks',
  ];

  if (list === 'allLists') {
    const allBookIds = [
      ...user.readBooks,
      ...user.currentlyReadingBooks,
      ...user.plannedBooks,
      ...user.abandonedBooks,
    ].map((entry: any) => entry.bookId.toString());

    return [...new Set(allBookIds)];
  }

  if (!validLists.includes(list)) {
    return null;
  }

  return user[list].map((entry: any) => entry.bookId.toString());
}
