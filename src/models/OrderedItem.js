const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class OrderedItem extends Model {
  static associate(models) {
    this.belongsTo(models.Merch, { foreignKey: "id_merchandise" });
  }
}
OrderedItem.init(
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
      allowNull: true,
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
    modelName: "OrderedItem",
    tableName: "ordered_item",
  },
);

module.exports = OrderedItem;
