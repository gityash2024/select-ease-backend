// migrations/20250514123456-update-products.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns exist before adding
    const tableInfo = await queryInterface.describeTable('products');
    const columns = [];
    
    if (!tableInfo.image_url) {
      columns.push(queryInterface.addColumn('products', 'image_url', {
        type: Sequelize.STRING,
        allowNull: true
      }));
    }
    
    if (!tableInfo.features) {
      columns.push(queryInterface.addColumn('products', 'features', {
        type: Sequelize.JSON,
        allowNull: true
      }));
    }

    if (!tableInfo.in_stock) {
      columns.push(queryInterface.addColumn('products', 'in_stock', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }));
    }
    
    // Execute all column additions
    if (columns.length > 0) {
      return Promise.all(columns);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('products');
    const columns = [];
    
    if (tableInfo.image_url) {
      columns.push(queryInterface.removeColumn('products', 'image_url'));
    }
    
    if (tableInfo.features) {
      columns.push(queryInterface.removeColumn('products', 'features'));
    }

    if (tableInfo.in_stock) {
      columns.push(queryInterface.removeColumn('products', 'in_stock'));
    }
    
    if (columns.length > 0) {
      return Promise.all(columns);
    }
  }
};