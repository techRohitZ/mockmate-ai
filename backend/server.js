import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import interviewRoutes from './routes/interview.js';
import practiceRoutes from './routes/practice.js';
import dashboardRoutes from './routes/dashboard.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDir, '.env') });

const STARTUP_TIME = new Date().toISOString();
console.log(`[${STARTUP_TIME}] Server starting...`);

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate-ai';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Continue without database for development
  }
};

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', interviewRoutes);
app.use('/api', practiceRoutes);
app.use('/api', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: process.env.PORT || 5000 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});