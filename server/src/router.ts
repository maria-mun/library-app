import express from 'express';
import authorsRoutes from './routes/authorsRoutes';
import booksRoutes from './routes/booksRoutes';
import authRoutes from './routes/authRoutes';
import commentsRoutes from './routes/commentsRoutes';
import { router as userRoutes } from './routes/userRoutes';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/books', booksRoutes);

router.use('/authors', authorsRoutes);

router.use('/users', userRoutes);

router.use('/comments', commentsRoutes);

export default router;
