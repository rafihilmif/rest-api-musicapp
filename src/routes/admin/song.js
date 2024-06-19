const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Category");
const Album = require("../../models/Album");
const Song = require("../../models/Song");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artist = require("../../models/Artist");

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

router.get("/admin/album", async function (req, res) {
  let { id_artist } = req.query;

  const data = await Album.findAll({
    where: {
      id_artist: id_artist,
    },
  });
  return res.status(200).json({
    data,
  });
});
const upload = multer({ storage: storage });
router.post(
  "/admin/song/add",
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
    let { id_artist, album, name, genre, release_date, credit, lyric } =
      req.body;
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
    if (dataAlbum == null) {
      await Song.create({
        id_song: newIdSong,
        id_artist: id_artist,
        id_album: null,
        name: name,
        album: "-",
        genre: genre,
        release_date: release_date,
        credit: credit,
        lyric: lyric,
        image: graphicFile.filename,
        audio: audioFile.filename,
        created_at: Date.now(),
        status: 1,
      });
      return res.status(200).send({ message: "track berhasil ditambahkan" });
    } else if (dataAlbum != null) {
      await Song.create({
        id_song: newIdSong,
        id_artist: id_artist,
        id_album: idAlbum,
        name: name,
        album: album,
        genre: genre,
        release_date: release_date,
        credit: credit,
        lyric: lyric,
        image: graphicFile.filename,
        audio: audioFile.filename,
        created_at: Date.now(),
        status: 1,
      });
      return res.status(200).send({ message: "track berhasil ditambahkan" });
    }
  },
);
router.get("/admin/songs", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Song.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_song`), "ASC"]],
      include: [
        {
          model: Artist,
          attributes: ["name"],
        },
      ],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});

router.get("/admin/song", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Song.findOne({
      where: {
        id_song: {
          [Op.like]: id,
        },
      },
      include: [
        {
          model: Artist,
          attributes: ["name"],
        },
      ],
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(404).send("Gagal memuat data");
  }
});

router.put(
  "/admin/song",
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
    const newData = req.body;
    try {
      const song = await Song.findByPk(id);
      if (!song) {
        return res.status(404).send("Data tidak ditemukan");
      }
      const saveNewUpdateData = {};
      Object.keys(newData).forEach((key) => {
        if (newData[key] !== undefined) {
          saveNewUpdateData[key] = newData[key];
        }
      });

      if (req.files["image"]) {
        const oldFilePath = "./public/assets/image/song/" + song.image;
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting the old image:", err);
            return res.status(500).send("Error deleting the old image");
          }
        });
        saveNewUpdateData.image = req.files["image"][0].filename;
      }
      if (req.files["audio"]) {
        const oldFilePath = "./public/assets/audio/" + song.audio;
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting the old audio:", err);
            return res.status(500).send("Error deleting the old image");
          }
        });
        saveNewUpdateData.audio = req.files["audio"][0].filename;
      }
      await song.update(saveNewUpdateData);
    } catch (error) {
      return res.status(400).send("Gagal merubah data");
    }
  },
);
module.exports = router;
