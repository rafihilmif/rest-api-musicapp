const Sequelize = require("sequelize");
const db = new Sequelize(
  "musicapp", // DB_NAME
  "root", // DB_USER
  "", // DB_PASSWORD
  {
    host: "127.0.0.1",
    port: 3306,
    dialect: "mysql",
    logging: console.log,
    timezone: "+07:00",
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
