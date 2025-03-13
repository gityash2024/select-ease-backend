// migrations/20250514123457-update-reviews.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('review');
    const columns = [];
    
    if (!tableInfo.pros) {
      columns.push(queryInterface.addColumn('review', 'pros', {
        type: Sequelize.TEXT,
        allowNull: true
      }));
    }
    
    if (!tableInfo.cons) {
      columns.push(queryInterface.addColumn('review', 'cons', {
        type: Sequelize.TEXT,
        allowNull: true
      }));
    }
    
    if (!tableInfo.recommendation) {
      columns.push(queryInterface.addColumn('review', 'recommendation', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }));
    }
    
    // Execute all column additions
    if (columns.length > 0) {
      return Promise.all(columns);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('review');
    const columns = [];
    
    if (tableInfo.pros) {
      columns.push(queryInterface.removeColumn('review', 'pros'));
    }
    
    if (tableInfo.cons) {
      columns.push(queryInterface.removeColumn('review', 'cons'));
    }
    
    if (tableInfo.recommendation) {
      columns.push(queryInterface.removeColumn('review', 'recommendation'));
    }
    
    if (columns.length > 0) {
      return Promise.all(columns);
    }
  }
};