const Artist = require('./Artist');
const Album = require('./Album');
const Merch = require('./Merch');
const Fans = require('./Fans');
const Song = require('./Song');
const Shows = require('./Shows');
const Category = require('./Category');

module.exports = function () {
    Artist.hasMany(Album, Merch, Song, Shows, { foreignKey: 'id_artist' });
    Album.hasMany(Song, { foreignKey: 'id_album' });
    Category.hasMany(Merch, { foreignKey: 'id_category' });

    Album.belongsTo(Artist, { foreignKey: 'id_artist' });
    Merch.belongsTo(Artist, { foreignKey: 'id_artist' });
    Shows.belongsTo(Artist, { foreignKey: 'id_artist' });
    Song.belongsTo(Artist, { foreignKey: 'id_artist' });

    Song.belongsTo(Album, { foreignKey: 'id_album' });

    Merch.belongsTo(Category, { foreignKey: 'id_category' });
}