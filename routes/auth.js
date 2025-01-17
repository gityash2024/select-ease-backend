const express = require('express');
const router = express.Router();
const RegistrationsController = require('../controllers/registrationsController');

// Auth routes
router.post('/signup', RegistrationsController.signup);
router.post('/login', RegistrationsController.login);

module.exports = router; 