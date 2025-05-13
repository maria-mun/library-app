import { User } from '../models/User';
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
        res.json({ message: 'Book removed from list', user: updatedUser });
        return;
      } else {
        updatedUser = await User.findOneAndUpdate(
          { firebaseUid: firebaseUid },
          { $addToSet: { [list]: { bookId } } },
          { new: true }
        );
        res.json({ message: 'Book added to list', user: updatedUser });
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
      return;
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
      // оновити рейтинг
      user.ratedBooks[existingIndex].rating = rating;
    } else {
      // додати нову оцінку
      user.ratedBooks.push({ bookId, rating });
    }

    await user.save();
    res.json({ message: 'Rating processed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router };
