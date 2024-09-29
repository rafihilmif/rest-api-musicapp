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
module.exports = router;