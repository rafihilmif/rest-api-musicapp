const jwt = require("jsonwebtoken");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Transaction = require("../../models/Transaction");
const TransactionItem = require("../../models/TransactionItem");
const Merch = require("../../models/Merch");
const ImageMerch = require("../../models/ImageMerch");

const router = express.Router();

router.get("/artist/transaction", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userdata = jwt.verify(token, process.env.JWT_KEY);

    const {pageSize, page, timeFilter } = req.query;
    const limit = pageSize || 9;
    const offset = (page - 1) * limit || 0;
    
    const currentDate = new Date();
    let whereClause = {
        id_artist: userdata.id_artist
    };

    switch (timeFilter) {
        case 'this month':
            whereClause.created_at = {
                [Op.gte]: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                [Op.lte]: currentDate
            };
            break;
        case 'last 3 months':
            whereClause.created_at = {
                [Op.gte]: new Date(currentDate.setMonth(currentDate.getMonth() - 3)),
                [Op.lte]: new Date()
            };
            break;
        case 'last 6 months':
            whereClause.created_at = {
                [Op.gte]: new Date(currentDate.setMonth(currentDate.getMonth() - 6)),
                [Op.lte]: new Date()
            };
            break;   
        default:
            break;
    }

    try {
        const { rows, count } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[Sequelize.literal('created_at'), 'ASC']],
        });
        
        return res.status(200).json({
            data: rows,
            total: count,
        });
    } catch (error) {
        console.error('Transaction fetch error:', error);
        res.status(400).json({ error: 'Failed to get transaction' });
    }
});

router.get("/artist/detail/transaction", async function (req, res) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

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
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

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
        return res.status(400).send('Failed to get item transaction');
    }
});
router.get("/artist/merchandise/sales", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const userdata = jwt.verify(token, process.env.JWT_KEY);

        const data = await Merch.findAll({
            where: {
                id_artist: userdata.id_artist
            },
            include: [
                {
                    model: TransactionItem,
                    attributes: []
                }
            ],
            attributes: [
                'id_merchandise',
                'name',
                'price',
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('TransactionItems.qty')), 0), 'totalSold']
            ],
            group: ['id_merchandise', 'name', 'price'],
            raw: true,
            nest: true,
        });

        const formattedData = data.map(item => ({
            id_merchandise: item.id_merchandise,
            name: item.name,
            price: item.price,
            totalSold: parseInt(item.totalSold) || 0,
            totalRevenue: (item.price * (parseInt(item.totalSold) || 0))
        }));

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error:', error);
        return res.status(400).json("Failed to get each merchandise sales");
    }
});
router.get("/artist/total/revenue", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const userdata = jwt.verify(token, process.env.JWT_KEY);

        const data = await Transaction.sum('total', {
            where: {
                id_artist: userdata.id_artist
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json("Failed to get total revenue");
    }
});

router.get("/artist/total/merchandise/sales", async function (req, res) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const userdata = jwt.verify(token, process.env.JWT_KEY);
        const data = await Transaction.findAll({
            where: {
                id_artist: userdata.id_artist
            },
            include: [{
                model: TransactionItem,
                attributes: []
            }],
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('TransactionItems.qty')), 'totalQuantity']
            ],
            raw: true
        });

        const totalQty = data[0].totalQuantity || 0;
        return res.status(200).json(totalQty);
    } catch (error) {
        console.error('Error:', error);
        return res.status(400).json("Failed to get total merchandise sales");
    }
});
module.exports = router;
