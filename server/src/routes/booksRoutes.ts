import express from 'express';
import { Book } from '../models/Book';
import { Author } from '../models/Author';
import { User } from '../models/User';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const {
    sort = 'title',
    order = 'asc',
    author,
    search,
    firebaseUid,
    list, // новий параметр
  } = req.query;

  try {
    const filter: any = {};
    let user: any = null;
    let userBookIds: string[] = [];

    // Якщо є користувач
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });

      if (!user) {
        res.status(404).json({ error: 'Користувач не знайдений' });
        return;
      }

      if (list && typeof list === 'string') {
        const ids = getUserBookIdsFromList(user, list);

        if (!ids) {
          res.status(400).json({ error: 'Невалідний список' });
          return;
        }

        userBookIds = ids;
        filter._id = { $in: userBookIds };
      }
    }

    // Додаємо фільтр по автору якщо є
    if (author) filter.author = author;

    // Пошук по назві
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [{ title: searchRegex }];
    }

    // Тепер шукаємо книги
    const books = await Book.find(filter)
      .populate('author', '_id name country')
      .sort({ [sort as string]: order === 'asc' ? 1 : -1 });

    // Додаємо дані користувача до книг
    const booksWithUserData = books.map((book) => {
      if (!user) return book;

      const bookId = book._id.toString();
      const lists = [];

      if (user.readBooks.some((b: any) => b.bookId.toString() === bookId)) {
        lists.push('readBooks');
      }
      if (
        user.currentlyReadingBooks.some(
          (b: any) => b.bookId.toString() === bookId
        )
      ) {
        lists.push('currentlyReadingBooks');
      }
      if (user.plannedBooks.some((b: any) => b.bookId.toString() === bookId)) {
        lists.push('plannedBooks');
      }
      if (
        user.abandonedBooks.some((b: any) => b.bookId.toString() === bookId)
      ) {
        lists.push('abandonedBooks');
      }

      const ratingEntry = user.ratedBooks.find(
        (b: any) => b.bookId.toString() === bookId
      );
      const rating = ratingEntry ? ratingEntry.rating : null;

      return {
        ...book.toObject(),
        userData: {
          lists,
          rating,
        },
      };
    });

    res.json(booksWithUserData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при отриманні книг' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    if (typeof req.body.genres === 'string') {
      req.body.genres = JSON.parse(req.body.genres);
    }
    const newBook = new Book(req.body);
    const createdBook = await newBook.save();

    const authorId = req.body.author;
    await Author.updateOne(
      { _id: authorId },
      { $push: { books: createdBook._id } }
    );

    res.status(200).json(createdBook);
  } catch (error) {
    console.error('Помилка при додаванні книги:', error);
    res.status(500).json({ message: 'Не вдалося додати книгу', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({ message: 'Книга не знайдена' });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при отриманні книги' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const bookId = req.params.id;
  try {
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      res.status(404).json({ message: 'Книга не знайдена' });
      return;
    }

    res.status(200).json({ message: 'Книга успішно видалена' });
  } catch (error) {
    console.error('Помилка при видаленні книги:', error);
    res.status(500).json({ message: 'Виникла помилка на сервері' });
  }
});

export default router;

function getUserBookIdsFromList(user: any, list: string): string[] | null {
  const validLists = [
    'readBooks',
    'currentlyReadingBooks',
    'plannedBooks',
    'abandonedBooks',
  ];

  if (list === 'allLists') {
    const allBookIds = [
      ...user.readBooks,
      ...user.currentlyReadingBooks,
      ...user.plannedBooks,
      ...user.abandonedBooks,
    ].map((entry: any) => entry.bookId.toString());

    return [...new Set(allBookIds)];
  }

  if (!validLists.includes(list)) {
    return null;
  }

  return user[list].map((entry: any) => entry.bookId.toString());
}
