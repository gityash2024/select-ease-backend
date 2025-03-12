const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Review extends Model {}

  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
      },
      // Add title field for reviews
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // For backward compatibility
      description: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.comment;
        },
        set(value) {
          this.setDataValue('comment', value);
        }
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'user',
          key: 'id',
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'product',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      freezeTableName: true,
      underscored: true,
      modelName: 'review',
    }
  );

  return Review;
}; 