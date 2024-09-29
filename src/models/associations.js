const Artist = require("./Artist");
const Album = require("./Album");
const Merch = require("./Merch");
const Fans = require("./Fans");
const Song = require("./Song");
const Shows = require("./Shows");
const Category = require("./Category");
const Genre = require("./Genre");
const Plan = require("./Plan");
const ImageMerch = require("./ImageMerch");
const Cart = require('./Cart');
const CartItem = require("./CartItem");
const Ordered = require("./Ordered");
const OrderedItem = require("./OrderedItem");
const Playlist = require("./Playlist");
const PlaylistSong = require("./PlaylistSong");
const Follow = require("./Follow");
const LikeSong = require("./LikeSong");
const PlanPayment = require("./PlanPayment");
const Transaction = require("./Transaction");
const TransactionItem = require('./TransactionItem');

module.exports = function () {
  Artist.hasMany(Album, Merch, Song, Shows, { foreignKey: "id_artist" });
  Album.hasMany(Song, { foreignKey: "id_album" });
  Category.hasMany(Merch, { foreignKey: "name" });
  Genre.hasMany(Artist, Song, { foreignKey: "name" });

  Album.belongsTo(Artist, { foreignKey: "id_artist" });
  Merch.belongsTo(Artist, { foreignKey: "id_artist" });
  Shows.belongsTo(Artist, { foreignKey: "id_artist" });
  Song.belongsTo(Artist, { foreignKey: "id_artist" });
  Song.belongsTo(Artist, { foreignKey: "id_artist" });

  Merch.belongsTo(Category, { foreignKey: "category" });
  Merch.hasMany(ImageMerch, CartItem, OrderedItem, TransactionItem ,{ foreignKey: "id_merchandise" });

  ImageMerch.belongsTo(Merch, { foreignKey: "id_merchandise" });
  
  Artist.belongsTo(Genre, { foreignKey: "genre" });
  Song.belongsTo(Genre, { foreignKey: "genre" });

  Fans.hasOne(Plan, { foreignKey: "id_fans" });
  Plan.belongsTo(Fans, { foreignKey: "id_fans" });

  PlanPayment.belongsTo(Fans, { foreignKey: "id_fans" });
  Fans.hasMany(PlanPayment, { foreignKey: "id_fans" });
    
  Fans.hasMany(Ordered, { foreignKey: "id_fans" });
  Fans.hasOne(Cart, { foreignKey: "id_fans" });

  Cart.belongsTo(Fans, { foreignKey: 'id_fans' });
  CartItem.belongsTo(Merch, { foreignKey: "id_merchandise" });

  Ordered.belongsTo(Fans, { foreignKey: "id_fans" });
  Ordered.hasOne(OrderedItem, { foreignKey: "id_order" });
  OrderedItem.belongsTo(Ordered, { foreignKey: "id_order" });

  Playlist.hasOne(PlaylistSong, {foreignKey: "id_playlist"})
  PlaylistSong.belongsTo(Playlist, { foreignKey: "id_playlist" });
  Song.hasMany(PlaylistSong, { foreignKey: "id_song" });
  PlaylistSong.belongsTo(Song, { foreignKey: "id_song" })
  
  Follow.belongsTo(Artist, { foreignKey: "id_artist" });
  Follow.belongsTo(Fans, { foreignKey: "id_fans" });
  Artist.hasMany(Follow, { foreignKey: "id_artist" });
  Fans.hasMany(Follow, { foreignKey: "id_fans" });

  LikeSong.belongsTo(Song, { foreignKey: "id_song" });
  Song.hasMany(LikeSong, { foreignKey: "id_song" });

  Transaction.hasMany(TransactionItem, { foreignKey: "id_transaction" });
  TransactionItem.belongsTo(Transaction, { foreignKey: "id_transaction" });
  Ordered.hasOne(Transaction, { foreignKey: "id_order" });
  Transaction.belongsTo(Ordered, { foreignKey: "id_order" });
  Transaction.belongsTo(Artist, { foreignKey: "id_artist" });
  OrderedItem.belongsTo(Merch, { foreignKey: "id_merchandise" });
  TransactionItem.belongsTo(Merch, { foreignKey: "id_merchandise" });
};
