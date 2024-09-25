const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Ordered extends Model {
  static associate(models) {
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
    this.hasOne(models.Transaction, { foreignKey: "id_order" });
  }
}
Ordered.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last_name: {
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
    phone: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    courier: {
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
    modelName: "Ordered",
    tableName: "ordered",
  },
);

module.exports = Ordered;
