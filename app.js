require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const db = require('./models');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Detailed HTTP request logging
app.use(morgan('dev'));
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});
// Public auth routes (no auth required)
app.use('/api/auth', authRoutes);

// Auth middleware for protected routes
const auth = require('./middleware/auth');
app.use('/api', (req, res, next) => {
  // Skip auth middleware for /api/auth routes
  if (req.path.startsWith('/auth/')) {
    return next();
  }
  return auth(req, res, next);
});

// Protected routes
app.use('/api', routes);

// Enhanced error handling with detailed logs
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({ 
    error: err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Enable Sequelize logging
const sequelize = require('./config/database');
sequelize.options.logging = console.log;

// Sync database
db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
}).catch((err) => {
  console.log("Failed to sync database:", err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`); // Or any message you prefer
});; 