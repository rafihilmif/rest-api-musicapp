const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class OrderItem extends Model {
  static associate(models) {
    // this.hasMany(models.Merch, { foreignKey: "name" });
  }
}
OrderItem.init(
  {
    id_order_item: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_order: {
      type: DataTypes.STRING(255),
      allowNull: false,
        },
     id_merchandise: {
      type: DataTypes.STRING(255),
      allowNull: false,
        },
     size: {
      type: DataTypes.STRING(2),
      allowNull: false,
        },
     qty: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
        },
     price: {
      type: DataTypes.INTEGER(13),
      allowNull: false,
        },
    created_at: {
      type: DataTypes.DATE(),
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "OrderItem",
    tableName: "orders_item",
  },
);

module.exports = CartItem;
