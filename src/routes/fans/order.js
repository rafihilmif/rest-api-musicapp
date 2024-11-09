
const jwt = require("jsonwebtoken");
const axios = require('axios');
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const midtransClient = require('midtrans-client');

const { v4: uuidv4 } = require('uuid');
const Merch = require("../../models/Merch");
const Ordered = require("../../models/Ordered");
const OrderedItem = require("../../models/OrderedItem");
const Cart = require("../../models/Cart");
const CartItem = require("../../models/CartItem");
const ImageMerch = require("../../models/ImageMerch");
const Transaction = require("../../models/Transaction");
const TransactionItem = require("../../models/TransactionItem");
const Merchandise = require("../../models/Merch");
const router = express.Router();

const snap = new midtransClient.Snap({
  isProduction: false, 
  serverKey: process.env.SERVER_KEY,
});
const coreClient = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.SERVER_KEY,
    clientKey: process.env.CLIENT_KEY
});

router.post('/fans/shipping/cost', async function (req, res) { 
    const { origin, destination, weight, courier } = req.body;
    try {
        const response = await axios.post(
            `https://api.rajaongkir.com/starter/cost`,
            { origin, destination, weight, courier },
            { headers: { key: process.env.RAJAONGKIR_API_KEY } }
        );
        if (response.data && response.data.rajaongkir && response.data.rajaongkir.results) {
            const costs = response.data.rajaongkir.results[0].costs;
            
            if (costs && costs.length > 0) {
                res.status(200).json(costs);
            } else {
                res.status(204).json({ message: 'No shipping costs available' });
            }
        } else {
            throw new Error('Unexpected API response structure');
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching shipping costs' });
    }
});
router.get('/shipping/province', async function (req, res) {
    try {
        const response = await axios.get(
            'https://api.rajaongkir.com/starter/province',
            {
                headers: {
                    key: process.env.RAJAONGKIR_API_KEY,
                    'content-type': 'application/x-www-form-urlencoded',
                },
            }
        );
        const data = response.data;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching provinces:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching provinces', details: error.response ? error.response.data : error.message });
    }
});
router.get('/shipping/city', async function (req, res) {
    const { province_id } = req.query;
    try {
        const response = await axios.get(
            `https://api.rajaongkir.com/starter/city?province=${province_id}`,

            {
                headers: {
                key: process.env.RAJAONGKIR_API_KEY,
                    'content-type': 'application/x-www-form-urlencoded',
                },
            }
        );
        const data = response.data;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching shipping cost:', error);
        res.status(500).json({ error: 'An error occurred while fetching shipping cost' });
    }
});
router.post('/fans/order', async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const { amount, address, courier, first_name, last_name, phone, email } = req.body; 

  const dataCart = await Cart.findOne({
    where: {
     id_fans: userdata.id_fans
    }
  });

  try {
    
    let newIdOrderPayment = uuidv4().replace(/-/g, '').substring(0, 7);
  
    const transactionDetails = {
      transaction_details: {
        order_id: newIdOrderPayment,
        gross_amount: parseInt(amount, 10),
      },
      customer_details: {
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone: phone  
      },
    };
    
    const transaction = await snap.createTransaction(transactionDetails);
    const snapToken = transaction.token;

    const data = await Ordered.create({
      id_order: newIdOrderPayment,
      id_fans: userdata.id_fans,
      email: email,
      first_name: first_name,
      last_name: last_name,
      address: address,
      courier: courier,
      phone: phone,
      total: parseInt(amount, 10),
      status: "Pending",
      created_at: Date.now()
    });

    let newIdPrefixOrderItem = "OREDRITM";

    let highestIdEntryOrderItem = await OrderedItem.findOne({
      where: {
        id_order_item: {
          [Op.like]: `${newIdPrefixOrderItem}%`
        }
      },
      order: [['id_order_item', 'DESC']]
    });

    let newIdNumberOrderItem = 1;
    if (highestIdEntryOrderItem) {
      let highestIdOrderItem = highestIdEntryOrderItem.id_order_item;
      let numericPartOrderItem = highestIdOrderItem.replace(newIdPrefixOrderItem, '');
      newIdNumberOrderItem = parseInt(numericPartOrderItem, 10) + 1;
    }
    let newIdOrderItem = newIdPrefixOrderItem + newIdNumberOrderItem.toString().padStart(3, '0');

    const cartItems = await CartItem.findAll({
      where: {
        id_cart: dataCart.id_cart
      },
      include: [
        {
          model: Merch,
        }
      ]
    });

    for (const cartItem of cartItems) {
      await OrderedItem.create({
        id_order_item: newIdOrderItem,
        id_order: newIdOrderPayment,
        id_merchandise: cartItem.id_merchandise,
        size: cartItem.size,
        qty: cartItem.qty,
        created_at: Date.now()
      });
      newIdNumberOrderItem++;
      newIdOrderItem = newIdPrefixOrderItem + newIdNumberOrderItem.toString().padStart(3, '0');
    }

    let artistIds = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const artistId = cartItem.Merchandise.id_artist;
      if (!artistIds.includes(artistId)) {
        artistIds.push(artistId);

        let newIdPrefixTransaction = "TRS";

        let highestIdEntryTransaction = await Transaction.findOne({
          where: {
            id_transaction: {
              [Op.like]: `${newIdPrefixTransaction}%`
            }
          },
          order: [['id_transaction', 'DESC']]
        });

        let newIdNumberTransaction = 1;
        if (highestIdEntryTransaction) {
          let highestIdTransaction = highestIdEntryTransaction.id_transaction;
          let numericPartTransaction = highestIdTransaction.replace(newIdPrefixTransaction, '');
          newIdNumberTransaction = parseInt(numericPartTransaction, 10) + 1;
        }
        let newIdTransaction = newIdPrefixTransaction + newIdNumberTransaction.toString().padStart(3, '0');

        totalAmount = 0;
        for (const item of cartItems) {
          if (item.Merchandise.id_artist === artistId) {
            totalAmount += item.qty * item.Merchandise.price;
          }
        }

        await Transaction.create({
          id_transaction: newIdTransaction,
          id_artist: artistId,
          id_order: newIdOrderPayment,
          name: `${first_name} ${last_name}`,
          total: totalAmount,
          address: address,
          courier: courier,
          status: "Pending",
          created_at: Date.now()
        });

        let newIdPrefixTransactionItem = "TRSITM";

        let highestIdEntryTransactionItem = await TransactionItem.findOne({
          where: {
            id_transaction_item: {
              [Op.like]: `${newIdPrefixTransactionItem}%`
            }
          },
          order: [['id_transaction_item', 'DESC']]
        });

        let newIdNumberTransactionItem = 1;
        if (highestIdEntryTransactionItem) {
          let highestIdTransactionItem = highestIdEntryTransactionItem.id_transaction_item;
          let numericPartTransactionItem = highestIdTransactionItem.replace(newIdPrefixTransactionItem, '');
          newIdNumberTransactionItem = parseInt(numericPartTransactionItem, 10) + 1;
        }

        for (const item of cartItems) {
          if (item.Merchandise.id_artist === artistId) {
            let newIdTransactionItem = newIdPrefixTransactionItem + newIdNumberTransactionItem.toString().padStart(3, '0');

            await TransactionItem.create({
              id_transaction_item: newIdTransactionItem,
              id_transaction: newIdTransaction,
              id_merchandise: item.id_merchandise,
              size: item.size,
              qty: item.qty,
              created_at: Date.now()
            });

            newIdNumberTransactionItem++;
          }
        }
      }
    }
    await CartItem.destroy({
      where: {
        id_cart: {
          [Op.like] : dataCart.id_cart
        }
      }
    });

    await Cart.destroy({
      where: {
        id_fans: {
          [Op.like]: userdata.id_fans
        }
      }
    });
    
    res.status(200).json({ token: snapToken});
  } catch (error) {
    console.error('Midtrans transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.get("/fans/order", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const {page, pageSize, timeFilter} = req.query;
  const limit = pageSize || 9;
  const offset = (page - 1) * limit || 0;
  
  const currentDate = new Date();
    let whereClause = {
        id_fans: userdata.id_fans
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
  const { rows, count } = await Ordered.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[Sequelize.literal(`created_at`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to get order' });
  }
});

router.get("/fans/detail/order", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }

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

router.get("/fans/item/order", async function (req, res) {
   const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const { id } = req.query;
    try {       
     const data = await OrderedItem.findAll({
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
router.get("/fans/order/confirm/payment", async function (req, res) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
        return res.status(401).json({ message: 'No token provided' });
  }
  
  const userdata = jwt.verify(token, process.env.JWT_KEY);

  const { idOrderPayment} = req.query;
  try {
    const checkPayment = await Ordered.findOne({
      where: {
        id_order: idOrderPayment
      }
    });

    if (!checkPayment) {
      return res.status(400).json({ error: 'Failed to get order payment' });
    }
    const response = await coreClient.transaction.status(checkPayment.id_order);

    if (response.transaction_status !== 'settlement') {
      return res.json(response);
    }

    await Ordered.update(
      { status: "Settlement" },
      {
        where: {
          id_order: checkPayment.id_order,
          id_fans: userdata.id_fans
        }
      }
    );

    const checkItemOrder = await OrderedItem.findAll({
      where: {
        id_order: checkPayment.id_order
      }
    });

    for (const itemOrder of checkItemOrder) {
      const merch = await Merchandise.findOne({
        where: {
          id_merchandise: itemOrder.id_merchandise
        }
      });
      if (!merch) {
        return res.status(400).json({ error: `Merchandise not found for ID: ${itemOrder.id_merchandise}` });
      }
      if (itemOrder.size !== null) {
        const sizeField = itemOrder.size.toLowerCase();
      if (!['s', 'm', 'l', 'xl'].includes(sizeField)) {
        return res.status(400).json({ error: `Unknown size: ${itemOrder.size}` });
      }

      const newSizeStock = merch[sizeField] - itemOrder.qty;
      if (newSizeStock < 0) {
        return res.status(400).json({ error: `Insufficient stock for size ${itemOrder.size.toUpperCase()}` });
      }

      const newStock = merch.stock - itemOrder.qty;
      
      await Merchandise.update(
        { 
          [sizeField]: newSizeStock, 
          stock: newStock 
        },
        { 
          where: { id_merchandise: itemOrder.id_merchandise }
        }
      );
      }
      else {
      const newStock = merch.stock - itemOrder.qty;
      await Merchandise.update(
        { 
          stock: newStock 
        },
        { 
          where: { id_merchandise: itemOrder.id_merchandise }
        }
      );
      }
    }
    await Transaction.update({
      status: "Settlement"
    },{
      where: {
        id_order: {
          [Op.like] : checkPayment.id_order
        }
      }
    });
    res.json({ ...response, stockUpdated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;