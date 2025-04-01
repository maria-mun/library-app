import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Очікуємо "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Токен не надано' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Невірний або прострочений токен' });
  }
};

export default verifyToken;
