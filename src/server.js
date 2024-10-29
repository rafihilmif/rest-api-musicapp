const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const registerArtist = require("./routes/artist/register");
const accountArtist = require("./routes/artist/account");
const album = require("./routes/artist/album");
const shows = require("./routes/artist/shows");
const song = require("./routes/artist/song");
const merch = require("./routes/artist/merchandise");
const transaction = require("./routes/artist/transaction");

const registerFans = require("./routes/fans/register");
const accountFans = require("./routes/fans/account");
const cart = require("./routes/fans/cart");
const order = require("./routes/fans/order");
const follow = require("./routes/fans/follow");
const plan = require("./routes/fans/plan");

const admin_login = require("./routes/admin/login");
const admin_merch = require("./routes/admin/merchandise");
const admin_genre = require("./routes/admin/genre");
const admin_account = require("./routes/admin/account");
const admin_song = require("./routes/admin/song");
const admin_plan = require("./routes/admin/plan");
const admin_transaction = require("./routes/admin/transaction");
const admin_order = require("./routes/admin/order");
const admin_reported = require("./routes/admin/reported");

const login = require("./routes/login");
const general_song = require("./routes/general/song");
const general_album = require("./routes/general/album");
const general_artist = require("./routes/general/artist");
const general_merchandise = require("./routes/general/merchandise");
const general_show = require("./routes/general/show");
const general_playlist = require("./routes/general/playlist");
const general_reported = require("./routes/general/reported");

const Artist = require("./models/Artist");
const Merch = require("./models/Merch");
const Shows = require("./models/Shows");
const Album = require("./models/Album");
const Song = require("./models/Song");
const Category = require("./models/Category");
const Genre = require("./models/Genre");
const Fans = require("./models/Fans");
const Plan = require("./models/Plan");
const ImageMerch = require("./models/ImageMerch");
const Cart = require("./models/Cart");
const CartItem = require("./models/CartItem");
const Ordered = require("./models/Ordered");
const OrderedItem = require("./models/OrderedItem");
const Playlist = require("./models/Playlist");
const PlaylistSong = require("./models/PlaylistSong");
const Reported = require('./models/Reported');
const Follow = require('./models/Follow');
const LikeSong = require('./models/LikeSong');
const PlanPayment = require("./models/PlanPayment");
const Transaction = require("./models/Transaction");
const TransactionItem = require("./models/TransactionItem");

Artist.associate({ Merch, Shows, Album, Song, Genre, Follow, Reported, Transaction });
Fans.associate({Ordered, Follow, Plan, PlanPayment, Cart });
Merch.associate({ Artist, Category, ImageMerch, CartItem, OrderedItem, TransactionItem });
ImageMerch.associate({ Merch });
Category.associate({ Merch });
Shows.associate({ Artist });
Album.associate({ Artist, Song });
Song.associate({ Artist, Album, Genre, PlaylistSong, LikeSong});
Genre.associate({ Artist, Song });
Cart.associate({ Fans, CartItem });
CartItem.associate({ Merch, Cart });
Playlist.associate({ PlaylistSong });
PlaylistSong.associate({ Playlist, Song });
Reported.associate({Artist})
Follow.associate({ Artist, Fans });
LikeSong.associate({ Song });
Plan.associate({ Fans });
PlanPayment.associate({ Fans });
Ordered.associate({ Fans, OrderedItem, Transaction});
OrderedItem.associate({ Ordered, Merch });
Transaction.associate({ TransactionItem, Ordered, Artist });
TransactionItem.associate({ Transaction, Merch});

const app = express();
app.set("port", 3030);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/api", registerArtist);
app.use("/api", registerFans);
app.use("/api", album);
app.use("/api", shows);
app.use("/api", accountArtist);
app.use("/api", transaction);

app.use("/api", accountFans);
app.use("/api", song);
app.use("/api", merch);
app.use("/api", cart);
app.use("/api", order);
app.use("/api", follow);
app.use("/api", plan);

app.use("/api", admin_merch);
app.use("/api", admin_genre);
app.use("/api", admin_account);
app.use("/api", admin_song);
app.use("/api", admin_plan);
app.use("/api", admin_transaction);
app.use("/api", admin_order);
app.use("/api", admin_reported);
app.use("/api", admin_login);

app.use("/api", login);
app.use("/api", general_album);
app.use("/api", general_song);
app.use("/api", general_artist);
app.use("/api", general_merchandise);
app.use("/api", general_show);
app.use("/api", general_playlist);
app.use("/api", general_reported);

app.listen(app.get("port"), () => {
  console.log(`Server started at http://localhost:${app.get("port")}`);
});

module.exports = app;
