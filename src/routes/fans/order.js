const { response } = require("express");
const {configs} = require("dotenv").config();
const axios = require('axios');
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const Merch = require("../../models/Merch");
const Cart = require("../../models/Cart");
const CartItem = require("../../models/CartItem");
const ImageMerch = require("../../models/ImageMerch");

const router = express.Router();

router.post('/fans/shipping/cost', async function (req, res) { 
    const { origin, destination, weight, courier } = req.body;
    console.log(destination);
    try {
        const response = await axios.post(
            `https://api.rajaongkir.com/starter/cost`,
            { origin, destination, weight, courier },
            { headers: { key: process.env.RAJAONGKIR_API_KEY } }
        );

        console.log('API response:', JSON.stringify(response.data, null, 2));

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

module.exports = router;