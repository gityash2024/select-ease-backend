// routes/index.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const registrationsController = require('../controllers/registrationsController');
const auth = require('../middleware/auth');
const UserController = require('../controllers/userController');
const blogController = require('../controllers/blogController');
const { upload } = require('../src/utils/cloudinary');

// Public authentication routes
router.post('/signup', registrationsController.signup);
router.post('/login', registrationsController.login);

// Protected Category routes
router.post('/categories', auth, categoryController.createCategory);
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.put('/categories/:id', auth, categoryController.updateCategory);
router.delete('/categories/:id', auth, categoryController.deleteCategory);

// Product routes
router.get('/admin/products', productController.adminGetAllProducts);  // Admin-only route
router.post('/products', auth, productController.createProduct);             // Protected - requires auth
router.get('/products', productController.getAllProducts);                   // Public
router.get('/products/:id', productController.getProductById);               // Public
router.put('/products/:id', auth, productController.updateProduct);          // Protected - requires auth
router.delete('/products/:id', auth, productController.deleteProduct);       // Protected - requires auth
router.put('/admin/products/:id', auth, productController.adminUpdateProduct); // Admin-only route
router.post('/products/compare', productController.compareProducts);         // New comparison endpoint

// File upload route with Cloudinary
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  return res.json({ imageUrl: req.file.path });
});

// Protected Review routes
router.post('/reviews', auth, reviewController.createReview);
router.get('/reviews', reviewController.getAllReviews);
router.get('/reviews/:id', reviewController.getReviewById);
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.put('/reviews/:id', auth, reviewController.updateReview);
router.delete('/reviews/:id', auth, reviewController.deleteReview);
router.get('/user_reviews/:userId?', auth, reviewController.getReviewsByUser);

// Protected Blog routes
router.get('/blogs', blogController.getAllBlogs);
router.get('/blogs/:id', blogController.getBlogDetails);
router.post('/blogs', auth, blogController.createBlog);
router.put('/blogs/:id', auth, blogController.updateBlog);
router.delete('/blogs/:id', auth, blogController.deleteBlog);
// Add this with the other User routes
router.delete('/users/:id', auth, UserController.deleteUser);
// User routes
router.get('/users', auth, UserController.getAllUsers);

module.exports = router;