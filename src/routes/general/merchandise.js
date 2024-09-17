const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Merch = require("../../models/Merch");
const Artist = require("../../models/Artist");
const Category = require("../../models/Category");
const { func } = require("joi");

const router = express.Router();

router.get("/collection/merchandise", async function (req, res) {
  const { id } = req.query;

  try {
    const data = await Merch.findAll({
      limit: 6,
      order: [[Sequelize.literal(`id_merchandise`), "ASC"]],
      where: {
        id_artist: {
          [Op.like]: id,
        },
      },
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
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data");
  }
});
router.get("/category", async function (req, res) {
  const { name } = req.query; 
  
  try {
    if (name) {
      const data = await Category.findAll({
        where: {
        name: {
      [Op.notLike]: name
      }
      }});
    return res.status(200).json(data);
    }
    else {
      const data = await Category.findAll();
    return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(400).json('gagal memuat data category');
  }
});
router.get("/detail/merchandise", async function (req, res) {
  const { id } = req.query;
  try {
    const data = await Merch.findOne({
      where: {
        id_merchandise: {
          [Op.like]: id,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data detail merchandise");
  }
});

router.get("/related/merchandise", async function (req, res) { 
  const { id } = req.query;

  try {
    const data = await Merch.findAll({
    where: {
      id_merchandise: {
      [Op.notLike]: id
      }
    },
    order: Sequelize.literal('RAND()'),
    limit: 10
    });
    
return res.json(data);
  } catch (error) {
    return res.status(400).send("gagal memuat data related merchandise");
  }
  
});
router.get("/result/merchandise", async function (req, res) {
  const { name } = req.query;
  
  try {
    const matchingMerchs = await Merch.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            name: {
              [Op.like]: `%${name}%`
            }
          }
        }
      ]
    });

    const randomMerchs = await Merch.findAll({
      include: [
        {
          model: Artist,
          attributes: ["name"],
          where: {
            name: {
              [Op.notLike]: `%${name}%`
            }
          }
        }
      ],
      order: Sequelize.literal('RAND()'), 
      limit: 6 - matchingMerchs.length 
    });

    const data = [...matchingMerchs, ...randomMerchs];
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send('Failed to search for merchandise');
  }
});
module.exports = router;
