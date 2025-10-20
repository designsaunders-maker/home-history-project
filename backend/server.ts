import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/propertyRoutes';
import uploadRoutes from './routes/upload';
import enrichAddressRoutes from './routes/enrichAddress';
import adminEnrichmentRoutes from './routes/adminEnrichment';

const app = express();

// Middleware
app.use(cors({
  origin: ["https://home-history-project.vercel.app", /\.vercel\.app$/],
  credentials: false
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/home-history')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/enrich-address', enrichAddressRoutes);
app.use('/api/admin/enrich', adminEnrichmentRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;