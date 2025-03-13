'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('product');
    
    // Array of columns to check and add if missing
    const columnsToAdd = [
      {
        name: 'rating',
        definition: {
          type: Sequelize.DECIMAL(3, 2),
          defaultValue: 0,
          allowNull: true
        }
      },
      {
        name: 'url',
        definition: {
          type: Sequelize.STRING,
          allowNull: true
        }
      },
      {
        name: 'logo',
        definition: {
          type: Sequelize.STRING,
          allowNull: true
        }
      },
      {
        name: 'features',
        definition: {
          type: Sequelize.JSON,
          allowNull: true
        }
      },
      {
        name: 'in_stock',
        definition: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: true
        }
      }
    ];

    // Add each missing column
    for (const column of columnsToAdd) {
      if (!tableInfo[column.name]) {
        await queryInterface.addColumn('product', column.name, column.definition);
        console.log(`Added ${column.name} column to product table`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columnsToRemove = ['rating', 'url', 'logo', 'features', 'in_stock'];
    
    for (const column of columnsToRemove) {
      await queryInterface.removeColumn('product', column);
    }
  }
};