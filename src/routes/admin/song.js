const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Category");
const Album = require("../../models/Album");
const Song = require("../../models/Song");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/admin/album', async function (req, res) {
    let { id_artist } = req.query;
    
    const data = await Album.findAll({
        where: {
            id_artist: id_artist
        }
    });
    return res.status(200).json({
            data
        });
});

const storage = multer.diskStorage({
    destination: function name(req, file, cb) {
        if (file.fieldname === "image") {
                cb(null, './public/assets/image/song');
           }
        if (file.fieldname === "audio") {
               cb(null, './public/assets/audio');
           }
    },
    filename: function name(req, file, cb) {
        if (file.fieldname === "image") {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
          if (file.fieldname === "audio") {
           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
          }
    }

});

const upload = multer({ storage: storage });
router.post('/admin/song/add', upload.fields([{
  name: 'image', maxCount: 1
}, {
  name: 'audio', maxCount: 1
    }]), async function (req, res) { 
    
    let {id_artist , id_album ,name, genre, release_date, credit, description } = req.body;

    const audioFile = req.files.audio[0];
    const graphicFile = req.files.image[0];

    let newIdPrefix = "SNGS";
    let keyword = `%${newIdPrefix}%`
    let similiarUID = await Song.findAll({
        where: {
            id_song: {
                [Op.like]: keyword
            }
        }
    });
    let newIdSong = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, '0');

    const newSong = await Song.create({
        id_song: newIdSong,
        id_artist: id_artist,
        id_album: id_album,
        name: name,
        genre: genre,
        release_date: release_date,
        credit: credit,
        description: description,
        image: graphicFile.filename,
        audio: audioFile.filename,
        created_at: Date.now(),
        status: 1
    });
    return res.status(200).send({ message: 'track berhasil ditambahkan' });
});

module.exports = router;