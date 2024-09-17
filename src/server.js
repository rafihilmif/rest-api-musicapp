const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const registerFans = require("./routes/fans/register");
const registerArtist = require("./routes/artist/register");
const allAccountFans = require("./routes/fans/account");
const album = require("./routes/artist/album");
const shows = require("./routes/artist/shows");
const login = require("./routes/login");
const song = require("./routes/artist/song");
const merch = require("./routes/artist/merchandise");
const accountArtist = require("./routes/artist/account");
const cart = require("./routes/fans/cart");
const order = require("./routes/fans/order");

const admin_merch = require("./routes/admin/merchandise");
const admin_genre = require("./routes/admin/genre");
const admin_account = require("./routes/admin/account");
const admin_song = require("./routes/admin/song");
const admin_plan = require("./routes/admin/plan");

const general_song = require("./routes/general/song");
const general_album = require("./routes/general/album");
const general_artist = require("./routes/general/artist");
const general_merchandise = require("./routes/general/merchandise");
const general_show = require("./routes/general/show");
const general_playlist = require("./routes/general/playlist");

const Artist = require("./models/Artist");
const Merch = require("./models/Merch");
const Shows = require("./models/Shows");
const Album = require("./models/Album");
const Song = require("./models/Song");
const Category = require("./models/Category");
const Genre = require("./models/Genre");
const Fans = require("./models/Fans");
const Plan = require("./models/Plan");
const Subscription = require("./models/Subscription");
const ImageMerch = require("./models/ImageMerch");
const CartItem = require("./models/CartItem");
const Order = require("./models/Order");
const Playlist = require("./models/Playlist");
const PlaylistSong = require("./models/PlaylistSong");

Artist.associate({ Merch, Shows, Album, Song, Genre });
Fans.associate({ Subscription, Order });
Merch.associate({ Artist, Category, ImageMerch, CartItem });
ImageMerch.associate({ Merch });
Category.associate({ Merch });
Shows.associate({ Artist });
Album.associate({ Artist, Song });
Song.associate({ Artist, Album, Genre, PlaylistSong});
Genre.associate({ Artist, Song });
Plan.associate({ Subscription });
Subscription.associate({ Plan, Fans });
CartItem.associate({ Merch });
Order.associate({ Fans });
Playlist.associate({ PlaylistSong });
PlaylistSong.associate({ Playlist, Song });

const app = express();

app.set("port", 3030);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/api", registerFans);
app.use("/api", registerArtist);
app.use("/api", allAccountFans);
app.use("/api", album);
app.use("/api", shows);
app.use("/api", login);
app.use("/api", song);
app.use("/api", merch);
app.use("/api", accountArtist);
app.use("/api", cart);
app.use("/api", order);

app.use("/api", admin_merch);
app.use("/api", admin_genre);
app.use("/api", admin_account);
app.use("/api", admin_song);
app.use("/api", admin_plan);

app.use("/api", general_album);
app.use("/api", general_song);
app.use("/api", general_artist);
app.use("/api", general_merchandise);
app.use("/api", general_show);
app.use("/api", general_playlist);

app.listen(app.get("port"), () => {
  console.log(`Server started at http://localhost:${app.get("port")}`);
});

module.exports = app;
