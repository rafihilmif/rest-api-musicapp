const { response } = require("express");
const {configs} = require("dotenv").config();
const axios = require('axios');
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const midtransClient = require('midtrans-client');

const Fans = require("../../models/Fans");
const Merch = require("../../models/Merch");
const Order = require("../../models/Ordered");
const OrderItem = require("../../models/OrderedItem");
const Cart = require("../../models/Cart");
const CartItem = require("../../models/CartItem");
const ImageMerch = require("../../models/ImageMerch");
const OrderedItem = require("../../models/OrderedItem");

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
router.post('/fans/order/payment', async function (req, res) {
  const { id } = req.query;
  const { amount, address, courier, first_name, last_name, phone, email } = req.body; 

  const dataCart = await Cart.findOne({
    where: {
      id_fans: {
        [Op.like]: id
      }
    }
  });
  let newIdPrefixOrderPayment = "ORDRD";

  try {
    let highestIdEntryOrderPayment = await Order.findOne({
      where: {
        id_order: {
          [Op.like]: `${newIdPrefixOrderPayment}%`
        }
      },
      order: [['id_order', 'DESC']]
    });
      
    let newIdNumberOrderPayment = 1;
    if (highestIdEntryOrderPayment) {
      let highestIdOrderPayment = highestIdEntryOrderPayment.id_order;
      let numericPartOrderPayment = highestIdOrderPayment.replace(newIdPrefixOrderPayment, ''); 
      newIdNumberOrderPayment = parseInt(numericPartOrderPayment, 10) + 1;
    }
    let newIdOrderPayment = newIdPrefixOrderPayment + newIdNumberOrderPayment.toString().padStart(3, '0');
  
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

    await Order.create({
      id_order: newIdOrderPayment,
      id_fans: id,
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

    let newIdPrefixOrderItem = "ORDITM";

    let highestIdEntryOrderItem = await OrderedItem.findOne({
      where: {
        id_order_item: {
          [Op.like]: `${newIdPrefixOrderItem}%`
        }
      },
      order: [['id_order_item', 'DESC']]
    });

    let newIdNumberOrderItem = 1;;
    if (highestIdEntryOrderItem) {
      let highestIdOrderItem = highestIdEntryOrderItem.id_order_item;
      let numericPartOrderItem = highestIdOrderItem.replace(newIdPrefixOrderItem, '');;
      newIdNumberOrderItem = parseInt(numericPartOrderItem, 10) + 1;
    }
    let newIdOrderItem = newIdPrefixOrderItem + newIdNumberOrderItem.toString().padStart(3, '0');

    const cartItems = await CartItem.findAll({
      where: {
        id_cart: dataCart.id_cart
      }
    });

    const merchByArtist = await Merch.findAll({
      where: {
        id_merchandise : cartItems.id_merchandise 
      }
    });

    for (const cartItem of cartItems) {
      await OrderedItem.create({
        id_order_item: newIdOrderItem,
        id_order: newIdOrderPayment,
        id_merchandise: cartItem.id_merchandise,
        size: cartItem.size,
        qty: cartItem.qty,
        price: cartItem.price,
        created_at: Date.now()
      });
      newIdNumberOrderItem++;
      newIdOrderItem = newIdPrefixOrderItem + newIdNumberOrderItem.toString().padStart(3, '0');
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
          [Op.like]: id
        }
      }
    });
    
    res.status(200).json({ token: snapToken });
  } catch (error) {
    console.error('Midtrans transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});
module.exports = router;