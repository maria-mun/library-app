import express from 'express';
const app = express();

import dotenv from 'dotenv';
dotenv.config();

import { Request, Response } from 'express';

import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/library_app_DB').then(() => {
  console.log('connected to db and listening on port 3000');
  app.listen(process.env.PORT || 3000);
});
