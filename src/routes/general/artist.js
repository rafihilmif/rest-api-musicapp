const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const { func } = require("joi");

const router = express.Router();
router.get("/artists", async function (req, res) {
  try {
    const data = await Artist.findAll({
      where: {
        status: 1
      },
      limit: 6,
      order: Sequelize.literal('RAND()')
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("Failed to get data artist");
  }
});

router.get("/artist", async function (req, res) {
  const { id} = req.query;
  try {
   
    const data = await Artist.findOne({
      where: {
        id_artist: id
      }
    });
    if (!data) {
      return res.status(404).send("Artist not found");
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("Failed to load data");
  }
});

router.get("/result/top/artist", async function (req, res) {
  const { name } = req.query;
  try {
    const data = await Artist.findOne({
      where: {
        name: {
          [Op.like]: `%${name}%`
        },
        status: 1
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
        },
        status: 1
      }
    });
 
    const otherArtists = await Artist.findAll({
      where: {
        name: {
          [Op.notLike]: `%${name}%`
        },
        status: 1
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

router.get("/discover/artist/genre", async function (req, res) {
  const { id, name } = req.query;

  try {
    const data = await Artist.findAll({
      where: {
        id_artist: {
          [Op.notLike]: id
        },
        genre: name
      },
      limit: 7,
      order: Sequelize.literal('RAND()'),
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get data artist");
  }
});
module.exports = router;
