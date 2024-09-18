const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Follow extends Model {
  static associate(models) {
    this.belongsTo(models.Artist, { foreignKey: "id_artist" });
    this.belongsTo(models.Fans, { foreignKey: "id_fans" });
  }
}
Follow.init(
  {
    id_follow: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_fans: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_artist: {
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
    modelName: "Follow",
    tableName: "follow",
  },
);

module.exports = Follow;
