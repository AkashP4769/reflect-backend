// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import serverless from '@hono/node-server'; // or 'serverless-http'
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';
import connectDB from './config/db';
import chapterRoutes from './routes/chapterRoutes';
import entryRoutes from './routes/entryRoutes';
import imageRoutes from './routes/imageRoutes';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
connectDB();

const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

console.log(accessKeyId + " " + secretAccessKey + " " + region);

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!.. DOes it edit now');
});

app.use('/api/users', userRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/images', imageRoutes);

// Start server
//yasss
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

