const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user details
    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ['password']
      }
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user.toJSON(); // Convert to plain object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please Login to continue' });
  }
};

module.exports = auth;
