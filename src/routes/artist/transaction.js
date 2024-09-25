const { response } = require("express");
const {configs} = require("dotenv").config();
const axios = require('axios');
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const midtransClient = require('midtrans-client');

const Transaction = require("../../models/Transaction");
const TransactionItem = require("../../models/TransactionItem");
const Merch = require("../../models/Merch");
const ImageMerch = require("../../models/ImageMerch");

const router = express.Router();
router.get("/artist/transaction", async function (req, res) {
    const { id, pageSize, page } = req.query;
    const limit = pageSize || 12;
    const offset = (page - 1) * limit || 0;
   
  try {
      const { rows, count } = await Transaction.findAndCountAll({
          where: {
              id_artist: id,
          },
          limit,
          offset,
          order: [[Sequelize.literal(`created_at`), "ASC"]],
      })
      return res.status(200).json({
          data: rows,
          total: count,
      })
    } catch (error) {
    res.status(400).json({ error: 'Failed to get transaction' });
    }
});

router.get("/artist/detail/transaction", async function (req, res) {
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
router.get("/artist/item/transaction", async function (req, res) {
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
