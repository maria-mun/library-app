import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRouter from './router';

const app = express();
dotenv.config();
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

app.use('/api', apiRouter);

mongoose.connect('mongodb://localhost/library_app_DB').then(() => {
  console.log(`connected to db and listening on port ${process.env.PORT}`);
  app.listen(process.env.PORT);
});
