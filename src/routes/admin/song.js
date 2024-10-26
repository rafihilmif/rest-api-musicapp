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
const Joi = require("joi");
const PlaylistSong = require("../../models/PlaylistSong");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, "./public/assets/image/song");
    } else if (file.fieldname === "audio") {
      cb(null, "./public/assets/audio");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
    
    req.on("aborted", () => {
      let fullFilePath;
      if (file.fieldname === "image") {
        fullFilePath = path.join("public", "assets", "image", "song", fileName);
      } else if (file.fieldname === "audio") {
        fullFilePath = path.join("public", "assets", "audio", fileName);
      }
      
      file.stream.on("end", () => {
        fs.unlink(fullFilePath, (err) => {
          if (err) console.error("Error deleting file on abort:", err);
        });
      });
      file.stream.emit("end");
    });
  },
});
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Only .png, .jpg, and .jpeg formats are allowed for images!");
      error.path = "file";
      return cb(error);
    }
  } else if (file.fieldname === "audio") {
    const allowedAudioTypes = ["audio/mpeg"];
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Only .mp3 formats are allowed for audio!");
      error.path = "fileimage";
      return cb(error);
    }
  } else {
    const error = new Error("Unexpected file field!");
    error.path = "fileaudio";
    return cb(error);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
 });


router.get("/admin/choose/album", async function (req, res) {
  let { id} = req.query;

  const data = await Album.findAll({
    where: {
      id_artist: id,
    },
  });
  return res.status(200).json(data);
});

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
    console.log(album);
    const schema = Joi.object({
      id_artist: Joi.string().required(),
      album: Joi.string().allow(null),
      name: Joi.string().required(),
      genre: Joi.string().required(),
      release_date: Joi.date().required(),
      credit: Joi.string().allow(null),
      lyric: Joi.string().allow(null),
      status: Joi.number()
    });
      
    try {
      await schema.validateAsync(req.body);
      let newIdPrefixSong = "SNGS";
      let highestIdEntrySong = await Song.findOne({
        where: {
          id_song: {
            [Op.like]: `${newIdPrefixSong}%`
          }
        },
        order: [['id_song', 'DESC']]
      });
      let newIdNumberSong = 1;
      if (highestIdEntrySong) {
        let highestIdSong = highestIdEntrySong.id_song;
        let numericPartSong = highestIdSong.replace(newIdPrefixSong, '');
        newIdNumberSong = parseInt(numericPartSong, 10) + 1;
      }
      let newIdSong = newIdPrefixSong + newIdNumberSong.toString().padStart(3, '0');
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
      if (album === "-") {
        await Song.create({
        id_song: newIdSong,
        id_artist: id_artist,
        id_album: "-",
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
      }
      else {
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
      }
      return res.status(201).json({ message: "Successfully added song" });
    } catch (error) {
      if (error.isJoi) {
        return res.status(400).json({
          message: error.details[0].message,
          path: error.details[0].path[0],
        });
      } else if (error.path) {
        return res.status(400).json({
          message: error.message,
          path: error.path,
        });
      } else {
        return res.status(400).json({ message: error.message });
      }
    }
  },
);
router.get("/admin/songs", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 9;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Song.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_song`), "ASC"]],
      include: [
        {
          model: Artist,
          attributes: ["name", "avatar"],
        },
           {
          model: Album,
          attributes: ["id_album","name", "image"],
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

router.delete("/admin/song/delete", async function (req, res) {
  const { id } = req.query;

   const data = await Song.findOne(
    {
      where: {
        id_song: id
      }
    }
  );

  try {
    await PlaylistSong.destroy(
      {
        where: {
          id_song: id,
        }
      });
    const oldFileSongPath = "./public/assets/audio/" + data.audio;
    fs.unlink(oldFileSongPath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
    });
    const oldFileImage = "./public/assets/image/song/" + data.image;
    fs.unlink(oldFileImage, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res.status(500).send("Error deleting the old image");
        }
    });
     await Song.destroy(
      {
        where: {
          id_song: id,
        }
       });
    return res.status(200).json("Successfully deleted song");
  } catch (error) {
    return res.status(400).send("Failed to deleted song");
  }
});

module.exports = router;
