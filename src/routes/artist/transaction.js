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

module.exports = router;
