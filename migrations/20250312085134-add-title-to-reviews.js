'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add title column to review table
    await queryInterface.addColumn('review', 'title', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Check if review table still has 'description' column, and rename it to 'comment' if it exists
    const tableInfo = await queryInterface.describeTable('review');
    if (tableInfo.description && !tableInfo.comment) {
      await queryInterface.renameColumn('review', 'description', 'comment');
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove title column from review table
    await queryInterface.removeColumn('review', 'title');
    
    // Restore original column name if needed
    const tableInfo = await queryInterface.describeTable('review');
    if (tableInfo.comment && !tableInfo.description) {
      await queryInterface.renameColumn('review', 'comment', 'description');
    }
  }
};
