const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Artist = require("../../models/Artist");
const Song = require("../../models/Song");

const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const JWT_KEY = "makeblackmetalhateagain";
const fs = require("fs");
const Album = require("../../models/Album");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function name(req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, "./public/assets/image/song");
    }
    if (file.fieldname === "audio") {
      cb(null, "./public/assets/audio");
    }
  },
  filename: function name(req, file, cb) {
    if (file.fieldname === "image") {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    }
    if (file.fieldname === "audio") {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    }
  },
});

const upload = multer({ storage: storage });

router.post(
  "/artist/song/add",
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "audio",
      maxCount: 1,
    },
  ]),
  async function (req, res) {
    const { id } = req.query;
    let { album, name, genre, release_date, credit, lyric, status } = req.body;

    const audioFile = req.files.audio[0];
    const graphicFile = req.files.image[0];

    let newIdPrefix = "SNGS";
    let keyword = `%${newIdPrefix}%`;
    let similiarUID = await Song.findAll({
      where: {
        id_song: {
          [Op.like]: keyword,
        },
      },
    });
    let newIdSong =
      newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
    const dataAlbum = await Album.findAll({
      where: {
        name: {
          [Op.like]: album,
        },
      },
    });
    let idAlbum = null;
    dataAlbum.forEach((element) => {
      idAlbum = element.id_album;
    });

    await Song.create({
      id_song: newIdSong,
      id_artist: id,
      id_album: idAlbum,
      album: album,
      name: name,
      genre: genre,
      release_date: release_date,
      credit: credit,
      lyric: lyric,
      image: graphicFile.filename,
      audio: audioFile.filename,
      created_at: Date.now(),
      status: status,
    });
    return res.status(200).send({ message: "track berhasil ditambahkan" });
  },
);
//SHOW ALL SONG
router.get("/artist/collection/song", async function (req, res) {
  const { id } = req.query;
  const { page, pageSize } = req.query;
  const limit = pageSize || 12;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Song.findAndCountAll({
      where: {
        id_artist: id,
      },
      include: [
        {
          model: Artist,
          attributes: ["id_artist", "name"],
          where: {
            id_artist: {
              [Op.like]: id,
            },
          },
        },
      ],
      limit,
      offset,
      order: [[Sequelize.literal("name"), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/artist/song", async function (req, res) {
  const { id } = req.query;
  const { limit } = req.query || 5;

  try {
    const data = await Song.findAll({
      where: {
        id_artist: id,
      },
      limit: limit,
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
module.exports = router;
