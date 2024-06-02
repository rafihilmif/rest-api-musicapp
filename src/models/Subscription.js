const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Subscription extends Model {
  static associate(models) {
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
    this.belongsTo(models.Fans, { foreignKey: "email_fans" });
    this.belongsTo(models.Plan, { foreignKey: "plan_name" });
  }
}
Subscription.init(
  {
    id_subscription: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_fans: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email_fans: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    exp_date: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    plan_name: {
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
    modelName: "Subscription",
    tableName: "subscription",
  },
);

module.exports = Subscription;
