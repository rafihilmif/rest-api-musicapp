const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Fans = require("../../models/Fans");
const Category = require("../../models/Category");
const Merch = require("../../models/Merch");
const Ordered = require("../../models/Ordered");
const OrderItem = require("../../models/OrderedItem");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ImageMerch = require("../../models/ImageMerch");

const router = express.Router();

router.get("/admin/order", async function (req, res) {
     const { page, pageSize } = req.query;
  const limit = pageSize || 9;
  const offset = (page - 1) * limit || 0;
  try {
const { rows, count } = await Ordered.findAndCountAll({
          include: {
              model: Fans,
              attributes: ["email", "avatar", "username"]
        },
      limit,
      offset,
      order: [[Sequelize.literal(`id_order`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (error) {
    return res.status(400).send("Failed to get data order" + error);
  }
});
router.get("/admin/detail/order", async function (req, res) {
  const { id } = req.query;

  try {
    const data = await Ordered.findOne({
      where: {
        id_order: {
          [Op.like]: id
        }
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get order' });
  }
});
router.get("/admin/item/order", async function (req, res) {
  const { id } = req.query;
    try {       
     const data = await OrderItem.findAll({
            where: {
                id_order: {
                    [Op.like]: id
                }
            },
            include: [
                {
                    model: Merch,
                    attributes: ['name', 'price'],

                    include: [{
                        model: ImageMerch,
                        attributes: ['name'],
                        where: {
                            number: 1
                        }
                    }]
                }
            ]
    }); 
    res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ error: 'Failed to get item in ordeer' });
    }
});
module.exports = router;