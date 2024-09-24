const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class PlanPayment extends Model {
  static associate(models) {
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
  }
}
PlanPayment.init(
  {
    id_plan_payment: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_fans: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    total: {
      type: DataTypes.INTEGER(20),
      allowNull:false
    },
    created_at: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "PlanPayment",
    tableName: "plan_payment",
  },
);

module.exports = PlanPayment;
