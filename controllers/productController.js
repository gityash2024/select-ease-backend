const { Product, Category, Review, User } = require('../models');
const { cloudinary } = require('../src/utils/cloudinary');
const { Op } = require('sequelize');

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
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category_id: req.body.category_id,
        status: req.user.is_admin ? 'published' : 'pending',
        user_id: req.user.id
      };

      const product = await Product.create(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      min_price,
      max_price,
      status,
      search
    } = req.query;

    const whereCondition = {
      status: 'published'
    };

    if (search) {
      whereCondition.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (req.user && status && ['published', 'pending', 'denied'].includes(status)) {
      if (req.user.is_vendor && !req.user.is_admin) {
        whereCondition.user_id = req.user.id;
        whereCondition.status = status;
      } 
      else if (req.user.is_admin) {
        whereCondition.status = status;
      }
    }

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
      attributes: ['id', 'name', 'description', 'price', 'status', 'created_at', 'updated_at', 'category_id', 'user_id'],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    const productsWithRating = products.rows.map(product => {
      const productObj = product.get({ plain: true });
      
      if (productObj.reviews && productObj.reviews.length > 0) {
        const totalRating = productObj.reviews.reduce((sum, review) => sum + review.rating, 0);
        productObj.rating = (totalRating / productObj.reviews.length).toFixed(1);
      } else {
        productObj.rating = 0;
      }

      return productObj;
    });

    res.json({
      total: products.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(products.count / parseInt(limit)),
      products: productsWithRating
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
        attributes: ['id', 'name', 'description', 'price', 'status', 'created_at', 'updated_at', 'category_id', 'user_id'],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          }
        ],
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

exports.getProductById = async (req, res) => {
  try {
    const whereCondition = req.user && req.user.is_admin
      ? { id: req.params.id }
      : { id: req.params.id, status: 'published' };

    const product = await Product.findOne({
      where: whereCondition,
      attributes: ['id', 'name', 'description', 'price', 'status', 'created_at', 'updated_at', 'category_id', 'user_id'],
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const productObj = product.get({ plain: true });
    if (productObj.reviews && productObj.reviews.length > 0) {
      const totalRating = productObj.reviews.reduce((sum, review) => sum + review.rating, 0);
      productObj.averageRating = (totalRating / productObj.reviews.length).toFixed(1);
    } else {
      productObj.averageRating = 0;
    }
    
    res.json(productObj);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = [
  checkRole(['vendor', 'admin']),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (!req.user.is_admin && product.user_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your own products' });
      }

      const updateData = {};
      
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.price !== undefined) updateData.price = req.body.price;
      if (req.body.category_id !== undefined) updateData.category_id = req.body.category_id;

      if (!req.user.is_admin) {
        updateData.status = 'pending';
      }
  
      await product.update(updateData);
      res.json(product);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(400).json({ error: error.message });
    }
  }
];

exports.adminUpdateProduct = [
  checkRole(['admin']),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updateData = {};
      
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.price !== undefined) updateData.price = req.body.price;
      if (req.body.category_id !== undefined) updateData.category_id = req.body.category_id;
      if (req.body.status !== undefined) updateData.status = req.body.status;

      await product.update(updateData);
      res.json(product);
    } catch (error) {
      console.error('Admin update product error:', error);
      res.status(500).json({ error: error.message });
    }
  }
];

exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
};

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
      console.error('Review product error:', error);
      res.status(500).json({ error: error.message });
    }
  }
];

exports.compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 product IDs required for comparison' });
    }
    
    if (productIds.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 products can be compared at once' });
    }
    
    const products = await Product.findAll({
      where: {
        id: productIds,
        status: 'published'
      },
      attributes: ['id', 'name', 'description', 'price', 'status', 'created_at', 'updated_at', 'category_id', 'user_id'],
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating'],
          required: false
        }
      ]
    });
    
    if (products.length < 2) {
      return res.status(404).json({ message: 'Not enough products found for comparison' });
    }
    
    const productsWithRating = products.map(product => {
      const productObj = product.get({ plain: true });
      if (productObj.reviews && productObj.reviews.length > 0) {
        const totalRating = productObj.reviews.reduce((sum, review) => sum + review.rating, 0);
        productObj.averageRating = (totalRating / productObj.reviews.length).toFixed(1);
      } else {
        productObj.averageRating = 0;
      }
      return productObj;
    });
    
    res.json(productsWithRating);
  } catch (error) {
    console.error('Compare products error:', error);
    res.status(500).json({ error: error.message });
  }
};