const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Order extends Model {
  static associate(models) {
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
    
  }
}
Order.init(
  {
    id_order: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_fans: {
      type: DataTypes.STRING(255),
      allowNull: false,
        },
    total: {
      type: DataTypes.STRING(10),
      allowNull: false,
        },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
        },
    created_at: {
      type: DataTypes.DATE(),
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Orders",
    tableName: "orders",
  },
);

module.exports = Order;
