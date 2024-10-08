const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Song extends Model {
  static associate(models) {
    this.belongsTo(models.Artist, { foreignKey: "id_artist" });
    this.belongsTo(models.Album, { foreignKey: "id_album" });
    this.belongsTo(models.Genre, { foreignKey: "genre" });
    this.hasMany(models.PlaylistSong, { foreignKey: "id_song" });
    this.hasMany(models.LikeSong, { foreignKey: 'id_song' });
  }
}
Song.init(
  {
    id_song: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    id_artist: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_album: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    release_date: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    credit: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lyric: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
    audio: {
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
    modelName: "Song",
    tableName: "song",
  },
);

module.exports = Song;
