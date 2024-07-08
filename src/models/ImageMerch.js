const { getDB } = require("../config/env");
const sequelize = getDB();
const { Model, DataTypes } = require("sequelize");

class ImageMerch extends Model {
  static associate(models) {
    this.belongsTo(models.Merch, { foreignKey: "id_merchandise" });
  }
}
ImageMerch.init(
  {
    id_merchandise: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
   name: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
        number: {
        type: DataTypes.INTEGER(1),
        allowNull: false
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: "ImageMerch",
    tableName: "image_merch",
  },
);

module.exports = ImageMerch;
