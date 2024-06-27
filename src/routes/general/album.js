const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Album = require("../../models/Album");
const Song = require("../../models/Song");
const Artist = require("../../models/Artist");

const router = express.Router();
router.get("/albums", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Album.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_album`), "ASC"]],
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
router.get("/album", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Album.findOne({
      where: {
        id_album: {
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
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/collection/album", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Album.findAll({
      where: {
        id_artist: {
          [Op.like]: id,
        },
      },
      limit: 6,
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data album");
  }
});
router.get("/album/song", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Song.findAll({
      where: {
        id_album: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});

module.exports = router;
