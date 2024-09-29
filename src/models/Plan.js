const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Plan extends Model {
  static associate(models) {
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
  }
}
Plan.init(
  {
    id_plan: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_fans: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    start: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    expired: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    limit_listening: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
     status: {
      type: DataTypes.INTEGER(2),
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
