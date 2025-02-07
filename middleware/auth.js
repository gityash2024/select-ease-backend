const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const bearerToken = req.header('Authorization');
    
    if (!bearerToken) {
      return res.status(401).json({ message: 'Please Login to continue' });
    }

    const token = bearerToken.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Please Login to continue' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please Login to continue' });
  }
};