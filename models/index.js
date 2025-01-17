const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import model definitions
const defineProduct = require('./product');
const defineCategory = require('./category');
const defineReview = require('./review');
const defineUser = require('./user');

// Initialize models
const Product = defineProduct(sequelize);
const Category = defineCategory(sequelize);
const Review = defineReview(sequelize);
const User = defineUser(sequelize);

// Define associations
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Product.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Product, {
  foreignKey: 'user_id',
  as: 'products'
});

Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

Product.hasMany(Review, {
  foreignKey: 'product_id',
  as: 'reviews',
  onDelete: 'CASCADE'
});

Review.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Review.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Review, {
  foreignKey: 'user_id',
  as: 'reviews',
  onDelete: 'CASCADE'
});

module.exports = {
  Product,
  Category,
  Review,
  User,
  sequelize,
  Sequelize
};
