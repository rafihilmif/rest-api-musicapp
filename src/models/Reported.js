const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Reported extends Model {
  static associate(models) {
      this.belongsTo(models.Artist, { foreignKey: "id_artist" });
  }
}
Reported.init(
  {
    id_report: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
        },
    id_user: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_artist: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
     category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
      comment: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
       created_at: {
     type: DataTypes.DATE(),
     allowNull: false,
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Reported",
    tableName: "reported",
  },
);

module.exports = Reported;
