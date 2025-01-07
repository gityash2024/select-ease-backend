require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Detailed HTTP request logging
app.use(morgan('dev'));
app.use(express.json());

// Routes
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 