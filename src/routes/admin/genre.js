const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Genre");

const router = express.Router();
const Joi = require("joi");

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
  try {
    const data = await Genre.findAll();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json("Failed to get genre" + error);
  }
});
router.get("/admin/genres", async function (req, res) {
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
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/admin/genre", async function (req, res) {
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
    return res.status(404).send("data tidak ditemukan");
  }
});
router.put("/admin/genre", async function (req, res) {
  const { id } = req.query;
  try {
    await Genre.update(req.body, {
      where: {
        id_genre: {
          [Op.like]: id,
        },
      },
    });
    return res.status(201).send("Data berhasil diubah");
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});

module.exports = router;
