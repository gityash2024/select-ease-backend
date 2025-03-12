'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, check if the existing columns are present
    const tableInfo = await queryInterface.describeTable('blog');
    
    // Add new columns
    const operations = [];
    
    if (!tableInfo.title) {
      operations.push(
        queryInterface.addColumn('blog', 'title', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      );
    }
    
    if (!tableInfo.summary) {
      operations.push(
        queryInterface.addColumn('blog', 'summary', {
          type: Sequelize.TEXT,
          allowNull: true,
        })
      );
    }
    
    if (!tableInfo.author) {
      operations.push(
        queryInterface.addColumn('blog', 'author', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      );
    }
    
    if (!tableInfo.image_url) {
      operations.push(
        queryInterface.addColumn('blog', 'image_url', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      );
    }
    
    if (!tableInfo.content && tableInfo.text) {
      operations.push(
        queryInterface.addColumn('blog', 'content', {
          type: Sequelize.TEXT,
          allowNull: true,
        })
      );
    }
    
    // Execute all column additions
    if (operations.length > 0) {
      await Promise.all(operations);
    }
    
    // If heading exists and title was just created, copy data from heading to title
    if (tableInfo.heading && !tableInfo.title_migrated) {
      await queryInterface.sequelize.query(`
        UPDATE blog 
        SET title = heading 
        WHERE title IS NULL
      `);
    }
    
    // If text exists and content was just created, copy data from text to content
    if (tableInfo.text && !tableInfo.content_migrated) {
      await queryInterface.sequelize.query(`
        UPDATE blog 
        SET content = text 
        WHERE content IS NULL
      `);
    }
    
    // Add a flag column to track if migration has been performed
    if (!tableInfo.title_migrated) {
      await queryInterface.addColumn('blog', 'title_migrated', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
    
    if (!tableInfo.content_migrated) {
      await queryInterface.addColumn('blog', 'content_migrated', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns added in the up function
    const tableInfo = await queryInterface.describeTable('blog');
    const operations = [];
    
    if (tableInfo.title) {
      operations.push(queryInterface.removeColumn('blog', 'title'));
    }
    
    if (tableInfo.summary) {
      operations.push(queryInterface.removeColumn('blog', 'summary'));
    }
    
    if (tableInfo.author) {
      operations.push(queryInterface.removeColumn('blog', 'author'));
    }
    
    if (tableInfo.image_url) {
      operations.push(queryInterface.removeColumn('blog', 'image_url'));
    }
    
    if (tableInfo.content) {
      operations.push(queryInterface.removeColumn('blog', 'content'));
    }
    
    if (tableInfo.title_migrated) {
      operations.push(queryInterface.removeColumn('blog', 'title_migrated'));
    }
    
    if (tableInfo.content_migrated) {
      operations.push(queryInterface.removeColumn('blog', 'content_migrated'));
    }
    
    if (operations.length > 0) {
      await Promise.all(operations);
    }
  }
};