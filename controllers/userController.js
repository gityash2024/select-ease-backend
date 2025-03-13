const { User, Review } = require('../models');

const UserController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'is_admin', 'is_vendor', 'createdAt'], // Exclude sensitive data like password
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
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if the user exists
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // First, delete all reviews associated with this user
      await Review.destroy({ where: { user_id: id } });
      
      // Then delete the user
      await user.destroy();
      
      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
// Add this to controllers/userController.js

module.exports = UserController; 