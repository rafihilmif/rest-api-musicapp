
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Shows = require("../../models/Shows");
const Artist = require("../../models/Artist");
const router = express.Router();

router.get('/shows', async function (req, res) {
    try {
        const data = await Shows.findAll();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send('gagal memuat data show');
    }
});
router.get("/collection/shows", async function (req, res) {
  const { id, page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
   if (!page && !pageSize) {
      const { rows, count } = await Shows.findAndCountAll({
      where: {
        id_artist: id,
      },
      include: {
        model: Artist,
        attributes: ["id_artist", "name"],
        where: {
          id_artist: {
            [Op.like]: id,
          },
        },
      },
      limit : 6,
      order: [[Sequelize.literal("name", "ASC")]],
      });
       return res.status(200).json({
      data: rows,
      total: count,
    });
    }
    else {
      const { rows, count } = await Shows.findAndCountAll({
      where: {
        id_artist: id,
      },
      include: {
        model: Artist,
        attributes: ["id_artist", "name"],
        where: {
          id_artist: {
            [Op.like]: id,
          },
        },
      },
      limit,
      offset,
      order: [[Sequelize.literal("name", "ASC")]],
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
router.get("/collection/shows/sort/upcoming", async function (req, res) {
  const { id,  page, pageSize  } = req.query;
  const limit = pageSize || 18;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Shows.findAndCountAll({
      where: {
        id_artist: id,
        duedate: {
          [Op.gte]: new Date(), 
        }
      },
      include: {
        model: Artist,
        attributes: ["id_artist", "name"],
        where: {
          id_artist: {
            [Op.like]: id,
          },
        },
      },
      limit,
      offset,
      order: [[Sequelize.literal("name", "ASC")]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get('/detail/show', async function (req, res) {
    const { id } = req.query;
    try {
        const data = await Shows.findOne({
            where: {
                id_show: {
                    [Op.like]: id
                }
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).send('gagal memuat detail show');
    }
});
router.get("/result/show", async function (req, res) {
  const { name } = req.query;
  
  try {
   
    const matchingShows = await Shows.findOne({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      }
    });
 
    const otherShows = await Shows.findAll({
      where: {
        name: {
          [Op.notLike]: `%${name}%`
        }
      },
      order: Sequelize.literal('RAND()'),
      limit: 5
    });
    
    const data = matchingShows ? [matchingShows, ...otherShows] : otherShows;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for show');
  }
});
module.exports = router;