const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Genre extends Model {
  static associate(models) {
    this.hasMany(models.Artist, { foreignKey: "name" });
    this.hasMany(models.Song, { foreignKey: "name" });
  }
}
Genre.init(
  {
    id_genre: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    name: {
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
    modelName: "Genre",
    tableName: "genre",
  },
);

module.exports = Genre;
