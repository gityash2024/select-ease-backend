const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  // List of routes that don't require authentication
  const publicRoutes = [
    '/products',  // GET all products
    '/login',     // Login route
    '/signup'     // Signup route
  ];

  // Check if the current route is a public route
  if (publicRoutes.includes(req.path) && req.method === 'GET') {
    return next();
  }

  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Please Login to continue' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Please Login to continue' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please Login to continue' });
  }
};
