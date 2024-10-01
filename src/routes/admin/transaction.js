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
const ImageMerch = require("../../models/ImageMerch");

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
router.get("/admin/detail/transaction", async function (req, res) {
    const { id } = req.query;

    try {
         const data = await Transaction.findOne({
        where: {
            id_transaction: {
                [Op.like] : id
            }
        }
         });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ error: 'Failed to get detail transaction' });
    }
});
router.get("/admin/item/transaction", async function (req, res) {
    const { id } = req.query;
     
    try {       
        const data = await TransactionItem.findAll({
            where: {
                id_transaction: {
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
        return res.status(400).send('gagal memuat data cart');
    }
});
module.exports = router;
