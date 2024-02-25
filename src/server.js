const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser');

const registerFans = require("./routes/fans/register");
const registerArtist = require("./routes/artist/register");
const allAccountFans = require("./routes/fans/account");
const album = require('./routes/artist/album');
const shows = require('./routes/artist/shows')
const login = require("./routes/login");
const song = require('./routes/artist/song');
const merch = require('./routes/artist/merchandise');

const admin_merch = require('./routes/admin/merchandise')
const admin_genre = require('./routes/admin/genre');
const admin_account = require('./routes/admin/account');

const Artist= require("./models/Artist");
const Merch = require("./models/Merch");
const Shows = require("./models/Shows");
const Album = require("./models/Album");
const Song = require("./models/Song");
const Category = require("./models/Category");
const Genre = require("./models/Genre");

Artist.associate({ Merch, Shows, Album, Song, Genre });
Merch.associate({ Artist, Category });
Category.associate({Merch})
Shows.associate({ Artist });
Album.associate({ Artist, Song });
Song.associate({ Artist, Album, Genre });
Genre.associate({ Artist, Song });

const app = express();

app.set("port", 3030);
app.use(cors({origin:true, credentials:true}));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use("/api", registerFans);
app.use("/api", registerArtist);
app.use("/api", allAccountFans);
app.use("/api", album);
app.use("/api", shows);
app.use("/api", login);
app.use("/api", song);
app.use("/api", merch);

app.use("/api", admin_merch);
app.use("/api", admin_genre);
app.use("/api", admin_account);

app.listen(app.get("port"), () => {
    console.log(`Server started at http://localhost:${app.get("port")}`);
});

module.exports = app;