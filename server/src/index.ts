import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRouter from './router';

// Визначаємо який env файл підключати
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

const uri = process.env.MONGO_URI || 'mongodb://localhost/library_app_DB';
const port = process.env.PORT || 4000;

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', apiRouter);

mongoose.connect(uri).then(() => {
  console.log(`connected to db (${nodeEnv}) and listening on port ${port}`);
  app.listen(port);
});
