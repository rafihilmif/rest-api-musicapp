const { response } = require("express");
const express = require("express");
const { Op, Sequelize } = require("sequelize");
const Fans = require("../../models/Fans");
const router = express.Router();

router.get("/account/fans", async function (req, res) {
  const dataAllFans = await Fans.findAll();
  return res.status(200).send({
    dataAllFans,
  });
});

module.exports = router;
