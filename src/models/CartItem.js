const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class CartItem extends Model {
  static associate(models) {
    this.belongsTo(models.Merch, { foreignKey: "id_merchandise" });
  }
}
CartItem.init(
  {
    id_cart_item: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_cart: {
      type: DataTypes.STRING(255),
      allowNull: false,
        },
     id_merchandise: {
      type: DataTypes.STRING(255),
      allowNull: false,
        },
     size: {
      type: DataTypes.STRING(10),
      allowNull: false,
        },
     qty: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
        },
    created_at: {
      type: DataTypes.DATE(),
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "CartItem",
    tableName: "cart_item",
  },
);

module.exports = CartItem;
