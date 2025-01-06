const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', rateLimiter);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

module.exports = app;