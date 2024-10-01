const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");

const Reported = require("../../models/Reported");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artist = require("../../models/Artist");

const router = express.Router();

router.get("/admin/reported", async function (req, res) {
 const { page, pageSize } = req.query;
  const limit = pageSize || 9;
  const offset = (page - 1) * limit || 0;

  try {
      const { rows, count } = await Reported.findAndCountAll({
      limit,
      offset,
      order: [[Sequelize.literal(`id_report`), "ASC"]],
    });
    return res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (error) {
    return res.status(400).send("Failed to get data reported" + error);
  }
});
router.get("/admin/report", async function (req, res) {
  const {id} = req.query;
  const data = await Reported.findOne({
      where: {
        id_report: {
          [Op.like] : id
        }
      }
    });
  try {
    
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).send("Failed to get data reported");
  }
});
router.put("/admin/block", async function (req, res) {
  const { id } = req.query;

  try {
    await Artist.update({ status: 0 }, {
      where: {
        id_artist: {
          [Op.like] : id
        }
      }
    });
    return res.status(200).json("Artist has been block");
  } catch (error) {
    return res.status(400).send("Failed to block artist");
  }
});
router.put("/admin/unblock", async function (req, res) {
  const { id } = req.query;

  try {
    await Artist.update({ status: 1 }, {
      where: {
        id_artist: {
          [Op.like]: id
        }
      }
    });
    return res.status(200).json("Artist was unblock");
  } catch (error) {
    return res.status(400).send("Failed to unblock artist");
  }
});
module.exports = router;
