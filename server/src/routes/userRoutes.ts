import { User } from '../models/User';

import express, { Request, Response } from 'express';

const router = express.Router();

const allowedLists = [
  'readBooks',
  'plannedBooks',
  'currentlyReadingBooks',
  'abandonedBooks',
];

router.post('/:userId/books/:list', async (req: Request, res: Response) => {
  const { userId, list } = req.params;
  const { bookId } = req.body;

  if (!allowedLists.includes(list)) {
    res.status(400).json({ error: 'Invalid list type' });
    return;
  }

  try {
    const user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const listData = user[list as keyof typeof user] as { bookId: string }[];
    const isInList = listData.some((item) => item.bookId.toString() === bookId);

    let updatedUser;
    if (isInList) {
      // Видаляємо
      updatedUser = await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $pull: { [list]: { bookId } } },
        { new: true }
      );
      res.json({ message: 'Book removed from list', user: updatedUser });
      return;
    } else {
      // Додаємо
      updatedUser = await User.findOneAndUpdate(
        { firebaseUid: userId },
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
});

router.post('/:userId/rating', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { bookId, rating } = req.body;

  if (!bookId || typeof rating !== 'number' || rating < 1 || rating > 10) {
    res.status(400).json({ error: 'Invalid bookId or rating' });
    return;
  }

  try {
    const user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const existing = user.ratedBooks.find(
      (entry) => entry.bookId.toString() === bookId
    );

    if (existing) {
      // оновити рейтинг
      existing.rating = rating;
    } else {
      // додати нову оцінку
      user.ratedBooks.push({ bookId, rating });
    }

    await user.save();
    res.json({ message: 'Rating saved' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
    return;
  }
});

export { router };
