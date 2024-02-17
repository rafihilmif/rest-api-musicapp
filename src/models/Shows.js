const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Shows extends Model {
    static associate(models){
       this.belongsTo(models.Artist, { foreignKey: 'id_artist' });
    }
  }
Shows.init(
    {
       id_show: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
      },
      id_artist: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      name:{
        type: DataTypes.STRING(255),
        allowNull: false
        },
      duedate: {
          type: DataTypes.DATE(),
          allowNull: false
        },
       location: {
       type: DataTypes.STRING(255),
        allowNull: false
        },
      contact: {
        type: DataTypes.STRING(13),
        allowNull: true
      },
        image: {
            type: DataTypes.BLOB("long"),
            allowNull:true
        },
        created_at: {
            type: DataTypes.DATE(),
            allowNull: false
        },
         status: {
            type: DataTypes.NUMBER(2),
            allowNull:false
        },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "Shows",
      tableName: "shows",
    }
  );
  
module.exports = Shows;
  
  