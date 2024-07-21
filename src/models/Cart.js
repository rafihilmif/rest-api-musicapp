const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Cart extends Model {
  static associate(models) {
    // this.hasMany(models.Merch, { foreignKey: "name" });
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
