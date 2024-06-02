const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Artist = require("../../models/Artist");
const Category = require("../../models/Category");
const Merch = require("../../models/Merch");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

module.exports = router;
