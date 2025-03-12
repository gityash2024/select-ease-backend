const { Review, Product, User } = require('../models');

exports.createReview = async (req, res) => {
  try {
    const product = await Product.findByPk(req.body.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviewData = {
      product_id: req.body.productId,
      rating: req.body.rating,
      // Support both field names for flexibility
      description: req.body.description || req.body.comment,
      title: req.body.title || '',
      user_id: req.user.id // Access user ID directly 
    };
    
    const review = await Review.create(reviewData);
    
    // Return newly created review with user info
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    return res.status(201).json(reviewWithUser);
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          required: false
        },
        {
          model: User,
          as: 'user',
          required: false
        }
      ]
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
          as: 'product'
        },
        {
          model: User,
          as: 'user'
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
    await review.update(req.body);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.dataValues.id;
    
    const reviews = await Review.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          required: false
        }
      ]
    });

    if (!reviews.length) {
      return res.status(200).json({ message: 'No reviews found for this user', reviews: [] });
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 