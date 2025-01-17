const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RegistrationsController = {
  signup: async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        is_vendor = false,  // Optional, defaults to false
        is_admin = true    // Optional, defaults to false
      } = req.body;

      // Create user with additional fields
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        is_vendor,
        is_admin
      });

      // Generate token with full user details
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          is_vendor: user.is_vendor,
          is_admin: user.is_admin
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          is_vendor: user.is_vendor,
          is_admin: user.is_admin
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      // Check if user exists
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token with full user details
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          is_vendor: user.is_vendor,
          is_admin: user.is_admin
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          is_vendor: user.is_vendor,
          is_admin: user.is_admin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  },
};

module.exports = RegistrationsController; 