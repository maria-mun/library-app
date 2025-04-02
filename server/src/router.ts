import express from 'express';
import authorsRoutes from './routes/authorsRoutes';
import booksRoutes from './routes/booksRoutes';
import authRoutes from './routes/authRoutes';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/books', booksRoutes);

router.use('/authors', authorsRoutes);

export default router;
