// require('dotenv').config();

// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//     logging: console.log,
//     logQueryParameters: true,
//     benchmark: true,
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//     }
//   }
// );

// module.exports = sequelize; 

require('dotenv').config();

const { Sequelize } = require('sequelize');

// Check if DATABASE_URL is provided (preferred for Render)
if (process.env.DATABASE_URL) {
  // Use the connection string directly with SSL configuration
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
    logQueryParameters: true,
    benchmark: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Important for Render connections
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
  module.exports = sequelize;
} else {
  // Fallback to individual connection parameters
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT,
      logging: console.log,
      logQueryParameters: true,
      benchmark: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Important for Render connections
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  
  module.exports = sequelize;
}