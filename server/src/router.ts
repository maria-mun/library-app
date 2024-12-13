import express from 'express';
import authorsRoutes from './routes/authorsRoutes';
import booksRoutes from './routes/booksRoutes';

const router = express.Router();

router.use('/books', booksRoutes);

router.use('/authors', authorsRoutes);

export default router;
