'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop the existing foreign key constraint
    await queryInterface.removeConstraint('product', 'product_user_id_fkey');
    
    // Then add the new constraint with the correct table reference
    await queryInterface.addConstraint('product', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'product_user_id_fkey',
      references: {
        table: 'user',  // Use the correct table name that exists in your database
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to the original constraint
    await queryInterface.removeConstraint('product', 'product_user_id_fkey');
    
    await queryInterface.addConstraint('product', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'product_user_id_fkey',
      references: {
        table: 'users',  // This is what you had before
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};