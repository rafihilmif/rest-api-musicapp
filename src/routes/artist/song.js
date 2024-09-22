const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Artist = require("../../models/Artist");
const Song = require("../../models/Song");

const sharp = require('sharp');
const multer = require("multer");
const path = require("path");
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
    
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).send('artist not found');
    }

    try {

      const watermarkFolderPath = './public/assets/image/watermark';
      const songFolderPath = './public/assets/image/song';
      const originalFilename = graphicFile.filename;
      const pathInWatermarkFolder = path.join(watermarkFolderPath, originalFilename);
      const finalPathInSongFolder = path.join(songFolderPath, originalFilename);
      
      fs.mkdir(watermarkFolderPath, { recursive: true }, (err) => {
          if (err) {
            console.error('Error creating watermark folder:', err);
            return res.status(500).send({ message: "Error processing image" });
          }

          fs.rename(graphicFile.path, pathInWatermarkFolder, (err) => {
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
    fontSize: 24,
    fontWeight: 'bold',
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

                  let newIdPrefix = "SNGS";
                  let keyword = `%${newIdPrefix}%`;

                  Song.findAll({
                    where: {
                      id_song: {
                        [Op.like]: keyword,
                      },
                    },
                  }).then((similiarUID) => {
                    let newIdSong = newIdPrefix + (similiarUID.length + 1).toString().padStart(3, "0");
                    
                    Album.findAll({
                      where: {
                        name: {
                          [Op.like]: album,
                        },
                      },
                    }).then((dataAlbum) => {
                      let idAlbum = null;
                      dataAlbum.forEach((element) => {
                        idAlbum = element.id_album;
                      });

                      Song.create({
                        id_song: newIdSong,
                        id_artist: id,
                        id_album: idAlbum,
                        album: album,
                        name: name,
                        genre: genre,
                        release_date: release_date,
                        credit: credit,
                        lyric: lyric,
                        image: originalFilename,
                        audio: audioFile.filename,
                        created_at: Date.now(),
                        status: status,
                      }).then(() => {
                        return res.status(200).send({ message: "track berhasil ditambahkan" });
                      }).catch((error) => {
                        console.error('Error creating song:', error);
                        return res.status(500).send({ message: "Error creating song" });
                      });
                    }).catch((error) => {
                      console.error('Error finding album:', error);
                      return res.status(500).send({ message: "Error finding album" });
                    });
                  }).catch((error) => {
                    console.error('Error finding similar songs:', error);
                    return res.status(500).send({ message: "Error finding similar songs" });
                  });
                });
              });
          });
        });
    } catch (error) {
      ret
    }
  }
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
