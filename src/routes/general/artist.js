const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const { func } = require("joi");

const router = express.Router();
router.get("/artists", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Artist.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_artist`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});

router.get("/artist", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Artist.findOne({
      where: {
        id_artist: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});

router.get("/result/top/artist", async function (req, res) {
  const { name } = req.query;
  try {
    const data = await Artist.findOne({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('gagal melakukan pencarian artist teratas');
  }
});

router.get("/result/artist", async function (req, res) {
  const { name } = req.query;
  
  try {
   
    const matchingArtist = await Artist.findOne({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      }
    });
 
    const otherArtists = await Artist.findAll({
      where: {
        name: {
          [Op.notLike]: `%${name}%`
        }
      },
      order: Sequelize.literal('RAND()'),
      limit: 7
    });
    
    const data = matchingArtist ? [matchingArtist, ...otherArtists] : otherArtists;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for artist');
  }
});

module.exports = router;
