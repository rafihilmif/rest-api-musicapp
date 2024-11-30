const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Genre");

const router = express.Router();
const Joi = require("joi");
const Artist = require("../../models/Artist");
const Song = require("../../models/Song");

const checkGenre = async (name) => {
  const dataCheck = await Genre.findOne({
    where: {
      name: name
    },
  });
  if (dataCheck) {
    const error = new Error("Genre can't be duplicate");
    error.path = "name"; 
    throw error; 
  }
  return name; 
};

router.post("/admin/genre/add", async function (req, res) {
     const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  let { name } = req.body;

  const schema = Joi.object({
    name: Joi.string().external(checkGenre).required(),
  });
  
  try {
     await schema.validateAsync(req.body);
    let newIdPrefixGenre = "GNR";
    let highestIdEntryGenre = await Genre.findOne({
      where: {
        id_genre: {
          [Op.like]: `${newIdPrefixGenre}%`
        }
      },
      order: [['id_genre', 'DESC']]
    });
    let newIdNumberGenre = 1;
    if (highestIdEntryGenre) {
      let highestIdGenre = highestIdEntryGenre.id_genre;
      let numericPartGenre = highestIdGenre.replace(newIdPrefixGenre, ''); 
      newIdNumberGenre = parseInt(numericPartGenre, 10) + 1;
    }
  let newIdGenre = newIdPrefixGenre + newIdNumberGenre.toString().padStart(3, '0');
  await Genre.create({
    id_genre: newIdGenre,
    name: name,
    created_at: Date.now(),
  });
    return res.status(201).json({message:"Successfully added genre"});
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
});

router.get("/admin/choose/genre", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  try {
    const data = await Genre.findAll();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get genre" + error);
  }
});

router.get("/admin/genres", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  const { page, pageSize } = req.query;
  const limit = pageSize || 8;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Genre.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_genre`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
  return res.status(400).json("Failed to get all genre");
  }
});

router.get("/admin/genre", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  const { id } = req.query;
  try {
    const data = await Genre.findOne({
      where: {
        id_genre: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).json("Failed to get a genre");
  }
});

router.put("/admin/genre", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
     return res.status(401).json({ message: 'your are not admin' });
  }

  const { id } = req.query;
  const { name } = req.body;
  const data = await Genre.findByPk(id);
   await Artist.update({ genre: name}, { where: { genre: data.name } });
    await Song.update({ genre: name}, { where: { genre: data.name } });
    await Genre.update(req.body, {
      where: {
        id_genre: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json({message: "Successfully update genre"});
  try {
   
  } catch (error) {
    return res.status(400).json("Failed to update genre");
  }
});

router.delete("/admin/genre/delete", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const userdata = jwt.verify(token, process.env.JWT_KEY);
  
  if (userdata.role !== "admin") {
    return res.status(401).json({ message: 'your are not admin' });
  }

  const { id } = req.query;
  const data = await Genre.findByPk(id);
  
   
  try {
     if (!data) return res.status(404).json({ message: "Genre not found" });

    await Artist.update({ genre: "-" }, { where: { genre: data.name } });
    await Song.update({ genre: "-" }, { where: { genre: data.name } });
    await Genre.destroy({ where: { id_genre: id } });
      return res.status(200).json({message: "Successfully delete genre"});
  } catch (error) {
    return res.status(400).json("Failed to delete genre");
  }
});
module.exports = router;
