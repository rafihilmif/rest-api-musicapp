const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Joi = require("joi");
const sharp = require('sharp');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Song = require("../../models/Song");
const router = express.Router();

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
    
    const schema = Joi.object({
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
        id_artist: id,
        id_album: null,
        name: name,
        album: null,
        genre: genre,
        release_date: release_date,
        credit: credit,
        lyric: lyric,
        image: graphicFile.filename,
        audio: audioFile.filename,
        created_at: Date.now(),
        status: status,
      });
      }
      else {
        await Song.create({
        id_song: newIdSong,
        id_artist: id,
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
        status: status,
      });
      }
    return res.status(201).json({message:"Successfully added song"});
    } catch (error) {
       if (error.isJoi) {
      return res.status(400).json({
        message: error.details[0].message, 
        path: error.details[0].path[0],   
      });
      }else if (error.path) {
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

router.get("/artist/collection/song", async function (req, res) {
  const { id } = req.query;
  const { page, pageSize } = req.query;
  const limit = pageSize || 18;
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
router.get("/artist/collection/song/sort/new", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
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
      order: [[Sequelize.literal("release_date"), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/artist/collection/song/sort/old", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
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
      order: [[Sequelize.literal("release_date"), "DESC"]],
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
router.get('/artist/detail/song', async function (req, res) {
  const { id } = req.query;

  try {
    const data = await Song.findOne({
      where: {
        id_song: {
          [Op.like]: id
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal memuat data song');
  }
});

router.put("/artist/song/update", upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "audio",
      maxCount: 1,
    },
  ]), async function (req, res) {
    const { id } = req.query;
    const newData = req.body;
    try {
      const song = await Song.findByPk(id);
      if (!song) {
        return res.status(404).send("Data tidak ditemukan");
      }

      const artist = await Artist.findByPk(song.id_artist);
      if (!artist) {
        return res.status(404).send('Artist not found');
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
          }
        });

        const watermarkFolderPath = './public/assets/image/watermark';
        const songFolderPath = './public/assets/image/song';
        const originalFilename = req.files["image"][0].filename;
        const pathInWatermarkFolder = path.join(watermarkFolderPath, originalFilename);
        const finalPathInSongFolder = path.join(songFolderPath, originalFilename);

        fs.mkdir(watermarkFolderPath, { recursive: true }, (err) => {
          if (err) {
            console.error('Error creating watermark folder:', err);
            return res.status(500).send({ message: "Error processing image" });
          }

          fs.rename(req.files["image"][0].path, pathInWatermarkFolder, (err) => {
            if (err) {
              console.error('Error moving file to watermark folder:', err);
              return res.status(500).send({ message: "Error processing image" });
            }

            sharp(pathInWatermarkFolder)
              .composite([
                {
                  input: {
                    text: {
                      text: `copyright © ${artist.name}`,
                      fontSize: 10,
                      rgba: true,
                        fill: { r: 255, g: 255, b: 255, alpha: 0.5 }
                    }
                  },
                  gravity: 'southeast'
                }
              ])
              .toFile(finalPathInSongFolder, (err) => {
                if (err) {
                  console.error('Error processing final image:', err);
                  return res.status(500).send({ message: "Error processing image" });
                }

                fs.unlink(pathInWatermarkFolder, (err) => {
                  if (err) {
                    console.error('Error deleting file from watermark folder:', err);
                  }
                  saveNewUpdateData.image = originalFilename;
                  updateSongData();
                });
              });
          });
        });
      } else {
        updateSongData();
      }

      function updateSongData() {
        if (req.files["audio"]) {
          const oldFilePath = "./public/assets/audio/" + song.audio;
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error("Error deleting the old audio:", err);
            }
          });
          saveNewUpdateData.audio = req.files["audio"][0].filename;
        }

        song.update(saveNewUpdateData)
          .then(() => {
            res.status(200).send("Data berhasil diubah");
          })
          .catch((error) => {
            console.error("Error updating song data:", error);
            res.status(400).send("Gagal merubah data");
          });
      }

    } catch (error) {
      console.error("Error updating data:", error);
      return res.status(400).send("Gagal merubah data");
    }
});
module.exports = router;
