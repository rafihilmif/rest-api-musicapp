const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class LikeSong extends Model {
  static associate(models) {
    this.belongsTo(models.Song, { foreignKey: "id_song" });
  }
}
LikeSong.init(
    {
      id_like_song: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_song: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
    type: DataTypes.DATE(),
    allowNull: false,
    },
     status: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "LikeSong",
    tableName: "like_song",
  },
);

module.exports = LikeSong;
