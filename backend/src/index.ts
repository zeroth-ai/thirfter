import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import shopRoutes from './routes/shops';
import exploreRoutes from './routes/explore';
import favoritesRoutes from './routes/favorites';
import searchRoutes from './routes/search';
import haulsRoutes from './routes/hauls';
import alertsRoutes from './routes/alerts';
import tripsRoutes from './routes/trips';
import challengesRoutes from './routes/challenges';
import tradesRoutes from './routes/trades';
import tipsRoutes from './routes/tips';
import styleboardsRoutes from './routes/styleboards';
import statsRoutes from './routes/stats';
import activityRoutes from './routes/activity';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blr-thrifter';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'BLR Thrifter Backend',
    status: 'healthy',
    version: '2.0.0',
    features: [
      'Authentication',
      'Shop Discovery',
      'Haul Social Feed',
      'Price Alerts',
      'Group Trips',
      'Challenges',
      'Trade/Sell',
      'Store Tips',
      'Style Boards',
      'Budget Tracker',
      'Impact Dashboard',
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/search', searchRoutes);

// New feature routes
app.use('/api/hauls', haulsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/styleboards', styleboardsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/activity', activityRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BLR Thrifter Backend running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
});

export default app;
