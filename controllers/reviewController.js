const { Review, Product, User } = require('../models');

exports.createReview = async (req, res) => {
  try {
    const product = await Product.findByPk(req.body.productId || req.body.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Standardize field names
    const reviewData = {
      product_id: req.body.productId || req.body.product_id,
      rating: req.body.rating,
      title: req.body.title || '',
      comment: req.body.comment || req.body.description || '',
      user_id: req.user.id
    };
    
    // Add optional fields only if they exist in the model
    if (req.body.pros) reviewData.pros = req.body.pros;
    if (req.body.cons) reviewData.cons = req.body.cons;
    if (req.body.recommendation !== undefined) reviewData.recommendation = req.body.recommendation;
    
    const review = await Review.create(reviewData);
    
    // Return newly created review with user info
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Update product rating
    await updateProductRating(product.id);
    
    return res.status(201).json(reviewWithUser);
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: productId }
    });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Don't try to update a column that doesn't exist
      console.log(`Average rating for product ${productId}: ${averageRating.toFixed(2)}`);
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { productId } = req.query;
    
    const whereCondition = {};
    if (productId) {
      whereCondition.product_id = productId;
    }
    
    const reviews = await Review.findAll({
      where: whereCondition,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'price', 'status'],
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'price', 'status']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        }
      ]
    });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    // Check if the review belongs to the user
    if (review.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }
    
    const updateData = {};
    
    // Only include fields that exist in the actual model
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.comment !== undefined || req.body.description !== undefined) {
      updateData.comment = req.body.comment || req.body.description;
    }
    if (req.body.pros !== undefined) updateData.pros = req.body.pros;
    if (req.body.cons !== undefined) updateData.cons = req.body.cons;
    if (req.body.recommendation !== undefined) updateData.recommendation = req.body.recommendation;
    
    await review.update(updateData);
    
    // Update product rating
    await updateProductRating(review.product_id);
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const reviews = await Review.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'price', 'status'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (!reviews.length) {
      return res.status(200).json({ message: 'No reviews found for this user', reviews: [] });
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    // Check if the review belongs to the user or if user is admin
    if (review.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    
    const productId = review.product_id;
    
    await review.destroy();
    
    // Update product rating
    await updateProductRating(productId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};