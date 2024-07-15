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
router.get("/detail/fans", async function (req, res) {
  const { email } = req.query;
  const data = await Fans.findOne({
    where: {
      email: {
        [Op.like]: email,
      },
    },
    attributes: {
      exclude: ["password", "created_at", "status"],
    },
  });
  return res.status(200).json(data);
});
module.exports = router;
