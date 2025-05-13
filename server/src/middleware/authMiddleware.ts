import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../firebaseAdmin.json';
import { User } from '../models/User';
import { DecodedIdToken } from 'firebase-admin/auth';

declare module 'express' {
  interface Request {
    user?: DecodedIdToken & { role?: string };
  }
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(serviceAccount as any) });

const auth = getAuth(app);

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    const userInDb = await User.findOne({ firebaseUid: decoded.uid });

    if (!userInDb) {
      res.status(404).json({ error: 'User not found in DB' });
      return;
    }

    req.user = {
      ...decoded,
      role: userInDb.role || 'user',
    };

    next();
  } catch (error) {
    console.error('verifyToken error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
