const Sequelize = require("sequelize");
require("dotenv").config();
const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
    timezone: process.env.DB_TIMEZONE,
  },
);

module.exports = {
  initDB: () => {
    return db.authenticate();
  },
  getDB: () => {
    return db;
  },
};
