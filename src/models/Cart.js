const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Cart extends Model {
  static associate(models) {
    this.hasOne(models.CartItem, { foreignKey: "id_cart" });
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
  }
}
Cart.init(
  {
    id_cart: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_fans: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE(),
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Cart",
    tableName: "cart",
  },
);

module.exports = Cart;
