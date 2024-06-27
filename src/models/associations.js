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
  Merch.hasMany(DetailMerch, { foreignKey: "id_merchandise" });

  Artist.belongsTo(Genre, { foreignKey: "genre" });
  Song.belongsTo(Genre, { foreignKey: "genre" });

  Plan.hasMany(Subscription, { foreignKey: "name" });

  Fans.hasOne(Subscription, { foreignKey: "id_fans" });
  Fans.hasOne(Subscription, { foreignKey: "email" });

  Subscription.belongsTo(Plan, { foreignKey: "plan_name" });
  Subscription.belongsTo(Fans, { foreignKey: "id_fans" });
  Subscription.belongsTo(Fans, { foreignKey: "email_fans" });

};
