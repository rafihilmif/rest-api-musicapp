const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const { func } = require("joi");

const router = express.Router();
router.get("/artists", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

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
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

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
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

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
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

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
      limit: 5
    });
    
    const data = matchingArtist ? [matchingArtist, ...otherArtists] : otherArtists;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for artist');
  }
});

router.get("/discover/artist/genre", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {name} = req.query;

  try {
    const userdata = jwt.verify(token, process.env.JWT_KEY);
    const data = await Artist.findAll({
      where: {
        id_artist: {
          [Op.notLike]: userdata.id_artist
        },
        genre: name,
        status: 1
      },
      limit: 7,
      order: Sequelize.literal('RAND()'),
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get data artist");
  }
});

router.get("/genre/artist", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const {name} = req.query;

  try {
    const data = await Artist.findAll({
      where: {
        genre: name,
        status: 1
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
