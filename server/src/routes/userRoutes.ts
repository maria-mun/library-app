import { User } from '../models/User';
import { Book } from '../models/Book';
import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

const allowedLists = [
  'readBooks',
  'plannedBooks',
  'currentlyReadingBooks',
  'abandonedBooks',
];

router.post(
  '/books/:list',
  verifyToken,
  async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    const { list } = req.params;
    const { bookId } = req.body;

    if (!allowedLists.includes(list)) {
      res.status(400).json({ error: 'Invalid list type' });
      return;
    }

    try {
      const user = await User.findOne({ firebaseUid: firebaseUid });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const listData = user[list as keyof typeof user] as { bookId: string }[];
      const isInList = listData.some(
        (item) => item.bookId.toString() === bookId
      );

      let updatedUser;
      if (isInList) {
        updatedUser = await User.findOneAndUpdate(
          { firebaseUid: firebaseUid },
          { $pull: { [list]: { bookId } } },
          { new: true }
        );
        res.json({ status: 'removed' });
        return;
      } else {
        updatedUser = await User.findOneAndUpdate(
          { firebaseUid: firebaseUid },
          { $addToSet: { [list]: { bookId } } },
          { new: true }
        );
        res.json({ status: 'added' });
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
  }
);

router.post(
  '/favoriteAuthors',
  verifyToken,
  async (req: Request, res: Response) => {
    const firebaseUid = req.user?.uid;
    const { authorId } = req.body;

    if (!authorId) {
      res.status(400).json({ error: 'authorId є обовʼязковим' });
      return;
    }

    try {
      const user = await User.findOne({ firebaseUid });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isInList = user.favoriteAuthors?.some(
        (item: any) => item.authorId.toString() === authorId
      );

      let updatedUser;

      if (isInList) {
        updatedUser = await User.findOneAndUpdate(
          { firebaseUid },
          { $pull: { favoriteAuthors: { authorId } } },
          { new: true }
        );
        res.json({
          status: 'removed',
          user: updatedUser,
        });
      } else {
        updatedUser = await User.findOneAndUpdate(
          { firebaseUid },
          {
            $addToSet: {
              favoriteAuthors: {
                authorId,
                dateAdded: new Date(),
              },
            },
          },
          { new: true }
        );
        res.json({ status: 'added', user: updatedUser });
      }
    } catch (err) {
      console.error('Помилка при оновленні улюблених авторів:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post('/rating', verifyToken, async (req: Request, res: Response) => {
  const firebaseUid = req.user?.uid;
  const { bookId, rating } = req.body;

  if (
    !bookId ||
    (rating !== null &&
      (typeof rating !== 'number' || rating < 1 || rating > 10))
  ) {
    res.status(400).json({ error: 'Invalid bookId or rating' });
    return;
  }

  try {
    const user = await User.findOne({ firebaseUid: firebaseUid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const existingIndex = user.ratedBooks.findIndex(
      (entry) => entry.bookId.toString() === bookId
    );

    if (rating === null) {
      // видалити оцінку
      if (existingIndex !== -1) {
        user.ratedBooks.splice(existingIndex, 1);
      }
    } else if (existingIndex !== -1) {
      user.ratedBooks[existingIndex].rating = rating;
    } else {
      user.ratedBooks.push({ bookId, rating });
    }

    await user.save();

    //оновлення середньої оцінки книги
    const users = await User.find({ 'ratedBooks.bookId': bookId });
    const ratings = users
      .map((u) => u.ratedBooks.find((rb) => rb.bookId.toString() === bookId))
      .filter(Boolean)
      .map((rb) => rb!.rating);

    const ratingsCount = ratings.length;
    const averageRating =
      ratingsCount > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratingsCount
        : null;

    await Book.findByIdAndUpdate(bookId, {
      averageRating,
      ratingsCount,
    });
    res.json({ message: 'Rating processed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router };
