const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class TransactionItem extends Model {
  static associate(models) {
    this.belongsTo(models.Transaction, { foreignKey: "id_transaction" });
    this.belongsTo(models.Merch, { foreignKey: "id_merchandise" });
  }
}
TransactionItem.init(
  {
    id_transaction_item: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_transaction: {
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
    modelName: "TransactionItem",
    tableName: "transaction_item",
  },
);

module.exports = TransactionItem;
