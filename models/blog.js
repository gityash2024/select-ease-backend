const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Blog extends Model {
    static associate(models) {
      Blog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Blog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      // New fields
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Old fields for backward compatibility
      heading: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
      },
      // Migration tracking
      title_migrated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      content_migrated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      }
    },
    {
      sequelize,
      timestamps: true,
      freezeTableName: true,
      underscored: true,
      modelName: 'blog',
      hooks: {
        beforeCreate: (blog) => {
          // Ensure compatibility between old and new field names
          if (!blog.title && blog.heading) {
            blog.title = blog.heading;
          }
          if (!blog.heading && blog.title) {
            blog.heading = blog.title;
          }
          if (!blog.content && blog.text) {
            blog.content = blog.text;
          }
          if (!blog.text && blog.content) {
            blog.text = blog.content;
          }
        },
        beforeUpdate: (blog) => {
          // Ensure compatibility between old and new field names
          if (blog.changed('title') && !blog.changed('heading')) {
            blog.heading = blog.title;
          }
          if (blog.changed('heading') && !blog.changed('title')) {
            blog.title = blog.heading;
          }
          if (blog.changed('content') && !blog.changed('text')) {
            blog.text = blog.content;
          }
          if (blog.changed('text') && !blog.changed('content')) {
            blog.content = blog.text;
          }
        }
      }
    }
  );

  return Blog;
};