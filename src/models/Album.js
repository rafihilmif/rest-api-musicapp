const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Album extends Model {
    static associate(models){
      this.hasMany(models.Song, { foreignKey: 'id_album' });
        this.belongsTo(models.Artist, { foreignKey: 'id_artist' });
    }
  }
Album.init(
    {
        id_album: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
      },
       id_artist: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
      },
       name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
        image: {
            type: DataTypes.BLOB("long"),
            allowNull:true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
        },
        created_at: {
            type: DataTypes.DATE(),
        },
         status: {
            type: DataTypes.NUMBER(2),
            allowNull:false
        },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "Album",
      tableName: "album",
    }
  );
  
module.exports = Album;
  
  