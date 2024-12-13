import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  year: Number,
  cover: String,
  rating: Number,
  genres: [String],
});
const Book = mongoose.model('Book', bookSchema);
export { Book };
