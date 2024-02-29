const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class Category extends Model {
    static associate(models){
        this.hasMany(models.Merch, { foreignKey: 'name' });
    }
  }
Category.init(
    {
       id_category: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
        created_at: {
            type: DataTypes.DATE(),
        },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "Category",
      tableName: "category",
    }
  );
  
module.exports = Category;
  
  