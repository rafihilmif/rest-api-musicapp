const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Plan extends Model {
  static associate(models) {
    this.hasMany(models.Subscription, { foreignKey: "name" });
  }
}
Plan.init(
  {
    id_plan: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Plan",
    tableName: "plan",
  },
);

module.exports = Plan;
