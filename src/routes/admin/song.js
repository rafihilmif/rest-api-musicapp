const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Category");

const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const JWT_KEY = 'makeblackmetalhateagain';
const fs = require('fs');

const router = express.Router();



module.exports = router;