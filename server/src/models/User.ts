import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  readBooks: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      rating: { type: Number, default: null },
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
});

const User = mongoose.model('User', userSchema);
export { User };
