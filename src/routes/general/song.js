
const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Genre = require("../../models/Category");
const Album = require("../../models/Album");
const Song = require("../../models/Song");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artist = require("../../models/Artist");

const router = express.Router();

router.get("/songs", async function (req, res) {
  const { page, pageSize } = req.query;
  const limit = pageSize || 6;
  const offset = (page - 1) * limit || 0;

  try {
    const { rows, count } = await Song.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_song`), "ASC"]],
      include: [
        {
          model: Artist,
          attributes: ["name"],
        },
      ],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (err) {
    return res.status(400).send("gagal memuat data");
  }
});

module.exports = router;