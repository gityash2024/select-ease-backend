// migrations/YYYYMMDDHHMMSS-add-rating-to-products.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column exists first to avoid errors
    const tableInfo = await queryInterface.describeTable('product');
    
    if (!tableInfo.rating) {
      return queryInterface.addColumn('product', 'rating', {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('product', 'rating');
  }
};