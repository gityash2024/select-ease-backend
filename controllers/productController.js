const { Product, Category, Review, User } = require('../models');

// Middleware to check user roles
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRequiredRole = requiredRoles.some(role => {
      switch (role) {
        case 'vendor': return user.is_vendor;
        case 'admin': return user.is_admin;
        case 'user': return !user.is_vendor && !user.is_admin;
        default: return false;
      }
    });

    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

exports.createProduct = [
  checkRole(['vendor', 'admin']),
  async (req, res) => {
    try {
      // Ensure vendor_id is set to the current user's ID
      req.body.user_id = req.user_id;

      // If admin creates a product, set it as published
      if (req.user.is_admin) {
        req.body.status = 'published';
      } else {
        // Vendor products need admin approval
        req.body.status = 'pending';
      }

      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getAllProducts = async (req, res) => {
  try {
    // Query parameters for filtering and pagination
    const {
      page = 1,
      limit = 10,
      category_id,
      min_price,
      max_price
    } = req.query;

    // Build where clause
    const whereCondition = {
      status: 'published' // Only show published products
    };

    // Optional filters
    if (category_id) {
      whereCondition.category_id = category_id;
    }

    if (min_price || max_price) {
      whereCondition.price = {};
      if (min_price) whereCondition.price[Op.gte] = min_price;
      if (max_price) whereCondition.price[Op.lte] = max_price;
    }

    const products = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
      attributes: {
        exclude: ['user_id']
      }
    });

    res.json({
      total: products.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(products.count / limit),
      products: products.rows
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.adminGetAllProducts = [
  checkRole(['admin']),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const products = await Product.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        totalItems: products.count,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(products.count / limit),
        hasMore: page * limit < products.count,
        products: products.rows
      });
    } catch (error) {
      console.error('Admin get all products error:', error);
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getProductById = [
  checkRole(['user', 'vendor', 'admin']),
  async (req, res) => {
    try {
      const whereCondition = req.user.is_admin
        ? { id: req.params.id }
        : { id: req.params.id, status: 'published' };

      const product = await Product.findOne({
        where: whereCondition,
        include: [
          {
            model: Category,
            as: 'category'
          },
          {
            model: Review,
            as: 'reviews',
            required: false
          }
        ]
      });

      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.updateProduct = [
  checkRole(['vendor', 'admin']),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      // vendor can update any products but not status
      req.body.status = 'pending';
  
      await product.update(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];

exports.deleteProduct = [
  checkRole(['vendor', 'admin']),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Vendors can only delete their own products
      // Admins can delete any product
      if (product.vendor_id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'You can only delete your own products' });
      }

      await product.destroy();
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// New method for admin to publish or deny products
exports.reviewProduct = [
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['published', 'denied'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      await product.update({ status });
      res.json({
        message: `Product ${status === 'published' ? 'published' : 'denied'}`,
        product
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
