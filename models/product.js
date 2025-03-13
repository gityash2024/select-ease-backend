// models/product.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      Product.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      Product.hasMany(models.Review, {
        foreignKey: 'product_id',
        as: 'reviews',
        onDelete: 'CASCADE'
      });
    }
    
    // Optional: Add a method to check product status
    isPublished() {
      return this.status === 'published';
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'published', 'denied'),
        allowNull: false,
        defaultValue: 'pending'
      },
      in_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'category',
          key: 'id',
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'user',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      freezeTableName: true,
      underscored: true,
      modelName: 'product',
    }
  );

  return Product;
};