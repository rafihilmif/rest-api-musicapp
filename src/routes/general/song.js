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
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {

    if (!page && !pageSize) {
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
      limit : 10,
      order: [[Sequelize.literal("name"), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
    }
    else {
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
    }
    
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/collection/song/sort/new", async function (req, res) {
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
router.get("/collection/song/sort/old", async function (req, res) {
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
router.get("/result/top/song", async function (req, res) {
  const { name } = req.query;

  try {
    const data = await Song.findAll(
      {
        include: [
          {
            model: Artist,
            attributes: ["name"],
            where: {
              name: {
                [Op.like]: `%${name}%`
              }
            }
          },
        ],
      limit: 4
      },);  
     return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal melakukan pencarian track teratas');
  }
});
module.exports = router;
