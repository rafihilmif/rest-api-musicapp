const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Category = require("../../models/Category");
const Merch = require("../../models/Merch");
const Transaction = require("../../models/Transaction");
const TransactionItem = require("../../models/TransactionItem");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();


router.get("/admin/transaction", async function (req, res) {
 const { page, pageSize } = req.query;
  const limit = pageSize || 9;
  const offset = (page - 1) * limit || 0;

  try {
      const { rows, count } = await Transaction.findAndCountAll({
          include: {
              model: Artist,
              attributes: ["email", "avatar", "username"]
        },
      limit,
      offset,
      order: [[Sequelize.literal(`id_transaction`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (error) {
    return res.status(400).send("Failed to get data transaction" + error);
  }
});
module.exports = router;
