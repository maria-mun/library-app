import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  description: String,
  photo: String,
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

const Author = mongoose.model('Author', authorSchema);

export { Author };
