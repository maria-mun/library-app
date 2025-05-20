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
  genres: [String],
  averageRating: { type: Number, default: null },
  ratingsCount: { type: Number, default: 0 },
});
const Book = mongoose.model('Book', bookSchema);
export { Book };
