const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import model definitions
const defineProduct = require('./product');
const defineCategory = require('./category');
const defineReview = require('./review');
const defineUser = require('./user');
const defineBlog = require('./blog');

// Initialize models
const Product = defineProduct(sequelize);
const Category = defineCategory(sequelize);
const Review = defineReview(sequelize);
const User = defineUser(sequelize);
const Blog = defineBlog(sequelize);

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

User.hasMany(Blog, {
  foreignKey: 'user_id',
  as: 'blogs',
  onDelete: 'CASCADE'
});

Blog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  Product,
  Category,
  Review,
  User,
  Blog,
  sequelize,
  Sequelize
};
