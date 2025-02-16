const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const registrationsController = require('../controllers/registrationsController');
const auth = require('../middleware/auth');
const UserController = require('../controllers/userController');

// Public authentication routes
router.post('/signup', registrationsController.signup);
router.post('/login', registrationsController.login);

// Protected Category routes
router.post('/categories', auth, categoryController.createCategory);
router.get('/categories', auth, categoryController.getAllCategories);
router.get('/categories/:id', auth, categoryController.getCategoryById);
router.put('/categories/:id', auth, categoryController.updateCategory);
router.delete('/categories/:id', auth, categoryController.deleteCategory);

// Protected Product routes
router.get('/admin/products', auth, productController.adminGetAllProducts);  // Move this BEFORE other product routes
router.post('/products', auth, productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/:id', auth, productController.getProductById);
router.put('/products/:id', auth, productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Protected Review routes
router.post('/reviews', auth, reviewController.createReview);
router.get('/reviews', auth, reviewController.getAllReviews);
router.get('/reviews/:id', auth, reviewController.getReviewById);
router.put('/reviews/:id', auth, reviewController.updateReview);
router.delete('/reviews/:id', auth, reviewController.deleteReview);
router.get('/user_reviews/:userId?',auth, reviewController.getReviewsByUser);


// User routes
router.get('/users', auth, UserController.getAllUsers);

module.exports = router; 