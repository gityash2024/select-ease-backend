const Product = require('./product');
const Category = require('./category');
const Review = require('./review');

// Define associations
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
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

module.exports = {
  Product,
  Category,
  Review
};
