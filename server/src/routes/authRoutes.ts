import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import {
  verifyToken,
  decodeTokenOnly,
  deleteFirebaseUser,
  updateFirebaseName,
  updateFirebaseEmail,
} from '../middleware/authMiddleware';

const router = Router();

router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid }).select(
      '_id role ratedBooks readBooks plannedBooks currentlyReadingBooks abandonedBooks favoriteAuthors'
    );

    if (!user) {
      res
        .status(404)
        .json({ message: 'Користувача не знайдено у базі даних.' });
      return;
    }

    const counts = {
      ratedBooks: user.ratedBooks.length,
      readBooks: user.readBooks.length,
      plannedBooks: user.plannedBooks.length,
      currentlyReadingBooks: user.currentlyReadingBooks.length,
      abandonedBooks: user.abandonedBooks.length,
      favoriteAuthors: user.favoriteAuthors.length,
    };

    res.json({ userId: user._id, role: user.role, counts });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Щось пішло не так на сервері. Спробуйте ще раз.' });
  }
});

router.post(
  '/register',
  decodeTokenOnly,
  [
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 30 })
      .withMessage('Ім’я обовʼязкове і має бути до 30 символів'),
    body('email').isEmail().withMessage('Некоректна email адреса'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const firebaseUid = req.user?.uid;
    const { name, email } = req.body;
    try {
      const newUser = new User({
        firebaseUid: firebaseUid,
        name,
        email,
      });

      await newUser.save();

      res.status(201).json({ message: 'Користувач створений', user: newUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Щось пішло не так на сервері. Спробуйте ще раз.' });
    }
  }
);

router.delete('/deleteMe', verifyToken, async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;

    if (uid) await deleteFirebaseUser(uid);

    const deleted = await User.findOneAndDelete({ firebaseUid: uid });

    if (!deleted) {
      res.status(404).json({ message: 'Користувача в Mongo не знайдено' });
      return;
    }

    res.status(200).json({ message: 'Профіль успішно видалено' });
  } catch (err) {
    console.error('Помилка при видаленні профілю:', err);
    res.status(500).json({ message: 'Не вдалося видалити профіль' });
  }
});

router.put(
  '/updateName',
  verifyToken,
  [
    body('newName')
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 30 })
      .withMessage('Ім’я обовʼязкове і має бути до 30 символів'),
  ],

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const uid = req.user?.uid;
    const { newName } = req.body;
    try {
      if (uid) await updateFirebaseName(uid, newName);

      const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { name: newName },
        { new: true }
      );

      if (!user) {
        res.status(404).json({ message: 'Користувача не знайдено' });
        return;
      }
      res.status(200).json({ message: 'Ім’я оновлено', user });
    } catch (err) {
      console.error('Помилка оновлення імені:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  }
);

router.put(
  '/updateEmail',
  verifyToken,
  [
    body('newEmail')
      .isEmail()
      .withMessage('Некоректна електронна адреса')
      .normalizeEmail(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const uid = req.user?.uid;
    const { newEmail } = req.body;

    try {
      if (uid) {
        await updateFirebaseEmail(uid, newEmail);
      }

      const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { email: newEmail },
        { new: true }
      );

      if (!user) {
        res.status(404).json({ message: 'Користувача не знайдено' });
        return;
      }

      res.status(200).json({ message: 'Електронну адресу оновлено', user });
    } catch (err) {
      console.error('Помилка оновлення email:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  }
);

export default router;
