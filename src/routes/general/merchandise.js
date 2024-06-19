const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Merch = require("../../models/Merch");
const { func } = require("joi");
const Category = require("../../models/Category");

const router = express.Router();

router.get("/collection/merchandise", async function (req, res) {
  const { id} = req.query;

  try {
    const data = await Merch.findAll({
      limit: 6,
        order: [[Sequelize.literal(`id_merchandise`), "ASC"]],
        where: {
            id_artist: {
              [Op.like] :id
          }
      }
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});

router.get("/merchandise", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Merch.findOne({
      where: {
        id_artist: {
          [Op.like]: id
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/category", async function (req, res) {
   const data = await Category.findAll({});
    return res.status(200).json(data);
  // try {
   
  // } catch (error) {
  //   return res.status(400).send("gagal memuat data");
  // }
});

module.exports = router;
