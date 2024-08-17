const Artist = require("./Artist");
const Album = require("./Album");
const Merch = require("./Merch");
const Fans = require("./Fans");
const Song = require("./Song");
const Shows = require("./Shows");
const Category = require("./Category");
const Genre = require("./Genre");
const Plan = require("./Plan");
const Subscription = require("./Subscription");
const ImageMerch = require("./ImageMerch");
const CartItem = require("./CartItem");
const Order = require("./Order");

module.exports = function () {
  Artist.hasMany(Album, Merch, Song, Shows, { foreignKey: "id_artist" });
  Album.hasMany(Song, { foreignKey: "id_album" });
  Category.hasMany(Merch, { foreignKey: "name" });
  Genre.hasMany(Artist, Song, { foreignKey: "name" });

  Album.belongsTo(Artist, { foreignKey: "id_artist" });
  Merch.belongsTo(Artist, { foreignKey: "id_artist" });
  Shows.belongsTo(Artist, { foreignKey: "id_artist" });
  Song.belongsTo(Artist, { foreignKey: "id_artist" });

  Song.belongsTo(Album, { foreignKey: "id_album" });

  Merch.belongsTo(Category, { foreignKey: "category" });
  Merch.hasMany(ImageMerch, { foreignKey: "id_merchandise" });
  Merch.hasMany(CartItem, { foreignKey: "id_merchandise" });

  ImageMerch.belongsTo(Merch, { foreignKey: "id_merchandise" });
  
  Artist.belongsTo(Genre, { foreignKey: "genre" });
  Song.belongsTo(Genre, { foreignKey: "genre" });

  Plan.hasMany(Subscription, { foreignKey: "name" });

  Fans.hasOne(Subscription, { foreignKey: "id_fans" });
  Fans.hasOne(Subscription, { foreignKey: "email" });
  Fans.hasMany(Order, { foreignKey: "id_fans" });

  Subscription.belongsTo(Plan, { foreignKey: "plan_name" });
  Subscription.belongsTo(Fans, { foreignKey: "id_fans" });
  Subscription.belongsTo(Fans, { foreignKey: "email_fans" });

  CartItem.belongsTo(Merch, { foreignKey: "id_merchandise" });
  Order.belongsTo(Fans, { foreignKey: "id_fans" });
  
};
