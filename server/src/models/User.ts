import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },

  ratedBooks: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      rating: { type: Number, default: null },
    },
  ],

  readBooks: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      dateAdded: { type: Date, default: Date.now },
    },
  ],
  plannedBooks: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      dateAdded: { type: Date, default: Date.now },
    },
  ],
  currentlyReadingBooks: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      dateAdded: { type: Date, default: Date.now },
    },
  ],
  abandonedBooks: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      dateAdded: { type: Date, default: Date.now },
    },
  ],

  favoriteAuthors: [
    {
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true,
      },
      dateAdded: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model('User', userSchema);
export { User };
