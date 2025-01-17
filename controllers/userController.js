const { User } = require('../models');

const UserController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email'], // Exclude sensitive data like password
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        message: 'Users retrieved successfully',
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = UserController; 