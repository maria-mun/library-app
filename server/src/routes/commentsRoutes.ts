import { User } from '../models/User';
import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { query, body, validationResult } from 'express-validator';
import { Book } from '../models/Book';
import { Comment } from '../models/Comment';

const router = express.Router();

router.get('/book/:bookId', async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const sort = req.query.sort === 'oldest' ? 1 : -1; // newest by default

  try {
    const bookExists = await Book.exists({ _id: bookId });
    if (!bookExists) {
      res.status(404).json({ message: 'Книга не знайдена.' });
      return;
    }

    const comments = await Comment.find({ bookId })
      .populate({
        path: 'userId',
        select: 'name',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: sort });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка при отриманні коментарів.' });
  }
});

router.post(
  '/add',
  verifyToken,
  body('text').trim().isLength({ min: 1, max: 1000 }).escape(),
  body('bookId').isMongoId(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const uid = req.user?.uid;

      const user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        res.status(404).json({ message: 'Користувача не знайдено.' });
        return;
      }

      const { bookId, text } = req.body;
      const book = await Book.findById(bookId);
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      const comment = new Comment({
        userId: user._id,
        bookId,
        text,
      });

      await comment.save();

      res.status(201).json({ message: 'Коментар додано.', comment });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: 'Виникла помилка на сервері. Спробуйте ще раз' });
    }
  }
);

router.delete(
  '/delete/:id',
  verifyToken,
  async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    try {
      const user = await User.findOne({ firebaseUid });
      if (!user) {
        res.status(403).json({ message: 'Доступ заборонено.' });
        return;
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        res.status(404).json({ message: 'Коментар не знайдено.' });
        return;
      }

      const isOwner = comment.userId.toString() === user._id.toString();
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        res
          .status(403)
          .json({ message: 'Ви не можете видалити цей коментар.' });
        return;
      }

      await Comment.findByIdAndDelete(comment._id);
      res.status(200).json({ message: 'Коментар успішно видалено.' });
    } catch (error) {
      console.error('Помилка при видаленні коментаря:', error);
      res
        .status(500)
        .json({ message: 'Помилка сервера при видаленні коментаря.' });
    }
  }
);

export default router;
