import { Request, Response, Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { User } from '../models/User';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post(
  '/register',
  [
    body('firebaseUid').isString().notEmpty().trim().escape(),
    body('name').isString().isLength({ min: 2 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firebaseUid, name, email } = req.body;

    try {
      const newUser = new User({ firebaseUid, name, email });
      await newUser.save();
      res.status(201).json({ message: 'Користувач створений', user: newUser });
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  }
);

router.get(
  '/user-exists',
  [
    query('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Невалідна email адреса'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.query;

    try {
      const user = await User.findOne({ email });
      res.json({ exists: !!user });
    } catch (error) {
      console.error('Помилка при перевірці email:', error);
      res.status(500).json({ exists: false, message: 'Помилка сервера' });
    }
  }
);

export default router;
