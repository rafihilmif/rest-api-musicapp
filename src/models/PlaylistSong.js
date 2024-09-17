const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class PlaylistSong extends Model {
  static associate(models) {
      this.belongsTo(models.Playlist, { foreignKey: "id_playlist" });
      this.belongsTo(models.Song, { foreignKey: "id_song" });
  }
}
PlaylistSong.init(
  {
    id_playlist_song: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
        },
    id_playlist: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_song: {
      type: DataTypes.STRING(255),
      allowNull: false,
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: "PlaylistSong",
    tableName: "playlist_song",
  },
);

module.exports = PlaylistSong;
