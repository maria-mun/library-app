import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  year: Number,
  cover: String,
  rating: Number,
  genres: [String],
});
const Book = mongoose.model('Book', bookSchema);
export { Book };
