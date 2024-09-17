const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Playlist extends Model {
    static associate(models) {
       this.hasOne(models.PlaylistSong, { foreignKey: "id_playlist" });
  }
}
Playlist.init(
  {
    id_playlist: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
        },
    id_user: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(2),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Playlist",
    tableName: "playlist",
  },
);

module.exports = Playlist;
