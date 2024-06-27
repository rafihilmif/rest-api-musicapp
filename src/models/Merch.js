const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Merchandise extends Model {
  static associate(models) {
    this.belongsTo(models.Artist, { foreignKey: "id_artist" });
    this.belongsTo(models.Category, { foreignKey: "category" });
  }
}
Merchandise.init(
  {
    id_merchandise: {
      type: DataTypes.STRING(255),
      primaryKey: true,
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
    artist: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    s: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    m: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
    },
    l: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
    },
    xl: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    image: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    status: {
      type: DataTypes.NUMBER(2),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Merchandise",
    tableName: "merchandise",
  },
);

module.exports = Merchandise;
