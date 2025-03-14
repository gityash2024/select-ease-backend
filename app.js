require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const db = require('./models');
const path = require('path');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','https://select-ease-8fqv.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api', routes);

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

const sequelize = require('./config/database');
sequelize.options.logging = console.log;

db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
}).catch((err) => {
  console.log("Failed to sync database:", err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});