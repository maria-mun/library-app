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
    const update = {
      $addToSet: {
        [list]: { bookId },
      },
    };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Book added to list', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:userId/rating', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { bookId, rating } = req.body;

  // Перевірка рейтингу
  if (!bookId || typeof rating !== 'number' || rating < 1 || rating > 10) {
    res.status(400).json({ error: 'Invalid bookId or rating' });
    return;
  }

  try {
    const user = await User.findById(userId);

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

router.get('/:userId/books/:list', async (req: Request, res: Response) => {
  const { userId, list } = req.params;

  if (!allowedLists.includes(list)) {
    res.status(400).json({ error: 'Invalid list type' });
    return;
  }

  try {
    const user = await User.findById(userId)
      .populate({ path: `${list}.bookId` })
      .exec();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ books: (user as any)[list] });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
    return;
  }
});

export { router };
