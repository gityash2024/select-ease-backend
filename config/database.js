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

// URL-encode the password to handle special characters
const password = encodeURIComponent('gDqIz80dzO7AW96bjJRj08S08mRw1ttq');
const connectionString = `postgresql://select_ease_db_user:gDqTr8O4o07AW96bjJRjQ8SQ8w8w1ttq@dpg-cva3lqij1k6c739ef990-a.oregon-postgres.render.com/select_ease_dbaa`;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection on startup
sequelize.authenticate()
  .then(() => console.log('Database connection established successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize; 