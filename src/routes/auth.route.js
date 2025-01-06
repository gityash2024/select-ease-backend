const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validator');
const { authValidation } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);

module.exports = router;
