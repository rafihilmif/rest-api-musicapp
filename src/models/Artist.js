const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Artist extends Model {
    static associate(models){
      
      this.hasMany(models.Merch, { foreignKey: 'id_artist' });
      this.hasMany(models.Album, { foreignKey: 'id_artist' });
      this.hasMany(models.Song, { foreignKey: 'id_artist' });
      this.hasMany(models.Shows, { foreignKey: 'id_artist' });
    }
  }
Artist.init(
    {
       id_artist: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false
        },
       name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      email:{
        type: DataTypes.STRING(255),
        allowNull: false
        },
       password: {
       type: DataTypes.STRING(255),
        allowNull: false
        },
        formed: {
            type: DataTypes.DATE(),
            allowNull:true
        },
         genre:{
        type: DataTypes.STRING(255),
        allowNull: true
        },
      role:{
        type: DataTypes.STRING(7),
        allowNull: false
      },
        description:{
        type: DataTypes.STRING(255),
        allowNull: true
        },
        avatar: {
            type: DataTypes.BLOB("long"),
            allowNull:true
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
      modelName: "Artis",
      tableName: "artist",
    }
  );
  
module.exports = Artist;
  
  