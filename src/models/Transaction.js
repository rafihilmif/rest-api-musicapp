const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Transaction extends Model {
  static associate(models) {
    this.hasMany(models.TransactionItem, { foreignKey: "id_transaction" });
    this.belongsTo(models.Ordered, { foreignKey: "id_order" });
    this.belongsTo(models.Artist, { foreignKey: "id_artist" });
  }
}
Transaction.init(
  {
    id_transaction: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_order: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_artist: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    courier: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE(),
        allowNull: false
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Transaction",
    tableName: "transaction",
  },
);

module.exports = Transaction;
