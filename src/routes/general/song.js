const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Song = require("../../models/Song");
const Artist = require("../../models/Artist");
const Genre = require("../../models/Genre");

const router = express.Router();

router.get("/songs", async function (req, res) {
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
router.get("/collection/song", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Song.findAll({
      where: {
        id_artist: {
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
    return res.status(400).send("gagal memuat data lagu dari artist" + id);
  }
});

router.get("/genre", async function (req, res) {
  const { name } = req.query; 
  
  try {
    if (name) {
      const data = await Genre.findAll({
        where: {
        name: {
      [Op.notLike]: name
      }
      }});
    return res.status(200).json(data);
    }
    else {
      const data = await Genre.findAll();
    return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(400).json('gagal memuat data category');
  }
});
router.get("/detail/song", async function (req, res) {
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
    return res.status(400).send('gagal memuat data track')
  }
});
router.get("/browse/genre", async function (req, res) {
  const { name } = req.query;
  try {
    if (name) {
      const data = await Genre.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`
          }
        }
      });
      return res.status(200).json(data);
    }
    else {
      const data = await Genre.findAll();
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(400).send('gagal memuat data gnere');
  }
});

module.exports = router;
