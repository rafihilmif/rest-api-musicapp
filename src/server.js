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
// const Fans= require("./models/Fans");

// User.associate({Saldo});
// Saldo.associate({User});
// Product.associate({Cart});
// Cart.associate({ Product });

const app = express();

app.set("port", 3030);
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", registerFans);
app.use("/api", registerArtist);
app.use("/api", allAccountFans);
app.use("/api", album);
app.use("/api", shows);
app.use("/api", login);
app.use("/api", song);

app.listen(app.get("port"), () => {
    console.log(`Server started at http://localhost:${app.get("port")}`);
});

module.exports = app;