'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add image_url column to product table
    await queryInterface.addColumn('product', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Add logo column to product table
    await queryInterface.addColumn('product', 'logo', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Add url column to product table
    await queryInterface.addColumn('product', 'url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Add rating column to product table
    await queryInterface.addColumn('product', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      defaultValue: 0,
      allowNull: true
    });
    
    // Add features column to product table
    await queryInterface.addColumn('product', 'features', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    // Add in_stock column to product table
    await queryInterface.addColumn('product', 'in_stock', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns if migration needs to be reverted
    await queryInterface.removeColumn('product', 'image_url');
    await queryInterface.removeColumn('product', 'logo');
    await queryInterface.removeColumn('product', 'url');
    await queryInterface.removeColumn('product', 'rating');
    await queryInterface.removeColumn('product', 'features');
    await queryInterface.removeColumn('product', 'in_stock');
  }
};