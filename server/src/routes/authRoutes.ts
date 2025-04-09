import { Request, Response, Router } from 'express';
import { User } from '../models/User';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { firebaseUid, name, email } = req.body;

  try {
    const newUser = new User({ firebaseUid, name, email });
    await newUser.save();

    res.status(201).json({ message: 'Користувач створений', user: newUser });
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.get('/user-exists', async (req: Request, res: Response) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Помилка при перевірці email:', error);
    res.status(500).json({ exists: false, message: 'Помилка сервера' });
  }
});

export default router;
