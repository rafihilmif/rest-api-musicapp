const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Fans extends Model {
  static associate(models) {
    this.hasOne(models.Subscription, { foreignKey: "id_fans" });
    this.hasOne(models.Subscription, { foreignKey: "email" });
    
    this.hasMany(models.Order, { foreignKey: "id_fans" });
  }
}
Fans.init(
  {
    id_fans: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    birth: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(13),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE(),
    },
    status: {
      type: DataTypes.NUMBER(2),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Fans",
    tableName: "fans",
  },
);

module.exports = Fans;
